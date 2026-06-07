GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO anon, authenticated;

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Bucket Public Access" ON storage.buckets;
CREATE POLICY "Bucket Public Access" ON storage.buckets FOR SELECT USING (true);

-- Ensure policies are correct
DROP POLICY IF EXISTS "Auth Upload avatars" ON storage.objects;
CREATE POLICY "Auth Upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Upload birds" ON storage.objects;
CREATE POLICY "Auth Upload birds" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'birds' AND auth.role() = 'authenticated');
