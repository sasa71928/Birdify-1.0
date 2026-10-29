-- ============================================================================
-- Migración 04: Hardening de Políticas de Almacenamiento (Supabase Storage)
-- ============================================================================
-- Corrige las vulnerabilidades C6 y A6 (RLS desactivado y sobrescritura de archivos ajenos)
-- e incorpora límites de tamaño (5 MB), tipos MIME y el bucket privado 'chat-images'.
-- ============================================================================

-- 1. Habilitar RLS en storage
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Asegurar que los buckets necesarios existan con límites de tamaño y MIME
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('sightings', 'sightings', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('group-avatars', 'group-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('chat-images', 'chat-images', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Limpiar políticas previas permisivas sobre storage.objects
DROP POLICY IF EXISTS "Public Access sightings" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload sightings" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update sightings" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete sightings" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload birds" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload group-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Select" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Read All Images" ON storage.objects;
DROP POLICY IF EXISTS "Sightings Auth User Upload" ON storage.objects;
DROP POLICY IF EXISTS "Sightings Auth User Update" ON storage.objects;
DROP POLICY IF EXISTS "Sightings Auth User Delete" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Auth User Upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Auth User Update" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Auth User Delete" ON storage.objects;
DROP POLICY IF EXISTS "Group Avatars Auth User Upload" ON storage.objects;
DROP POLICY IF EXISTS "Group Avatars Auth User Update" ON storage.objects;
DROP POLICY IF EXISTS "Group Avatars Auth User Delete" ON storage.objects;
DROP POLICY IF EXISTS "Chat Images Member Read" ON storage.objects;
DROP POLICY IF EXISTS "Chat Images Member Upload" ON storage.objects;
DROP POLICY IF EXISTS "Chat Images Owner Delete" ON storage.objects;

-- 4. POLÍTICA DE LECTURA PÚBLICA (SELECT) SOLO EN BUCKETS PÚBLICOS
CREATE POLICY "Public Read All Images" ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('sightings', 'avatars', 'group-avatars', 'birds'));

-- 5. POLÍTICAS PARA SIGHTINGS (Avistamientos)
CREATE POLICY "Sightings Auth User Upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'sightings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Sightings Auth User Update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'sightings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Sightings Auth User Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'sightings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. POLÍTICAS PARA AVATARS (Fotos de perfil)
CREATE POLICY "Avatars Auth User Upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Avatars Auth User Update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Avatars Auth User Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 7. POLÍTICAS PARA GROUP-AVATARS (Avatares de grupos de chat)
CREATE POLICY "Group Avatars Auth User Upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'group-avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Group Avatars Auth User Update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'group-avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Group Avatars Auth User Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'group-avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 8. POLÍTICAS PARA CHAT-IMAGES (Privado por conversación)
CREATE POLICY "Chat Images Member Read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND ((storage.foldername(name))[1])::uuid IN (SELECT public.get_my_conversation_ids())
  );

CREATE POLICY "Chat Images Member Upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-images'
    AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND ((storage.foldername(name))[1])::uuid IN (SELECT public.get_my_conversation_ids())
  );

CREATE POLICY "Chat Images Owner Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND owner = auth.uid()
  );
