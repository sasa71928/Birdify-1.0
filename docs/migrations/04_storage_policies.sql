-- ============================================================================
-- Migraci├│n 04: Hardening de Pol├¡ticas de Almacenamiento (Supabase Storage)
-- ============================================================================
-- Corrige las vulnerabilidades C6 y A6 (RLS desactivado y sobrescritura de archivos ajenos).
-- ============================================================================

-- 1. Habilitar RLS en storage
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Asegurar que los buckets necesarios existan y sean p├║blicos para lectura
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('sightings', 'sightings', true),
  ('avatars', 'avatars', true),
  ('group-avatars', 'group-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Limpiar pol├¡ticas previas permisivas sobre storage.objects
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

-- 4. POL├ìTICA DE LECTURA P├ÜBLICA (SELECT)
CREATE POLICY "Public Read All Images" ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('sightings', 'avatars', 'group-avatars', 'birds'));

-- 5. POL├ìTICAS PARA SIGHTINGS (Avistamientos)
-- Subidas permitidas ├║nicamente en el directorio propio del usuario: <user_id>/<filename>
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

-- 6. POL├ìTICAS PARA AVATARS (Fotos de perfil)
-- Subidas permitidas ├║nicamente en el directorio del propio usuario: <user_id>/...
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

-- 7. POL├ìTICAS PARA GROUP-AVATARS (Avatares de grupos de chat)
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
