-- ============================================================================
-- Migración 02: Hardening de Políticas RLS, Columnas y Privacidad
-- ============================================================================
-- Requiere las funciones auxiliares de 03_security_definer_functions.sql
-- (incluidas aquí de forma idempotente para evitar errores de orden de ejecución).
-- ============================================================================

-- Funciones auxiliares requeridas por las políticas RLS para evitar recursión 42P17
CREATE OR REPLACE FUNCTION public.get_my_conversation_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_admin(conv_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id = conv_id AND c.created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.conversation_members cm
    WHERE cm.conversation_id = conv_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_user_content(target_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT
    CASE
      WHEN target_user_id IS NULL THEN false
      WHEN auth.uid() = target_user_id THEN true
      WHEN auth.uid() IS NOT NULL AND public.is_blocked(auth.uid(), target_user_id) THEN false
      ELSE EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = target_user_id
          AND (
            u.is_private = false
            OR (
              auth.uid() IS NOT NULL
              AND EXISTS (SELECT 1 FROM public.follows f1 WHERE f1.follower_id = auth.uid() AND f1.following_id = target_user_id)
              AND EXISTS (SELECT 1 FROM public.follows f2 WHERE f2.follower_id = target_user_id AND f2.following_id = auth.uid())
            )
          )
      )
    END;
$$;

-- 1. MENSAJES (messages): Solo miembros legítimos, sin recursión RLS
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

-- 2. CONVERSACIONES (conversations)
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

-- 3. MIEMBROS DE CONVERSACIÓN (conversation_members) — Sin autorreferencia recursiva
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

-- 4. PREVENCIÓN DE ESCALADA DE PRIVILEGIOS EN USUARIOS (AUD-002: null-safe + INSERT y UPDATE)
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

-- 5. BLINDAR EXPOSICIÓN DE USUARIOS Y COLUMNAS SENSIBLES (AUD-006)
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

-- Revocar acceso de tabla a anon y restringir columnas sensibles en authenticated
REVOKE ALL ON TABLE public.users FROM anon;
REVOKE SELECT ON TABLE public.users FROM authenticated;
GRANT SELECT (id, username, fullname, bio, profile_pic_url, is_private, is_verified, user_level, created_at)
  ON TABLE public.users TO authenticated;

-- 6. CATÁLOGO DE AVES (birds)
ALTER TABLE public.birds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir inserción de especies a usuarios autenticados" ON public.birds;
DROP POLICY IF EXISTS "birds_insert" ON public.birds;
DROP POLICY IF EXISTS "birds_insert_protected" ON public.birds;
CREATE POLICY "birds_insert_protected" ON public.birds
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_level IN ('admin', 'moderator')
    )
  );

-- 7. AVISTAMIENTOS, COMENTARIOS Y REACCIONES: Ubicación privada y Perfiles Privados (AUD-001)
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

-- Limpiar coordenadas históricas de avistamientos marcados como privados
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
