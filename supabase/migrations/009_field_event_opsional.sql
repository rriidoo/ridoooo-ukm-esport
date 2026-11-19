

begin;

-- Tanggal dan slot boleh tidak ditentukan.
alter table public.ridoooo_events
  alter column start_date drop not null,
  alter column end_date drop not null,
  alter column slots drop not null;

-- Kolom teks opsional disimpan sebagai string kosong jika tidak diisi.
alter table public.ridoooo_events
  alter column category set default '',
  alter column description set default '';

-- Lepaskan syarat minimal pada field yang sekarang opsional.
alter table public.ridoooo_events
  drop constraint if exists ridoooo_events_name_check,
  drop constraint if exists ridoooo_events_category_check,
  drop constraint if exists ridoooo_events_description_check,
  drop constraint if exists ridoooo_event_games,
  drop constraint if exists ridoooo_event_name_length,
  drop constraint if exists ridoooo_event_category_length,
  drop constraint if exists ridoooo_event_description_length;

alter table public.ridoooo_events
  add constraint ridoooo_event_name_length
    check (char_length(btrim(name)) between 1 and 160),
  add constraint ridoooo_event_category_length
    check (char_length(btrim(category)) <= 100),
  add constraint ridoooo_event_description_length
    check (char_length(btrim(description)) <= 2000),
  add constraint ridoooo_event_games
    check (cardinality(games) between 0 and 20);

-- Syarat tanggal selesai >= mulai otomatis hanya berlaku jika keduanya diisi.
-- Constraint slots (1–100000) juga tetap aman untuk nilai NULL.

commit;
