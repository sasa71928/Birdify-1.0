INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true), 
('birds', 'birds', true),
('sightings', 'sightings', true),
('group-avatars', 'group-avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth Upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access birds" ON storage.objects FOR SELECT USING (bucket_id = 'birds');
CREATE POLICY "Auth Upload birds" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'birds' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update birds" ON storage.objects FOR UPDATE USING (bucket_id = 'birds' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete birds" ON storage.objects FOR DELETE USING (bucket_id = 'birds' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access sightings" ON storage.objects FOR SELECT USING (bucket_id = 'sightings');
CREATE POLICY "Auth Upload sightings" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sightings' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update sightings" ON storage.objects FOR UPDATE USING (bucket_id = 'sightings' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete sightings" ON storage.objects FOR DELETE USING (bucket_id = 'sightings' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access group-avatars" ON storage.objects FOR SELECT USING (bucket_id = 'group-avatars');
CREATE POLICY "Auth Upload group-avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'group-avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update group-avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'group-avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete group-avatars" ON storage.objects FOR DELETE USING (bucket_id = 'group-avatars' AND auth.role() = 'authenticated');

