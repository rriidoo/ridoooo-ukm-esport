-- 003 - Pengakhiran Keanggotaan Divisi
-- Jalankan sekali di Supabase SQL Editor sebagai pemilik proyek.
-- Soft removal: riwayat pengajuan, dokumen dan akun mahasiswa tetap tersimpan.

create or replace function public.ridoooo_remove_member(
  p_application_id uuid,
  p_reason text
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
    raise exception 'Akses ditolak. Hanya Admin yang dapat mengakhiri keanggotaan.'
      using errcode = '42501';
  end if;

  if p_application_id is null then
    raise exception 'Pendaftaran anggota wajib dipilih.';
  end if;
  if p_reason is null or length(trim(p_reason)) < 5 or length(trim(p_reason)) > 500 then
    raise exception 'Alasan pengakhiran harus 5 sampai 500 karakter.';
  end if;

  update public.ridoooo_applications
     set status = 'removed',
         review_note = trim(p_reason),
         reviewed_by = auth.uid(),
         reviewed_at = now()
   where id = p_application_id
     and status = 'accepted'
   returning * into v_result;

  if not found then
    raise exception 'Keanggotaan tidak ditemukan atau tidak lagi berstatus Diterima.';
  end if;

  return v_result;
end;
$$;

revoke all on function public.ridoooo_remove_member(uuid,text) from public;
grant execute on function public.ridoooo_remove_member(uuid,text) to authenticated;

-- Member yang statusnya 'removed' tetap tidak boleh mendaftar ulang
-- ke divisi yang sama secara otomatis. Pendaftaran ulang otomatis hanya
-- berlaku setelah status 'rejected'.
drop index if exists public.ridoooo_one_active_application;
create unique index ridoooo_one_active_application
  on public.ridoooo_applications(user_id, division_code)
  where status in ('pending', 'accepted', 'removed');
