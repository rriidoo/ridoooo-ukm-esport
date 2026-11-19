-- 007 - Hapus Game/Divisi dari katalog tanpa menghapus riwayat pendaftaran.
-- Jalankan MANUAL di Supabase SQL Editor sesudah migration 006.
-- Jika game tidak memiliki pendaftar, aplikasi tetap melakukan DELETE permanen.
-- Jika memiliki pendaftar, penanda deleted_at menjaga foreign key dan riwayat.

begin;

alter table public.ridoooo_divisions
  add column if not exists deleted_at timestamptz;

-- Akses yang sudah dibuat migration 006 tetap berlaku:
-- pengunjung membaca katalog, Admin yang dapat menghapus/mengubah game.

commit;
