CREATE POLICY "Public Access sightings" ON storage.objects FOR SELECT USING (bucket_id = 'sightings');
CREATE POLICY "Auth Upload sightings" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sightings');
CREATE POLICY "Auth Update sightings" ON storage.objects FOR UPDATE USING (bucket_id = 'sightings' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete sightings" ON storage.objects FOR DELETE USING (bucket_id = 'sightings' AND auth.role() = 'authenticated');
