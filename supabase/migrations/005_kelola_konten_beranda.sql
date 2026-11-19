
-- 005 - Konten beranda dinamis. Jalankan MANUAL di SQL Editor setelah 004.
-- Tidak mengubah tabel pendaftaran, NIM, keanggotaan atau dokumen KTM.
begin;
create table if not exists public.ridoooo_site_content (
  key text primary key check (key in ('home_hero','home_stats','home_advantages','home_games')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.ridoooo_site_content enable row level security;
revoke all on public.ridoooo_site_content from anon, authenticated;
grant select on public.ridoooo_site_content to anon, authenticated;
grant insert, update on public.ridoooo_site_content to authenticated;

drop policy if exists ridoooo_site_content_public_read on public.ridoooo_site_content;
create policy ridoooo_site_content_public_read on public.ridoooo_site_content
  for select to anon, authenticated using (true);
drop policy if exists ridoooo_site_content_admin_insert on public.ridoooo_site_content;
create policy ridoooo_site_content_admin_insert on public.ridoooo_site_content
  for insert to authenticated with check ((select public.ridoooo_is_admin()));
drop policy if exists ridoooo_site_content_admin_update on public.ridoooo_site_content;
create policy ridoooo_site_content_admin_update on public.ridoooo_site_content
  for update to authenticated
  using ((select public.ridoooo_is_admin()))
  with check ((select public.ridoooo_is_admin()));

-- Isi awal hanya dimasukkan bila key belum ada; tidak menimpa edit Admin.
insert into public.ridoooo_site_content(key,payload) values
('home_hero','{"visible":true,"badge":"NEW SEASON REGISTRATION OPEN","title":"Bergabunglah dengan Komunitas E-Sport Telkom Purwokerto","description":"Pendaftaran digital cepat dan mudah. Tunjukkan skill terbaikmu dan jadilah bagian dari komunitas esports Telkom University Purwokerto.","cta":"DAFTAR SEKARANG","banner_url":null}'::jsonb),
('home_stats','{"visible":true,"students":"1.200+","divisions":"4","champions":"12+"}'::jsonb),
('home_advantages','{"items":[{"id":1,"iconId":"document","title":"Pendaftaran 100% Online","description":"Tak perlu repot cetak berkas. Semua proses dari pengisian formulir, data akun game, hingga upload berkas KTM dilakukan langsung melalui platform UKM.","active":true},{"id":2,"iconId":"progress","title":"Pantau Status Real-time","description":"Dapatkan notifikasi transparan ke akun kamu setiap ada pembaruan status seleksi, jadwal aktivitas baru, dan jadwal scrim internal divisi.","active":true},{"id":3,"iconId":"certificate","title":"Sertifikat & Rekomendasi Kampus","description":"Dukungan resmi delegasi kampus untuk turnamen IESPA, LIMA Esports, poin SKK/TAK kemahasiswaan, serta fasilitas coaching clinic berstandar pro.","active":true}]}'::jsonb),
('home_games','{"items":[{"code":"MLBB","visible":true},{"code":"PUBG","visible":true},{"code":"VLRN","visible":true},{"code":"EFB","visible":true}]}'::jsonb)

on conflict (key) do nothing;

-- Banner publik: hanya Admin yang dapat mengunggah dan menghapus objek.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('ridoooo-site-banners','ridoooo-site-banners',true,2097152,
  array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set
  public=true,file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists ridoooo_site_banner_admin_insert on storage.objects;
create policy ridoooo_site_banner_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id='ridoooo-site-banners'
    and (storage.foldername(name))[1]='home'
    and (select public.ridoooo_is_admin()));
drop policy if exists ridoooo_site_banner_admin_select on storage.objects;
create policy ridoooo_site_banner_admin_select on storage.objects
  for select to authenticated using
  (bucket_id='ridoooo-site-banners' and (select public.ridoooo_is_admin()));
drop policy if exists ridoooo_site_banner_admin_delete on storage.objects;
create policy ridoooo_site_banner_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id='ridoooo-site-banners'
    and (storage.foldername(name))[1]='home'
    and (select public.ridoooo_is_admin()));
commit;
