
-- MEDIA bucket: admin manages, signed links used for display
create policy "admin manage media" on storage.objects for all to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
create policy "read media" on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');

-- REPORTS bucket: files stored under <customer_id>/<file>
create policy "admin manage reports files" on storage.objects for all to authenticated
  using (bucket_id = 'reports' and public.is_admin())
  with check (bucket_id = 'reports' and public.is_admin());
create policy "customer read own report files" on storage.objects for select to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.reports r
      where r.customer_id = auth.uid() and r.is_published and r.file_path = storage.objects.name
    )
  );
