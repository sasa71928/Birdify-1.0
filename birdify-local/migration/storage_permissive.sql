DROP POLICY IF EXISTS "Auth Upload avatars" ON storage.objects;
CREATE POLICY "Auth Upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Auth Upload birds" ON storage.objects;
CREATE POLICY "Auth Upload birds" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'birds');
