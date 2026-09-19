CREATE POLICY "Anyone can view card art"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'card-art');

CREATE POLICY "Users upload card art to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'card-art' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own card art"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'card-art' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'card-art' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own card art"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'card-art' AND (storage.foldername(name))[1] = auth.uid()::text);