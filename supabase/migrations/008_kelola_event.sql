-- 008 - Kelola Event/Turnamen: Admin CRUD + publikasi ke website User.
-- Jalankan MANUAL di Supabase SQL Editor setelah 007.
-- Tidak mengubah/menghapus data pendaftar, anggota, atau divisi.

begin;

create table if not exists public.ridoooo_events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 3 and 160),
  category text not null check (char_length(btrim(category)) between 2 and 100),
  games text[] not null default '{}'::text[],
  start_date date not null,
  end_date date not null,
  prize_pool text not null default '',
  slots integer not null check (slots between 1 and 100000),
  status text not null default 'DRAFT' check (status in ('DRAFT','TAMPIL','SELESAI')),
  description text not null check (char_length(btrim(description)) between 5 and 2000),
  benefit text not null default '',
  regulation_url text not null default '',
  banner_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ridoooo_event_dates check (end_date >= start_date),
  constraint ridoooo_event_games check (cardinality(games) between 1 and 20),
  constraint ridoooo_event_benefit_length check (char_length(benefit) <= 500),
  constraint ridoooo_event_prize_length check (char_length(prize_pool) <= 100),
  constraint ridoooo_event_link_length check (char_length(regulation_url) <= 1000)
);
create index if not exists ridoooo_events_public_order
  on public.ridoooo_events(status, end_date desc);

-- Data awal mengikuti tiga kartu Event yang sebelumnya tampil di Admin.
-- ID tetap agar SQL ini aman jika dijalankan ulang.
insert into public.ridoooo_events
(id,name,category,games,start_date,end_date,prize_pool,slots,status,description,benefit,regulation_url)
values
('dd4313b1-16d6-4fa2-879b-76bd5f988101','Piala Rektor Esports Championship 2025','Campus Competition',
 array['Mobile Legends','Valorant'],'2025-03-15','2025-03-20','Rp 10.000.000',32,'TAMPIL',
 'Turnamen resmi antar fakultas Telkom University Purwokerto memperebutkan Piala Bergilir Rektor dan total hadiah tunai pembinaan.',
 'Sertifikat Resmi Rektorat, Hadiah Tunai, TAK / SKK Kemahasiswaan',''),
('dd4313b1-16d6-4fa2-879b-76bd5f988102','Tel-U Purwokerto Valorant Clash Series','Community Tournament',
 array['Valorant'],'2025-04-05','2025-04-08','Rp 5.000.000',16,'DRAFT',
 'Turnamen komunitas Valorant untuk mahasiswa Telkom University Purwokerto.',
 'Sertifikat, hadiah tunai',''),
('dd4313b1-16d6-4fa2-879b-76bd5f988103','Purwokerto Inter-Collegiate MLBB Cup','Inter-Campus Cup',
 array['Mobile Legends'],'2025-01-10','2025-01-14','Rp 7.500.000',32,'SELESAI',
 'Kompetisi Mobile Legends antarkampus wilayah Purwokerto.',
 'Hadiah tunai dan sertifikat','')
on conflict (id) do nothing;

-- Pengunjung hanya membaca Event TAMPIL; Admin dapat membaca semua.
alter table public.ridoooo_events enable row level security;
grant select on public.ridoooo_events to anon, authenticated;
grant insert, update, delete on public.ridoooo_events to authenticated;

drop policy if exists ridoooo_events_public_read on public.ridoooo_events;
create policy ridoooo_events_public_read on public.ridoooo_events
 for select to anon, authenticated using (status = 'TAMPIL');

drop policy if exists ridoooo_events_admin_read on public.ridoooo_events;
create policy ridoooo_events_admin_read on public.ridoooo_events
 for select to authenticated using ((select public.ridoooo_is_admin()));

drop policy if exists ridoooo_events_admin_insert on public.ridoooo_events;
create policy ridoooo_events_admin_insert on public.ridoooo_events
 for insert to authenticated with check ((select public.ridoooo_is_admin()));

drop policy if exists ridoooo_events_admin_update on public.ridoooo_events;
create policy ridoooo_events_admin_update on public.ridoooo_events
 for update to authenticated
 using ((select public.ridoooo_is_admin()))
 with check ((select public.ridoooo_is_admin()));

drop policy if exists ridoooo_events_admin_delete on public.ridoooo_events;
create policy ridoooo_events_admin_delete on public.ridoooo_events
 for delete to authenticated using ((select public.ridoooo_is_admin()));

-- Bucket publik berisi gambar event saja; upload dan penghapusan Admin-only.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('ridoooo-event-media','ridoooo-event-media',true,2097152,
  array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
 public=excluded.public,
 file_size_limit=excluded.file_size_limit,
 allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists ridoooo_events_banner_insert on storage.objects;
create policy ridoooo_events_banner_insert on storage.objects
 for insert to authenticated
 with check (
  bucket_id='ridoooo-event-media'
  and (storage.foldername(name))[1]='banners'
  and (select public.ridoooo_is_admin())
 );

drop policy if exists ridoooo_events_banner_select on storage.objects;
create policy ridoooo_events_banner_select on storage.objects
 for select to authenticated
 using (
  bucket_id='ridoooo-event-media'
  and (select public.ridoooo_is_admin())
 );

drop policy if exists ridoooo_events_banner_delete on storage.objects;
create policy ridoooo_events_banner_delete on storage.objects
 for delete to authenticated
 using (
  bucket_id='ridoooo-event-media'
  and (select public.ridoooo_is_admin())
 );

commit;
