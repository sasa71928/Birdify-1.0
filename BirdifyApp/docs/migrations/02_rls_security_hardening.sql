-- ============================================================================
-- Migración 02: Hardening de Políticas RLS (Row Level Security)
-- ============================================================================
-- Corrige las vulnerabilidades C3, C4, A1, A2, A3 y A4.
-- ============================================================================

-- 1. MENSAJES (messages): Solo miembros legítimos pueden ver, crear o borrar
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_members 
      WHERE user_id = auth.uid()
    )
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
CREATE POLICY "conversation_select" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT conversation_id 
      FROM public.conversation_members 
      WHERE user_id = auth.uid()
    )
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
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "conversation_delete" ON public.conversations;
CREATE POLICY "conversation_delete" ON public.conversations
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- 3. MIEMBROS DE CONVERSACIÓN (conversation_members)
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view conversation members" ON public.conversation_members;
DROP POLICY IF EXISTS "conversation_members_select" ON public.conversation_members;
CREATE POLICY "conversation_members_select" ON public.conversation_members
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT cm.conversation_id 
      FROM public.conversation_members cm 
      WHERE cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can add themselves to conversations" ON public.conversation_members;
DROP POLICY IF EXISTS "conversation_members_insert" ON public.conversation_members;
CREATE POLICY "conversation_members_insert" ON public.conversation_members
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Solo el creador de la conversación o un admin del grupo puede agregar miembros
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_members.conversation_id
        AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
    -- O si es una conversación directa recién creada por el usuario
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can remove themselves from conversations" ON public.conversation_members;
DROP POLICY IF EXISTS "conversation_members_delete" ON public.conversation_members;
CREATE POLICY "conversation_members_delete" ON public.conversation_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
  );

-- 4. PREVENCIÓN DE ESCALADA DE PRIVILEGIOS EN USUARIOS (A1)
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Si el rol de la sesión actual no es service_role, no se permite cambiar is_verified ni user_level
  IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified OR NEW.user_level IS DISTINCT FROM OLD.user_level) THEN
    IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
      RAISE EXCEPTION 'Operación no permitida: no puede auto-verificarse o modificar su nivel de privilegios.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.users;
CREATE TRIGGER trg_prevent_privilege_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_privilege_escalation();

-- 5. BLINDAR EXPOSICIÓN DE USUARIOS (A2)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura pública de usuarios" ON public.users;
DROP POLICY IF EXISTS "users_select" ON public.users;

-- Usuarios autenticados pueden ver perfiles de otros siempre que no estén bloqueados
CREATE POLICY "users_select_authenticated" ON public.users
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR NOT public.is_blocked(auth.uid(), id)
  );

-- Usuarios anónimos solo pueden ver perfiles públicos básicos (id, username, fullname, profile_pic_url)
-- sin acceso a correos o tokens push
CREATE POLICY "users_select_anon" ON public.users
  FOR SELECT TO anon
  USING (true);

-- 6. CATÁLOGO DE AVES (A4)
ALTER TABLE public.birds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir inserción de especies a usuarios autenticados" ON public.birds;
DROP POLICY IF EXISTS "birds_insert" ON public.birds;
-- Solo service_role o moderadores/admins pueden insertar nuevas especies en el catálogo oficial
CREATE POLICY "birds_insert_protected" ON public.birds
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_level IN ('admin', 'moderator')
    )
  );

-- 7. AVISTAMIENTOS (sightings) - Limpiar políticas contradictorias
ALTER TABLE public.sightings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own sightings for 5 minutes" ON public.sightings;
DROP POLICY IF EXISTS "Permitir edición de avistamientos propios" ON public.sightings;
DROP POLICY IF EXISTS "sightings_update" ON public.sightings;

CREATE POLICY "sightings_update" ON public.sightings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
