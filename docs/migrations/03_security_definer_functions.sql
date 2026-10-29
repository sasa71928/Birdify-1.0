-- ============================================================================
-- Migración 03: Funciones SECURITY DEFINER Blindadas
-- ============================================================================
-- NOTA: Ejecutar ANTES o en conjunto con 02_rls_security_hardening.sql
-- (o bien ejecutar directamente 05_p0_critical_security_hardening.sql).
-- ============================================================================

-- 0. Eliminar sobrecargas u objetos obsoletos inseguros
DROP FUNCTION IF EXISTS public.get_my_conversation_ids(uuid);
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 1. Obtener IDs de conversaciones del usuario autenticado (evita recursión RLS 42P17)
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

-- 2. Verificar si el usuario autenticado es admin/creador de una conversación (sin recursión RLS)
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

-- 3. Evaluar si el usuario actual puede ver contenido de un autor (bloqueos + perfil privado)
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

-- 4. Resolver email para inicio de sesión por username sin exponer public.users a anon
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

-- 5. Leer únicamente las preferencias de notificación propias
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

-- 6. Crear grupo de conversación blindado (creador = auth.uid(), respeta bloqueos)
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

-- 7. Crear o recuperar conversación directa (1:1) blindada contra IDOR y bloqueos
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

-- 8. Blindar get_batch_conversation_member_states contra lectura de estados de terceros
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

-- 9. Blindar append_deleted_for
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

-- 10. delete_user con guardia de autenticación y search_path fijo
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

-- 11. is_conversation_member con search_path explícito
CREATE OR REPLACE FUNCTION public.is_conversation_member(conv_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = conv_id
      AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_conversation_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_member(uuid) TO authenticated;

-- 12. handle_delete_user con search_path explícito
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_delete_user() FROM PUBLIC, anon, authenticated;
