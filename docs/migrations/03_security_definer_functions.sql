-- ============================================================================
-- Migraci├│n 03: Funciones SECURITY DEFINER Blindadas
-- ============================================================================
-- Corrige las vulnerabilidades C5 y M8 (IDOR y Search Path Hijacking).
-- ============================================================================

-- 1. Crear grupo de conversaci├│n blindado (el creador SIEMPRE es auth.uid())
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
  -- FORZAR que el creador sea el usuario actualmente autenticado
  v_real_creator := auth.uid();
  IF v_real_creator IS NULL THEN
    RAISE EXCEPTION 'No autenticado.';
  END IF;

  INSERT INTO public.conversations (name, description, is_group, created_by, avatar_url)
  VALUES (group_name, group_description, TRUE, v_real_creator, group_avatar)
  RETURNING id INTO v_conv_id;

  INSERT INTO public.conversation_members (conversation_id, user_id, role)
  VALUES (v_conv_id, v_real_creator, 'admin');

  FOREACH v_member IN ARRAY member_ids LOOP
    IF v_member <> v_real_creator THEN
      INSERT INTO public.conversation_members (conversation_id, user_id, role)
      VALUES (v_conv_id, v_member, 'member')
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN v_conv_id;
END;
$$;

-- 2. Crear o recuperar conversaci├│n directa (1:1) blindada
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

  -- Comprobar que el usuario logueado sea uno de los participantes para evitar espiar/crear chats de terceros
  IF v_current_user != user_a AND v_current_user != user_b THEN
    RAISE EXCEPTION 'Operaci├│n no autorizada: usted no es parte de esta conversaci├│n.';
  END IF;

  v_other_user := CASE WHEN v_current_user = user_a THEN user_b ELSE user_a END;

  -- Buscar conversaci├│n existente entre ambos
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

  -- Crear nueva conversaci├│n
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

-- 3. Eliminar sobrecarga insegura de get_my_conversation_ids(uid uuid)
DROP FUNCTION IF EXISTS public.get_my_conversation_ids(uuid);

-- Mantener ├║nicamente la funci├│n segura que opera con auth.uid()
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

-- 4. Blindar append_deleted_for (solo para el propio usuario y si es miembro)
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

  -- Verificar que el usuario pertenezca a la conversaci├│n del mensaje
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
    AND NOT (deleted_for @> ARRAY[v_current_user]);
END;
$$;

-- 5. delete_user con search_path expl├¡cito
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- 6. is_conversation_member con search_path expl├¡cito
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

-- 7. handle_delete_user con search_path expl├¡cito
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
