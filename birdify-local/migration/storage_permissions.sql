GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO anon, authenticated;

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Bucket Public Access" ON storage.buckets;
CREATE POLICY "Bucket Public Access" ON storage.buckets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth Select" ON storage.objects;
CREATE POLICY "Auth Select" ON storage.objects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (owner_id IS NOT NULL);

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (owner_id IS NOT NULL);

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (owner_id IS NOT NULL);
