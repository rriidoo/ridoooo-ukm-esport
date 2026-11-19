import { supabase } from './supabase';

const COLUMNS = 'id,name,category,games,start_date,end_date,prize_pool,slots,status,description,benefit,regulation_url,banner_url,created_at,updated_at';

export async function fetchPublicEvents() {
  const { data, error } = await supabase.from('ridoooo_events')
    .select(COLUMNS)
    .eq('status', 'TAMPIL')
    .order('end_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAdminEvents() {
  const { data, error } = await supabase.from('ridoooo_events')
    .select(COLUMNS)
    .order('end_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export function formatEventDate(iso, options = {}) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '—';
  const date = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric', ...options,
  }).format(date);
}
