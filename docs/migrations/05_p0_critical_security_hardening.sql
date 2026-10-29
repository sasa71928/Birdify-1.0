-- ============================================================================
-- Migración 05 (Consolidada P0): Remediación Crítica de Seguridad y Privacidad
-- ============================================================================
-- Cubre de forma 100% idempotente los hallazgos:
--   - AUD-001: Enmascaramiento real de "Ubicación Privada" y RLS de perfiles privados.
--   - AUD-002: Prevención de escalación de privilegios null-safe en INSERT y UPDATE.
--   - AUD-003: Blindaje y revocación de funciones RPC SECURITY DEFINER y server_secrets.
--   - AUD-005: Eliminación de políticas abiertas en chat y fin de recursión infinita 42P17.
--   - AUD-006: Revocación de exposición anónima/columnas sensibles (email, expo_push_token).
--
-- Puede ejecutarse directamente en Supabase SQL Editor sin importar si las
-- migraciones 01..03 se aplicaron parcial o totalmente antes.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. ENDURECIMIENTO DE PRIVILEGIOS POR DEFECTO Y TABLAS INTERNAS (AUD-003)
-- ----------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLES FROM anon, authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'server_secrets'
  ) THEN
    EXECUTE 'ALTER TABLE public.server_secrets ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON TABLE public.server_secrets FROM PUBLIC, anon, authenticated';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'send_expo_push_notifications'
  ) THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.send_expo_push_notifications(text[], text, text, jsonb) FROM PUBLIC, anon, authenticated';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
  ) THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
  END IF;
END $$;

-- Eliminar sobrecargas inseguras u obsoletas
DROP FUNCTION IF EXISTS public.get_my_conversation_ids(uuid);

-- ----------------------------------------------------------------------------
-- 2. FUNCIONES SECURITY DEFINER BLINDADAS (AUD-003, AUD-005, AUD-006)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_conversation_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT conversation_id
  FROM public.conversation_members
  WHERE user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_my_conversation_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_conversation_ids() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_conversation_admin(conv_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conv_id AND c.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.conversation_members cm
    WHERE cm.conversation_id = conv_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_conversation_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_admin(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.can_view_user_content(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    CASE
      WHEN target_user_id IS NULL THEN false
      WHEN auth.uid() = target_user_id THEN true
      WHEN auth.uid() IS NOT NULL AND public.is_blocked(auth.uid(), target_user_id) THEN false
      ELSE EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = target_user_id
          AND (
            u.is_private = false
            OR (
              auth.uid() IS NOT NULL
              AND EXISTS (
                SELECT 1 FROM public.follows f1
                WHERE f1.follower_id = auth.uid() AND f1.following_id = target_user_id
              )
              AND EXISTS (
                SELECT 1 FROM public.follows f2
                WHERE f2.follower_id = target_user_id AND f2.following_id = auth.uid()
              )
            )
          )
      )
    END;
$$;

REVOKE ALL ON FUNCTION public.can_view_user_content(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_user_content(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.resolve_login_email(p_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT u.email
  FROM public.users u
  WHERE lower(u.username) = lower(btrim(p_username))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.resolve_login_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_login_email(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_notification_settings()
RETURNS TABLE(push_notifications jsonb, email_notifications jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT u.push_notifications, u.email_notifications
  FROM public.users u
  WHERE u.id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_my_notification_settings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_notification_settings() TO authenticated;

CREATE OR REPLACE FUNCTION public.create_group_conversation(
  creator_id uuid,
  group_name text,
  group_description text,
  member_ids uuid[],
  group_avatar text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_conv_id uuid;
  v_member  uuid;
  v_real_creator uuid;
BEGIN
  v_real_creator := auth.uid();
  IF v_real_creator IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;

  INSERT INTO public.conversations (name, description, is_group, created_by, avatar_url)
  VALUES (group_name, group_description, TRUE, v_real_creator, group_avatar)
  RETURNING id INTO v_conv_id;

  INSERT INTO public.conversation_members (conversation_id, user_id, role)
  VALUES (v_conv_id, v_real_creator, 'admin');

  IF member_ids IS NOT NULL THEN
    FOREACH v_member IN ARRAY member_ids LOOP
      IF v_member IS NOT NULL
         AND v_member <> v_real_creator
         AND NOT public.is_blocked(v_real_creator, v_member) THEN
        INSERT INTO public.conversation_members (conversation_id, user_id, role)
        VALUES (v_conv_id, v_member, 'member')
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  RETURN v_conv_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_group_conversation(uuid, text, text, uuid[], text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_group_conversation(uuid, text, text, uuid[], text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(
  user_a uuid,
  user_b uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_user uuid;
  v_other_user   uuid;
  v_conv_id      uuid;
BEGIN
  v_current_user := auth.uid();
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;

  IF v_current_user != user_a AND v_current_user != user_b THEN
    RAISE EXCEPTION 'Operación no autorizada: usted no es parte de esta conversación.';
  END IF;

  v_other_user := CASE WHEN v_current_user = user_a THEN user_b ELSE user_a END;

  IF public.is_blocked(v_current_user, v_other_user) THEN
    RAISE EXCEPTION 'No puedes iniciar una conversación con este usuario.';
  END IF;

  SELECT cm1.conversation_id INTO v_conv_id
  FROM public.conversation_members cm1
  INNER JOIN public.conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
  INNER JOIN public.conversations c ON c.id = cm1.conversation_id
  WHERE cm1.user_id = v_current_user
    AND cm2.user_id = v_other_user
    AND c.is_group = FALSE
  LIMIT 1;

  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  INSERT INTO public.conversations (is_group, created_by)
  VALUES (FALSE, v_current_user)
  RETURNING id INTO v_conv_id;

  INSERT INTO public.conversation_members (conversation_id, user_id, role)
  VALUES
    (v_conv_id, v_current_user, 'admin'),
    (v_conv_id, v_other_user, 'member');

  RETURN v_conv_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_direct_conversation(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_direct_conversation(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_batch_conversation_member_states(
  p_user_id uuid,
  p_conversation_ids uuid[]
)
RETURNS TABLE(conversation_id uuid, last_read_message_id uuid, visible_message_id uuid)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Operación no autorizada.';
  END IF;

  RETURN QUERY
  SELECT
    cms.conversation_id,
    cms.last_read_message_id,
    cms.visible_message_id
  FROM public.conversation_member_states cms
  WHERE cms.user_id = auth.uid()
    AND cms.conversation_id = ANY(p_conversation_ids);
END;
$$;

REVOKE ALL ON FUNCTION public.get_batch_conversation_member_states(uuid, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_batch_conversation_member_states(uuid, uuid[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.append_deleted_for(
  message_id uuid,
  user_id_to_add uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_user uuid;
BEGIN
  v_current_user := auth.uid();
  IF v_current_user IS NULL OR v_current_user != user_id_to_add THEN
    RAISE EXCEPTION 'Solo puede ocultar mensajes para su propia cuenta.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
    WHERE m.id = message_id AND cm.user_id = v_current_user
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para modificar este mensaje.';
  END IF;

  UPDATE public.messages
  SET deleted_for = array_append(deleted_for, v_current_user)
  WHERE id = message_id
    AND NOT (COALESCE(deleted_for, '{}'::uuid[]) @> ARRAY[v_current_user]);
END;
$$;

REVOKE ALL ON FUNCTION public.append_deleted_for(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.append_deleted_for(uuid, uuid) TO authenticated;

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

  -- Intentar limpiar metadatos de objetos en Storage (tolerante a storage.protect_delete)
  BEGIN
    DELETE FROM storage.objects
    WHERE owner = v_uid
       OR (bucket_id IN ('avatars', 'sighting-images', 'Sightings', 'sightings') AND (storage.foldername(name))[1] = v_uid::text);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

-- ----------------------------------------------------------------------------
-- 3. POLÍTICAS RLS DE CHAT SIN EXPOSICIÓN NI RECURSIÓN 42P17 (AUD-005)
-- ----------------------------------------------------------------------------
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_select_member" ON public.messages;
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT TO authenticated
  USING (conversation_id IN (SELECT public.get_my_conversation_ids()));

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_member" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (SELECT public.get_my_conversation_ids())
  );

DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
DROP POLICY IF EXISTS "messages_delete" ON public.messages;
CREATE POLICY "messages_delete" ON public.messages
  FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "messages_update" ON public.messages;
CREATE POLICY "messages_update" ON public.messages
  FOR UPDATE TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversation_select" ON public.conversations;
DROP POLICY IF EXISTS "conversations_select_member" ON public.conversations;
CREATE POLICY "conversation_select" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR id IN (SELECT public.get_my_conversation_ids())
  );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversation_insert" ON public.conversations;
CREATE POLICY "conversation_insert" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversation_update" ON public.conversations;
CREATE POLICY "conversation_update" ON public.conversations
  FOR UPDATE TO authenticated
  USING (public.is_conversation_admin(id))
  WITH CHECK (public.is_conversation_admin(id));

DROP POLICY IF EXISTS "conversation_delete" ON public.conversations;
CREATE POLICY "conversation_delete" ON public.conversations
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view conversation members" ON public.conversation_members;
DROP POLICY IF EXISTS "conversation_members_select" ON public.conversation_members;
DROP POLICY IF EXISTS "conversation_members_select_member" ON public.conversation_members;
CREATE POLICY "conversation_members_select" ON public.conversation_members
  FOR SELECT TO authenticated
  USING (conversation_id IN (SELECT public.get_my_conversation_ids()));

DROP POLICY IF EXISTS "Users can add themselves to conversations" ON public.conversation_members;
DROP POLICY IF EXISTS "conversation_members_insert" ON public.conversation_members;
DROP POLICY IF EXISTS "conversation_members_insert_creator" ON public.conversation_members;
CREATE POLICY "conversation_members_insert" ON public.conversation_members
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_conversation_admin(conversation_id)
    AND NOT public.is_blocked(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "Users can remove themselves from conversations" ON public.conversation_members;
DROP POLICY IF EXISTS "conversation_members_delete" ON public.conversation_members;
CREATE POLICY "conversation_members_delete" ON public.conversation_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_conversation_admin(conversation_id)
  );

-- ----------------------------------------------------------------------------
-- 4. PREVENCIÓN DE ESCALADA DE PRIVILEGIOS EN INSERT Y UPDATE (AUD-002)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_jwt_role text;
BEGIN
  v_jwt_role := COALESCE(
    auth.jwt() ->> 'role',
    current_setting('request.jwt.claim.role', true),
    ''
  );

  IF v_jwt_role IS DISTINCT FROM 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.is_verified := false;
      NEW.user_level := 'general';
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.is_verified IS DISTINCT FROM OLD.is_verified
         OR NEW.user_level IS DISTINCT FROM OLD.user_level THEN
        RAISE EXCEPTION 'Operación no permitida: no puede auto-verificarse o modificar su nivel de privilegios.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_users_prevent_escalation ON public.users;
DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.users;
CREATE TRIGGER trg_prevent_privilege_escalation
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_privilege_escalation();

-- ----------------------------------------------------------------------------
-- 5. PROTECCIÓN DE COLUMNAS SENSIBLES DE USUARIOS Y FIN DE ACCESO ANON (AUD-006)
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura pública de usuarios" ON public.users;
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_select_anon" ON public.users;
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_select_blocked" ON public.users;

CREATE POLICY "users_select_authenticated" ON public.users
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR NOT public.is_blocked(auth.uid(), id)
  );

REVOKE ALL ON TABLE public.users FROM anon;
REVOKE SELECT ON TABLE public.users FROM authenticated;
GRANT SELECT (id, username, fullname, bio, profile_pic_url, is_private, is_verified, user_level, created_at)
  ON TABLE public.users TO authenticated;

-- ----------------------------------------------------------------------------
-- 6. PRIVACIDAD REAL DE UBICACIONES Y DE PERFILES PRIVADOS (AUD-001)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_private_sighting_location()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF COALESCE(NEW.is_location_private, false) = true THEN
    NEW.latitude := NULL;
    NEW.longitude := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_private_sighting_location ON public.sightings;
CREATE TRIGGER trg_enforce_private_sighting_location
  BEFORE INSERT OR UPDATE ON public.sightings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_private_sighting_location();

UPDATE public.sightings
SET latitude = NULL, longitude = NULL
WHERE is_location_private = true
  AND (latitude IS NOT NULL OR longitude IS NOT NULL);

ALTER TABLE public.sightings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sightings_select" ON public.sightings;
DROP POLICY IF EXISTS "sightings_select_blocked" ON public.sightings;
CREATE POLICY "sightings_select" ON public.sightings
  FOR SELECT TO authenticated
  USING (public.can_view_user_content(user_id));

DROP POLICY IF EXISTS "Users can update own sightings for 5 minutes" ON public.sightings;
DROP POLICY IF EXISTS "Permitir edición de avistamientos propios" ON public.sightings;
DROP POLICY IF EXISTS "sightings_update" ON public.sightings;
CREATE POLICY "sightings_update" ON public.sightings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_select" ON public.comments;
CREATE POLICY "comments_select" ON public.comments
  FOR SELECT TO authenticated
  USING (
    (auth.uid() = user_id OR NOT public.is_blocked(auth.uid(), user_id))
    AND EXISTS (
      SELECT 1 FROM public.sightings s
      WHERE s.id = comments.sighting_id
        AND public.can_view_user_content(s.user_id)
    )
  );

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reactions_select" ON public.reactions;
CREATE POLICY "reactions_select" ON public.reactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sightings s
      WHERE s.id = reactions.sighting_id
        AND public.can_view_user_content(s.user_id)
    )
  );

COMMIT;
