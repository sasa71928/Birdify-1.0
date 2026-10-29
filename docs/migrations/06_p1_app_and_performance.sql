-- ============================================================================
-- Migración 06: Fase P1 — Storage de Chat, Rendimiento N+1, Moderación y Borrado
-- ============================================================================
-- Resuelve:
--   - AUD-010: Bucket privado 'chat-images' y políticas RLS por membresía de chat.
--   - AUD-012: RPC get_user_conversations_summary() (elimina descarga total de messages y N+1).
--   - AUD-017: Limpieza de archivos en Storage al eliminar cuenta (delete_user) y RLS en reports.
--   - AUD-019: Límites de tamaño (5 MB) y MIME types permitidos en buckets de imágenes.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. BUCKETS DE STORAGE CON LÍMITES DE TAMAÑO Y MIME TYPES (AUD-010, AUD-019)
-- ----------------------------------------------------------------------------
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('Sightings', 'Sightings', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('sightings', 'sightings', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('sighting-images', 'sighting-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('group-avatars', 'group-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('chat-images', 'chat-images', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas para bucket privado 'chat-images' (estructura: <conversation_id>/<filename>)
DROP POLICY IF EXISTS "Chat Images Member Read" ON storage.objects;
CREATE POLICY "Chat Images Member Read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND ((storage.foldername(name))[1])::uuid IN (SELECT public.get_my_conversation_ids())
  );

DROP POLICY IF EXISTS "Chat Images Member Upload" ON storage.objects;
CREATE POLICY "Chat Images Member Upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-images'
    AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND ((storage.foldername(name))[1])::uuid IN (SELECT public.get_my_conversation_ids())
  );

DROP POLICY IF EXISTS "Chat Images Owner Delete" ON storage.objects;
CREATE POLICY "Chat Images Owner Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND owner = auth.uid()
  );

-- ----------------------------------------------------------------------------
-- 2. RPC DE RESUMEN DE CONVERSACIONES SIN N+1 NI FULL SCAN (AUD-012)
-- ----------------------------------------------------------------------------
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
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;

  RETURN QUERY
  WITH my_convs AS (
    SELECT c.id, c.name, c.description, c.avatar_url, c.is_group, c.created_by, c.created_at
    FROM public.conversation_members cm
    JOIN public.conversations c ON c.id = cm.conversation_id
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
    LIMIT GREATEST(COALESCE(p_limit, 30), 1)
    OFFSET GREATEST(COALESCE(p_offset, 0), 0)
  )
  SELECT
    jsonb_build_object(
      'id', mc.id,
      'name', mc.name,
      'description', mc.description,
      'avatar_url', mc.avatar_url,
      'is_group', mc.is_group,
      'created_by', mc.created_by,
      'created_at', mc.created_at,
      'members', COALESCE(mem.members_json, '[]'::jsonb)
    ) AS conversation,
    lm.msg_json AS last_message,
    COALESCE(uc.cnt, 0) AS unread_count
  FROM my_convs mc
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
    WHERE cm2.conversation_id = mc.id
  ) mem ON true
  LEFT JOIN LATERAL (
    SELECT
      m.created_at AS last_created_at,
      jsonb_build_object(
        'id', m.id,
        'conversation_id', m.conversation_id,
        'sender_id', m.sender_id,
        'content', m.content,
        'image_url', m.image_url,
        'created_at', m.created_at,
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
    WHERE m.conversation_id = mc.id
      AND NOT (COALESCE(m.deleted_for, '{}'::uuid[]) @> ARRAY[v_uid])
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN public.conversation_member_states cms
    ON cms.conversation_id = mc.id AND cms.user_id = v_uid
  LEFT JOIN public.messages lrm
    ON lrm.id = cms.last_read_message_id
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::bigint AS cnt
    FROM public.messages m2
    WHERE m2.conversation_id = mc.id
      AND m2.sender_id != v_uid
      AND NOT (COALESCE(m2.deleted_for, '{}'::uuid[]) @> ARRAY[v_uid])
      AND (lrm.created_at IS NULL OR m2.created_at > lrm.created_at)
  ) uc ON true
  ORDER BY lm.last_created_at DESC NULLS LAST, mc.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_conversations_summary(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_conversations_summary(integer, integer) TO authenticated;

-- ----------------------------------------------------------------------------
-- 3. ELIMINACIÓN COMPLETA DE CUENTA + ARCHIVOS EN STORAGE + REPORTES (AUD-017)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, storage, pg_temp
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;

  -- Eliminar objetos en Supabase Storage pertenecientes al usuario (tolerante a storage.protect_delete)
  BEGIN
    DELETE FROM storage.objects
    WHERE owner = v_uid
       OR (bucket_id IN ('Sightings', 'sightings', 'sighting-images', 'avatars', 'group-avatars') AND (storage.foldername(name))[1] = v_uid::text);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Eliminar usuario en auth.users (propaga ON DELETE CASCADE sobre public.users y tablas hijas)
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

-- Asegurar RLS en tabla public.reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_insert" ON public.reports;
CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Permitir consultar seguidores/seguidos de perfiles visibles respetando privacidad y bloqueos (AUD-020)
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows_select" ON public.follows;
CREATE POLICY "follows_select" ON public.follows
  FOR SELECT TO authenticated
  USING (
    follower_id = auth.uid()
    OR following_id = auth.uid()
    OR (
      public.can_view_user_content(following_id)
      AND NOT public.is_blocked(auth.uid(), follower_id)
      AND NOT public.is_blocked(auth.uid(), following_id)
    )
    OR (
      public.can_view_user_content(follower_id)
      AND NOT public.is_blocked(auth.uid(), follower_id)
      AND NOT public.is_blocked(auth.uid(), following_id)
    )
  );

COMMIT;

