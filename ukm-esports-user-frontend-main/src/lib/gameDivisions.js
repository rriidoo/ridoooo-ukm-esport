import { supabase } from './supabase';

// Fallback keeps existing User pages usable before migration 006 is run.
export const DEFAULT_GAME_DIVISIONS = [
  { code: 'mlbb', name: 'Mobile Legends', short: 'MLBB', division_label: 'Divisi MOBA', description: 'Divisi MOBA mobile 5v5 untuk turnamen mahasiswa dan liga kampus.', is_active: true, is_visible: true, display_order: 1, logo_url: null, banner_url: null },
  { code: 'pubg', name: 'PUBG Mobile', short: 'PUBG', division_label: 'Divisi Battle Royale', description: 'Divisi Battle Royale 4-man squad kompetisi IESPA/LIMA nasional.', is_active: true, is_visible: true, display_order: 2, logo_url: null, banner_url: null },
  { code: 'valorant', name: 'Valorant', short: 'VLRN', division_label: 'Tactical FPS PC', description: 'Divisi Tactical FPS PC turnamen antarmahasiswa dan piala rektor.', is_active: true, is_visible: true, display_order: 3, logo_url: null, banner_url: null },
  { code: 'efootball', name: 'eFootball', short: 'EFB', division_label: 'Sports Simulation', description: 'Divisi simulasi olahraga sepak bola konsol dan mobile universitas.', is_active: true, is_visible: true, display_order: 4, logo_url: null, banner_url: null },
];

export async function fetchGameDivisions({ includeDeleted = false } = {}) {
  const columns = 'code,name,is_active,short,division_label,description,is_visible,logo_url,banner_url,display_order';
  let query = supabase.from('ridoooo_divisions')
    .select(columns + ',deleted_at')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });
  if (!includeDeleted) query = query.is('deleted_at', null);
  let { data, error } = await query;

  // Tetap kompatibel selama SQL 007 belum dijalankan oleh Admin.
  if (error && /deleted_at/i.test(error.message || '')) {
    ({ data, error } = await supabase.from('ridoooo_divisions')
      .select(columns)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true }));
  }
  if (error) throw error;
  return data || [];
}

export function homeVisibleDivisions(divisions = DEFAULT_GAME_DIVISIONS, featured = []) {
  // Keep existing Beranda order/visibility if Admin edits a division's short tag.
  const legacy = { mlbb: 'MLBB', pubg: 'PUBG', valorant: 'VLRN', efootball: 'EFB' };
  const byTag = new Map();
  for (const division of divisions) {
    byTag.set(division.short, division);
    if (legacy[division.code]) byTag.set(legacy[division.code], division);
  }
  const result = [];
  const used = new Set();
  for (const item of featured) {
    const division = byTag.get(item.code);
    if (!division || used.has(division.code)) continue;
    used.add(division.code);
    if (item.visible !== false && division.is_visible !== false) result.push(division);
  }
  for (const division of divisions) {
    if (!used.has(division.code) && division.is_visible !== false) result.push(division);
  }
  return result;
}
