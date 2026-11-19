-- 010 - Anggota yang dihapus boleh mendaftar ulang ke divisi yang sama.
-- Jalankan MANUAL di Supabase SQL Editor setelah migration 004.
-- Riwayat pendaftaran berstatus 'removed' dan 'rejected' tetap tersimpan.
-- Tetap mencegah dua pengajuan aktif (pending/accepted) untuk user + divisi yang sama.

begin;

drop index if exists public.ridoooo_one_active_application;

create unique index ridoooo_one_active_application
  on public.ridoooo_applications (user_id, division_code)
  where status in ('pending', 'accepted');

commit;
