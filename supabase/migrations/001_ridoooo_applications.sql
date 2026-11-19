-- RIDOOOO / migration 001. Run in Supabase SQL Editor, project-owner context.
create table if not exists public.ridoooo_admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create table if not exists public.ridoooo_divisions (
 code text primary key, name text not null, is_active boolean not null default true
);
insert into public.ridoooo_divisions(code,name) values
 ('mlbb','Mobile Legends'),('valorant','Valorant'),
 ('pubg','PUBG Mobile'),('efootball','eFootball')
on conflict(code) do nothing;

create table if not exists public.ridoooo_applications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 division_code text not null references public.ridoooo_divisions(code),
 full_name text not null check(length(trim(full_name)) between 2 and 160),
 email text not null check(length(trim(email)) between 3 and 254),
 study_program text not null check(length(trim(study_program)) between 2 and 150),
 entry_year integer not null check(entry_year between 2000 and 2100),
 game_nickname text not null check(length(trim(game_nickname)) between 1 and 100),
 whatsapp text not null check(whatsapp ~ '^[0-9]{10,15}$'),
 motivation text not null default '' check(length(motivation) <= 2000),
 ktm_path text not null,
 instagram_path text not null,
 status text not null default 'pending' check(status in ('pending','accepted','rejected','removed')),
 review_note text,
 reviewed_by uuid references auth.users(id) on delete set null,
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 constraint ridoooo_document_owner check(
  ktm_path like (user_id::text || '/' || id::text || '/ktm.%')
  and instagram_path like (user_id::text || '/' || id::text || '/instagram.%')
 )
);
create unique index if not exists ridoooo_one_active_application
 on public.ridoooo_applications(user_id,division_code)
 where status in ('pending','accepted');
create index if not exists ridoooo_applications_user_date
 on public.ridoooo_applications(user_id,created_at desc);

create or replace function public.ridoooo_is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
 select exists(select 1 from public.ridoooo_admin_users
   where user_id=(select auth.uid()));
$$;
revoke all on function public.ridoooo_is_admin() from public;
revoke execute on function public.ridoooo_is_admin() from anon;
grant execute on function public.ridoooo_is_admin() to authenticated;

alter table public.ridoooo_admin_users enable row level security;
alter table public.ridoooo_divisions enable row level security;
alter table public.ridoooo_applications enable row level security;
drop policy if exists "ridoooo_admin_own" on public.ridoooo_admin_users;
create policy "ridoooo_admin_own" on public.ridoooo_admin_users
 for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists "ridoooo_divisions_read" on public.ridoooo_divisions;
create policy "ridoooo_divisions_read" on public.ridoooo_divisions
 for select to anon,authenticated using(true);
drop policy if exists "ridoooo_apps_read" on public.ridoooo_applications;
create policy "ridoooo_apps_read" on public.ridoooo_applications
 for select to authenticated
 using(user_id=(select auth.uid()) or (select public.ridoooo_is_admin()));
drop policy if exists "ridoooo_apps_create" on public.ridoooo_applications;
create policy "ridoooo_apps_create" on public.ridoooo_applications
 for insert to authenticated
 with check(
  user_id=(select auth.uid()) and status='pending'
  and review_note is null and reviewed_by is null and reviewed_at is null
  and exists(select 1 from public.ridoooo_divisions d
     where d.code=division_code and d.is_active)
 );
revoke all on public.ridoooo_admin_users from anon,authenticated;
grant select on public.ridoooo_admin_users to authenticated;
revoke all on public.ridoooo_divisions from anon,authenticated;
grant select on public.ridoooo_divisions to anon,authenticated;
revoke all on public.ridoooo_applications from anon,authenticated;
grant select,insert on public.ridoooo_applications to authenticated;

create or replace function public.ridoooo_review_application(
 p_application_id uuid,p_decision text,p_note text default null
)
returns public.ridoooo_applications
language plpgsql security definer set search_path = ''
as $$
declare result public.ridoooo_applications;
begin
 if not public.ridoooo_is_admin() then
  raise exception 'Not authorized' using errcode='42501';
 end if;
 if p_decision not in ('accepted','rejected') then
  raise exception 'Invalid decision';
 end if;
 update public.ridoooo_applications
 set status=p_decision,reviewed_by=auth.uid(),reviewed_at=now(),
     review_note=nullif(trim(p_note),'')
 where id=p_application_id and status='pending'
 returning * into result;
 if not found then raise exception 'Application not pending'; end if;
 return result;
end;
$$;
revoke all on function public.ridoooo_review_application(uuid,text,text) from public;
revoke execute on function public.ridoooo_review_application(uuid,text,text) from anon;
grant execute on function public.ridoooo_review_application(uuid,text,text) to authenticated;

-- Private storage bucket with 2 MB MIME constraints.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('ridoooo-application-documents','ridoooo-application-documents',false,
 2097152,array['image/jpeg','image/png','application/pdf'])
on conflict(id) do update set
 public=false,file_size_limit=excluded.file_size_limit,
 allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "ridoooo_docs_upload" on storage.objects;
create policy "ridoooo_docs_upload" on storage.objects
 for insert to authenticated
 with check(bucket_id='ridoooo-application-documents'
  and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "ridoooo_docs_read" on storage.objects;
create policy "ridoooo_docs_read" on storage.objects
 for select to authenticated
 using(bucket_id='ridoooo-application-documents'
  and ((storage.foldername(name))[1]=(select auth.uid())::text
     or (select public.ridoooo_is_admin())));
drop policy if exists "ridoooo_docs_delete_orphans" on storage.objects;
create policy "ridoooo_docs_delete_orphans" on storage.objects
 for delete to authenticated
 using(bucket_id='ridoooo-application-documents'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and not exists(select 1 from public.ridoooo_applications a
      where a.ktm_path=name or a.instagram_path=name));

-- Admin authorization must be assigned manually by a trusted operator:
-- insert into public.ridoooo_admin_users(user_id) values ('ADMIN-AUTH-UUID');
