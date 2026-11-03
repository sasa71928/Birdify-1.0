-- ============================================================================
-- Migración 07: Rediseño Integral de Chat, Rendimiento, Reacciones y Grupos
-- ============================================================================
-- Resuelve:
--   - AUD-CHAT-01: Índice compuesto en messages (conversation_id, created_at DESC, id DESC).
--   - AUD-CHAT-02: Tabla message_reactions con RLS y Realtime.
--   - AUD-CHAT-03: RPC get_chat_bootstrap() que reduce 6-8 viajes de red iniciales a 1.
--   - AUD-CHAT-04: RPC get_conversation_messages() con paginación keyset, joins de sender/reply y reacciones.
--   - AUD-CHAT-05: RPC delete_message_for_everyone() para eliminar mensaje con tombstone.
--   - AUD-CHAT-06: Corrección a get_user_conversations_summary() (ordenar antes de paginar).
--   - AUD-CHAT-07: RPC transaccional update_group() para gestión atómica de miembros.
--   - AUD-CHAT-08: Dimensiones image_width e image_height para evitar saltos visuales en el chat.
-- ============================================================================

-- ============================================================================
-- BLOQUE A: Ejecución fuera de transacción (PostgreSQL no permite CONCURRENTLY en bloque transaccional)
-- ============================================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conv_created_id
  ON public.messages (conversation_id, created_at DESC, id DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_deleted_for
  ON public.messages USING gin (deleted_for);


-- ============================================================================
-- BLOQUE B: Modificaciones de esquema, tabla de reacciones y RPCs
-- ============================================================================
BEGIN;

-- 1. COLUMNAS DE DIMENSIÓN DE IMÁGENES
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS image_width  integer,
  ADD COLUMN IF NOT EXISTS image_height integer;

-- 2. TABLA DE REACCIONES
CREATE TABLE IF NOT EXISTS public.message_reactions (
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  emoji      text NOT NULL CHECK (char_length(emoji) BETWEEN 1 AND 16),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user    ON public.message_reactions(user_id);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "message_reactions_select" ON public.message_reactions;
CREATE POLICY "message_reactions_select" ON public.message_reactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "message_reactions_insert" ON public.message_reactions;
CREATE POLICY "message_reactions_insert" ON public.message_reactions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "message_reactions_update" ON public.message_reactions;
CREATE POLICY "message_reactions_update" ON public.message_reactions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "message_reactions_delete" ON public.message_reactions;
CREATE POLICY "message_reactions_delete" ON public.message_reactions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Configurar réplica completa para Realtime
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;

-- Agregar a publicación de Supabase Realtime si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'message_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
  END IF;
END $$;


-- 3. RPC BOOTSTRAP DE CONVERSACIÓN (Reduce 6-8 llamadas secuenciales a 1 sola)
CREATE OR REPLACE FUNCTION public.get_chat_bootstrap(p_conversation_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid;
  v_is_member boolean;
  v_conv record;
  v_members jsonb;
  v_my_role text;
  v_last_read_id uuid;
  v_unread_count bigint;
  v_first_unread_id uuid;
  v_other_user_id uuid;
  v_blocked_by_me boolean := false;
  v_blocked_me boolean := false;
  v_result jsonb;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;

  -- Verificar membresía
  SELECT cm.role INTO v_my_role
  FROM public.conversation_members cm
  WHERE cm.conversation_id = p_conversation_id
    AND cm.user_id = v_uid;

  IF v_my_role IS NULL THEN
    RAISE EXCEPTION 'No tienes acceso a esta conversación.';
  END IF;

  -- Datos de la conversación
  SELECT id, name, description, avatar_url, is_group, created_by, created_at
  INTO v_conv
  FROM public.conversations
  WHERE id = p_conversation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversación no encontrada.';
  END IF;

  -- Miembros de la conversación
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', u.id,
      'username', u.username,
      'fullname', u.fullname,
      'profile_pic_url', u.profile_pic_url,
      'role', cm.role
    )
  )
  INTO v_members
  FROM public.conversation_members cm
  JOIN public.users u ON u.id = cm.user_id
  WHERE cm.conversation_id = p_conversation_id;

  -- En chat 1:1, detectar otro usuario y bloqueos bidireccionales
  IF NOT v_conv.is_group THEN
    SELECT cm.user_id INTO v_other_user_id
    FROM public.conversation_members cm
    WHERE cm.conversation_id = p_conversation_id
      AND cm.user_id != v_uid
    LIMIT 1;

    IF v_other_user_id IS NOT NULL THEN
      v_blocked_by_me := EXISTS (
        SELECT 1 FROM public.user_blocks
        WHERE blocker_id = v_uid AND blocked_id = v_other_user_id
      );
      v_blocked_me := EXISTS (
        SELECT 1 FROM public.user_blocks
        WHERE blocker_id = v_other_user_id AND blocked_id = v_uid
      );
    END IF;
  END IF;

  -- Estado de lectura
  SELECT last_read_message_id INTO v_last_read_id
  FROM public.conversation_member_states
  WHERE conversation_id = p_conversation_id
    AND user_id = v_uid;

  -- Conteo de no leídos y primer mensaje no leído
  IF v_last_read_id IS NULL THEN
    SELECT count(*)::bigint, (
      SELECT m_first.id
      FROM public.messages m_first
      WHERE m_first.conversation_id = p_conversation_id
        AND m_first.sender_id != v_uid
        AND NOT (COALESCE(m_first.deleted_for, '{}'::uuid[]) @> ARRAY[v_uid])
      ORDER BY m_first.created_at ASC
      LIMIT 1
    )
    INTO v_unread_count, v_first_unread_id
    FROM public.messages m
    WHERE m.conversation_id = p_conversation_id
      AND m.sender_id != v_uid
      AND NOT (COALESCE(m.deleted_for, '{}'::uuid[]) @> ARRAY[v_uid]);
  ELSE
    SELECT count(*)::bigint, (
      SELECT m_first.id
      FROM public.messages m_first
      WHERE m_first.conversation_id = p_conversation_id
        AND m_first.sender_id != v_uid
        AND NOT (COALESCE(m_first.deleted_for, '{}'::uuid[]) @> ARRAY[v_uid])
        AND m_first.created_at > (SELECT created_at FROM public.messages WHERE id = v_last_read_id)
      ORDER BY m_first.created_at ASC
      LIMIT 1
    )
    INTO v_unread_count, v_first_unread_id
    FROM public.messages m
    WHERE m.conversation_id = p_conversation_id
      AND m.sender_id != v_uid
      AND NOT (COALESCE(m.deleted_for, '{}'::uuid[]) @> ARRAY[v_uid])
      AND m.created_at > (SELECT created_at FROM public.messages WHERE id = v_last_read_id);
  END IF;

  v_result := jsonb_build_object(
    'conversation', jsonb_build_object(
      'id', v_conv.id,
      'name', v_conv.name,
      'description', v_conv.description,
      'avatar_url', v_conv.avatar_url,
      'is_group', v_conv.is_group,
      'created_by', v_conv.created_by,
      'created_at', v_conv.created_at
    ),
    'members', COALESCE(v_members, '[]'::jsonb),
    'my_role', v_my_role,
    'other_user_id', v_other_user_id,
    'last_read_message_id', v_last_read_id,
    'unread_count', COALESCE(v_unread_count, 0),
    'first_unread_message_id', v_first_unread_id,
    'blocked_by_me', v_blocked_by_me,
    'blocked_me', v_blocked_me
  );

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_chat_bootstrap(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_chat_bootstrap(uuid) TO authenticated;


-- 4. RPC MENSAJES PAGINADOS CON JOINS Y REACCIONES (1 viaje de red por página)
CREATE OR REPLACE FUNCTION public.get_conversation_messages(
  p_conversation_id uuid,
  p_before_created_at timestamp with time zone DEFAULT NULL,
  p_before_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  conversation_id uuid,
  sender_id uuid,
  content text,
  image_url text,
  image_width integer,
  image_height integer,
  reply_to_id uuid,
  created_at timestamp with time zone,
  is_deleted boolean,
  sender jsonb,
  reply_to jsonb,
  reactions jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_limit integer := LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;

  RETURN QUERY
  WITH batch AS (
    SELECT m.id, m.conversation_id, m.sender_id, m.content, m.image_url,
           m.image_width, m.image_height, m.reply_to_id, m.created_at, m.is_deleted
    FROM public.messages m
    WHERE m.conversation_id = p_conversation_id
      AND NOT (COALESCE(m.deleted_for, '{}'::uuid[]) @> ARRAY[v_uid])
      AND (
        p_before_created_at IS NULL
        OR (m.created_at, m.id) < (p_before_created_at, p_before_id)
      )
    ORDER BY m.created_at DESC, m.id DESC
    LIMIT v_limit
  )
  SELECT
    b.id,
    b.conversation_id,
    b.sender_id,
    CASE WHEN b.is_deleted THEN NULL ELSE b.content END AS content,
    CASE WHEN b.is_deleted THEN NULL ELSE b.image_url END AS image_url,
    CASE WHEN b.is_deleted THEN NULL ELSE b.image_width END AS image_width,
    CASE WHEN b.is_deleted THEN NULL ELSE b.image_height END AS image_height,
    b.reply_to_id,
    b.created_at,
    COALESCE(b.is_deleted, false) AS is_deleted,
    jsonb_build_object(
      'id', u.id,
      'username', u.username,
      'fullname', u.fullname,
      'profile_pic_url', u.profile_pic_url
    ) AS sender,
    CASE
      WHEN rm.id IS NOT NULL THEN jsonb_build_object(
        'id', rm.id,
        'content', CASE WHEN rm.is_deleted THEN NULL ELSE rm.content END,
        'image_url', CASE WHEN rm.is_deleted THEN NULL ELSE rm.image_url END,
        'sender_name', COALESCE(ru.fullname, ru.username, 'Usuario')
      )
      ELSE NULL
    END AS reply_to,
    COALESCE(rx.reactions_json, '[]'::jsonb) AS reactions
  FROM batch b
  JOIN public.users u ON u.id = b.sender_id
  LEFT JOIN public.messages rm ON rm.id = b.reply_to_id
  LEFT JOIN public.users ru ON ru.id = rm.sender_id
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'emoji', mr.emoji,
        'count', mr.emoji_count,
        'mine', mr.has_mine
      )
    ) AS reactions_json
    FROM (
      SELECT
        sub.emoji,
        count(*)::integer AS emoji_count,
        bool_or(sub.user_id = v_uid) AS has_mine
      FROM public.message_reactions sub
      WHERE sub.message_id = b.id
      GROUP BY sub.emoji
    ) mr
  ) rx ON true
  ORDER BY b.created_at ASC, b.id ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_conversation_messages(uuid, timestamp with time zone, uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_conversation_messages(uuid, timestamp with time zone, uuid, integer) TO authenticated;


-- 5. RPC ELIMINAR MENSAJE PARA TODOS (Tombstone)
CREATE OR REPLACE FUNCTION public.delete_message_for_everyone(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_sender_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;

  SELECT sender_id INTO v_sender_id
  FROM public.messages
  WHERE id = p_message_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mensaje no encontrado.';
  END IF;

  IF v_sender_id != v_uid THEN
    RAISE EXCEPTION 'Solo puedes eliminar tus propios mensajes para todos.';
  END IF;

  UPDATE public.messages
  SET is_deleted = true,
      content = NULL,
      image_url = NULL,
      image_width = NULL,
      image_height = NULL
  WHERE id = p_message_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_message_for_everyone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_message_for_everyone(uuid) TO authenticated;


-- 6. CORRECCIÓN A get_user_conversations_summary (Ordenar por último mensaje ANTES del LIMIT/OFFSET)
CREATE OR REPLACE FUNCTION public.get_user_conversations_summary(
  p_limit integer DEFAULT 30,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  conversation jsonb,
  last_message jsonb,
  unread_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_limit integer := GREATEST(COALESCE(p_limit, 30), 1);
  v_offset integer := GREATEST(COALESCE(p_offset, 0), 0);
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;

  RETURN QUERY
  WITH conv_with_last AS (
    SELECT
      c.id AS conv_id,
      c.name AS conv_name,
      c.description AS conv_description,
      c.avatar_url AS conv_avatar_url,
      c.is_group AS conv_is_group,
      c.created_by AS conv_created_by,
      c.created_at AS conv_created_at,
      lm.last_created_at,
      lm.msg_json AS last_msg_json
    FROM public.conversation_members cm
    JOIN public.conversations c ON c.id = cm.conversation_id
    LEFT JOIN LATERAL (
      SELECT
        m.created_at AS last_created_at,
        jsonb_build_object(
          'id', m.id,
          'conversation_id', m.conversation_id,
          'sender_id', m.sender_id,
          'content', CASE WHEN m.is_deleted THEN NULL ELSE m.content END,
          'image_url', CASE WHEN m.is_deleted THEN NULL ELSE m.image_url END,
          'created_at', m.created_at,
          'is_deleted', COALESCE(m.is_deleted, false),
          'sender', CASE
            WHEN su.id IS NOT NULL THEN jsonb_build_object(
              'username', su.username,
              'fullname', su.fullname
            )
            ELSE NULL
          END
        ) AS msg_json
      FROM public.messages m
      LEFT JOIN public.users su ON su.id = m.sender_id
      WHERE m.conversation_id = c.id
        AND NOT (COALESCE(m.deleted_for, '{}'::uuid[]) @> ARRAY[v_uid])
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT 1
    ) lm ON true
    WHERE cm.user_id = v_uid
      AND (
        c.is_group = true
        OR NOT EXISTS (
          SELECT 1
          FROM public.conversation_members cm_other
          WHERE cm_other.conversation_id = c.id
            AND cm_other.user_id != v_uid
            AND public.is_blocked(v_uid, cm_other.user_id)
        )
      )
    ORDER BY lm.last_created_at DESC NULLS LAST, c.created_at DESC
    LIMIT v_limit
    OFFSET v_offset
  )
  SELECT
    jsonb_build_object(
      'id', cwl.conv_id,
      'name', cwl.conv_name,
      'description', cwl.conv_description,
      'avatar_url', cwl.conv_avatar_url,
      'is_group', cwl.conv_is_group,
      'created_by', cwl.conv_created_by,
      'created_at', cwl.conv_created_at,
      'members', COALESCE(mem.members_json, '[]'::jsonb)
    ) AS conversation,
    cwl.last_msg_json AS last_message,
    COALESCE(uc.cnt, 0) AS unread_count
  FROM conv_with_last cwl
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'conversation_id', cm2.conversation_id,
        'user_id', cm2.user_id,
        'joined_at', cm2.joined_at,
        'role', cm2.role,
        'users', CASE
          WHEN u.id IS NOT NULL THEN jsonb_build_object(
            'id', u.id,
            'username', u.username,
            'fullname', u.fullname,
            'profile_pic_url', u.profile_pic_url
          )
          ELSE NULL
        END
      )
    ) AS members_json
    FROM public.conversation_members cm2
    LEFT JOIN public.users u ON u.id = cm2.user_id
    WHERE cm2.conversation_id = cwl.conv_id
  ) mem ON true
  LEFT JOIN public.conversation_member_states cms
    ON cms.conversation_id = cwl.conv_id AND cms.user_id = v_uid
  LEFT JOIN public.messages lrm
    ON lrm.id = cms.last_read_message_id
  LEFT JOIN LATERAL (
    SELECT count(*)::bigint AS cnt
    FROM public.messages m2
    WHERE m2.conversation_id = cwl.conv_id
      AND m2.sender_id != v_uid
      AND NOT (COALESCE(m2.deleted_for, '{}'::uuid[]) @> ARRAY[v_uid])
      AND (lrm.created_at IS NULL OR m2.created_at > lrm.created_at)
  ) uc ON true
  ORDER BY cwl.last_created_at DESC NULLS LAST, cwl.conv_created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_conversations_summary(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_conversations_summary(integer, integer) TO authenticated;


-- 7. RPC TRANSACCIONAL update_group() PARA MODIFICACIONES ATÓMICAS DE GRUPO
CREATE OR REPLACE FUNCTION public.update_group(
  p_conversation_id uuid,
  p_name text,
  p_description text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL,
  p_add_member_ids uuid[] DEFAULT '{}',
  p_remove_member_ids uuid[] DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_is_group boolean;
  v_uid_to_add uuid;
  v_uid_to_remove uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;

  SELECT is_group INTO v_is_group
  FROM public.conversations
  WHERE id = p_conversation_id;

  IF NOT FOUND OR NOT v_is_group THEN
    RAISE EXCEPTION 'Grupo no encontrado o no es una conversación grupal.';
  END IF;

  SELECT role INTO v_role
  FROM public.conversation_members
  WHERE conversation_id = p_conversation_id
    AND user_id = v_uid;

  IF v_role != 'admin' THEN
    RAISE EXCEPTION 'Solo los administradores pueden editar este grupo.';
  END IF;

  -- Actualizar metadata
  UPDATE public.conversations
  SET name = COALESCE(NULLIF(trim(p_name), ''), name),
      description = p_description,
      avatar_url = COALESCE(p_avatar_url, avatar_url)
  WHERE id = p_conversation_id;

  -- Añadir miembros
  IF p_add_member_ids IS NOT NULL AND array_length(p_add_member_ids, 1) > 0 THEN
    FOREACH v_uid_to_add IN ARRAY p_add_member_ids LOOP
      INSERT INTO public.conversation_members (conversation_id, user_id, role)
      VALUES (p_conversation_id, v_uid_to_add, 'member')
      ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END LOOP;
  END IF;

  -- Quitar miembros (no se puede auto-remover el admin aquí, debe usar leaveConversation)
  IF p_remove_member_ids IS NOT NULL AND array_length(p_remove_member_ids, 1) > 0 THEN
    FOREACH v_uid_to_remove IN ARRAY p_remove_member_ids LOOP
      IF v_uid_to_remove != v_uid THEN
        DELETE FROM public.conversation_members
        WHERE conversation_id = p_conversation_id
          AND user_id = v_uid_to_remove;
      END IF;
    END LOOP;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.update_group(uuid, text, text, text, uuid[], uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_group(uuid, text, text, text, uuid[], uuid[]) TO authenticated;

COMMIT;

