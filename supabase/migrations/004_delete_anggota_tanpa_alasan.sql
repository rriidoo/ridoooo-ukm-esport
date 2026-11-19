-- 004 - Delete anggota tanpa alasan
-- Jalankan sekali di Supabase SQL Editor SETELAH migration 003.
-- Status keanggotaan diubah menjadi 'removed' (soft delete).
-- Akun, dokumen dan riwayat pendaftaran tetap tersimpan.
-- Parameter p_reason tetap dipertahankan demi kompatibilitas RPC lama,
-- tetapi tidak wajib diisi dan tidak disimpan sebagai catatan.
-- Transaksi: kedua perubahan berhasil bersama atau dibatalkan jika ada error.

begin;

create or replace function public.ridoooo_remove_member(
  p_application_id uuid,
  p_reason text default null
)
returns public.ridoooo_applications
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result public.ridoooo_applications;
begin
  if not public.ridoooo_is_admin() then
    raise exception 'Akses ditolak. Hanya Admin yang dapat menghapus anggota.'
      using errcode = '42501';
  end if;

  if p_application_id is null then
    raise exception 'Anggota wajib dipilih.';
  end if;

  update public.ridoooo_applications
     set status = 'removed',
         review_note = null,
         reviewed_by = auth.uid(),
         reviewed_at = now()
   where id = p_application_id
     and status = 'accepted'
   returning * into v_result;

  if not found then
    raise exception 'Anggota tidak ditemukan atau tidak lagi berstatus Diterima.';
  end if;

  return v_result;
end;
$$;

revoke all on function public.ridoooo_remove_member(uuid,text) from public;
revoke execute on function public.ridoooo_remove_member(uuid,text) from anon;
grant execute on function public.ridoooo_remove_member(uuid,text) to authenticated;

-- Finalisasi revisi NIM (satu kali SQL bersama Delete Anggota).
-- Data pendaftaran lama tetap dipertahankan, NIM lama akan NULL sampai diisi.
alter table public.ridoooo_applications
  add column if not exists nim text;

alter table public.ridoooo_applications
  drop constraint if exists ridoooo_nim_digits;

alter table public.ridoooo_applications
  add constraint ridoooo_nim_digits
  check (nim is null or nim ~ '^[0-9]{6,20}$');

commit;
