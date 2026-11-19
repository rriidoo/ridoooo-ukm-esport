-- 006 - Kelola Game/Divisi. Jalankan MANUAL di Supabase SQL Editor setelah 005.
-- Mengembangkan tabel ridoooo_divisions yang sudah menjadi acuan FK pendaftaran.
-- Tidak menghapus/mengubah pendaftaran, NIM, status anggota, atau dokumen.

begin;

alter table public.ridoooo_divisions
  add column if not exists short text,
  add column if not exists division_label text,
  add column if not exists description text,
  add column if not exists is_visible boolean not null default true,
  add column if not exists logo_url text,
  add column if not exists banner_url text,
  add column if not exists display_order integer not null default 100;

update public.ridoooo_divisions set
  short = coalesce(nullif(short, ''), case code
    when 'mlbb' then 'MLBB'
    when 'pubg' then 'PUBG'
    when 'valorant' then 'VLRN'
    when 'efootball' then 'EFB'
    else upper(left(code, 5)) end),
  division_label = coalesce(nullif(division_label, ''), case code
    when 'mlbb' then 'Divisi MOBA'
    when 'pubg' then 'Divisi Battle Royale'
    when 'valorant' then 'Tactical FPS PC'
    when 'efootball' then 'Sports Simulation'
    else 'Divisi Game' end),
  description = coalesce(nullif(description, ''), case code
    when 'mlbb' then 'Divisi MOBA mobile 5v5 untuk turnamen mahasiswa dan liga kampus.'
    when 'pubg' then 'Divisi Battle Royale 4-man squad kompetisi IESPA/LIMA nasional.'
    when 'valorant' then 'Divisi Tactical FPS PC turnamen antarmahasiswa dan piala rektor.'
    when 'efootball' then 'Divisi simulasi olahraga sepak bola konsol dan mobile universitas.'
    else 'Divisi game UKM Esports Telkom University Purwokerto.' end),
  display_order = case
    when display_order = 100 and code = 'mlbb' then 1
    when display_order = 100 and code = 'pubg' then 2
    when display_order = 100 and code = 'valorant' then 3
    when display_order = 100 and code = 'efootball' then 4
    else display_order end;

-- Hak akses tetap: siapapun boleh membaca daftar, hanya Admin yang mengubah.
alter table public.ridoooo_divisions enable row level security;
grant select on public.ridoooo_divisions to anon, authenticated;
grant insert, update, delete on public.ridoooo_divisions to authenticated;

drop policy if exists ridoooo_divisions_admin_insert on public.ridoooo_divisions;
create policy ridoooo_divisions_admin_insert on public.ridoooo_divisions
  for insert to authenticated
  with check ((select public.ridoooo_is_admin()));

drop policy if exists ridoooo_divisions_admin_update on public.ridoooo_divisions;
create policy ridoooo_divisions_admin_update on public.ridoooo_divisions
  for update to authenticated
  using ((select public.ridoooo_is_admin()))
  with check ((select public.ridoooo_is_admin()));

drop policy if exists ridoooo_divisions_admin_delete on public.ridoooo_divisions;
create policy ridoooo_divisions_admin_delete on public.ridoooo_divisions
  for delete to authenticated
  using ((select public.ridoooo_is_admin()));

-- Logo dan banner adalah materi publik, terpisah dari bucket KTM yang privat.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ridoooo-game-media', 'ridoooo-game-media', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists ridoooo_game_media_admin_insert on storage.objects;
create policy ridoooo_game_media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ridoooo-game-media'
    and (storage.foldername(name))[1] in ('logos','banners')
    and (select public.ridoooo_is_admin()));

drop policy if exists ridoooo_game_media_admin_select on storage.objects;
create policy ridoooo_game_media_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'ridoooo-game-media'
    and (select public.ridoooo_is_admin()));

drop policy if exists ridoooo_game_media_admin_delete on storage.objects;
create policy ridoooo_game_media_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'ridoooo-game-media'
    and (select public.ridoooo_is_admin()));

commit;
