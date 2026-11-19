import { supabase } from './supabase';

export const DEFAULT_HERO = {
  visible: true,
  badge: 'PENDAFTARAN ANGGOTA UKM ESPORTS',
  title: 'Bergabunglah dengan Komunitas Esports Universitas Telkom Purwokerto',
  description: 'Pendaftaran digital cepat dan mudah. Tunjukkan skill terbaikmu dan jadilah bagian dari komunitas esports Universitas Telkom Purwokerto.',
  cta: 'DAFTAR SEKARANG',
  banner_url: null,
};

export const DEFAULT_STATS = {
  visible: true,
  students: '1.200+',
  divisions: '4',
  champions: '12+',
};

export const DEFAULT_ADVANTAGES = [
  {
    id: 1, iconId: 'document', active: true,
    title: 'Pendaftaran 100% Online',
    description: 'Tak perlu repot cetak berkas. Semua proses dari pengisian formulir, data akun game, hingga upload berkas KTM dilakukan langsung melalui platform UKM.',
  },
  {
    id: 2, iconId: 'progress', active: true,
    title: 'Pantau Status Real-time',
    description: 'Dapatkan notifikasi transparan ke akun kamu setiap ada pembaruan status seleksi, jadwal aktivitas baru, dan jadwal scrim internal divisi.',
  },
  {
    id: 3, iconId: 'certificate', active: true,
    title: 'Sertifikat & Rekomendasi Kampus',
    description: 'Dukungan resmi delegasi kampus untuk turnamen IESPA, LIMA Esports, poin SKK/TAK kemahasiswaan, serta fasilitas coaching clinic berstandar pro.',
  },
];

export const DEFAULT_HOME_GAMES = [
  { code: 'MLBB', visible: true },
  { code: 'PUBG', visible: true },
  { code: 'VLRN', visible: true },
  { code: 'EFB', visible: true },
];

export function normalizeHomeContent(rows = []) {
  const values = Object.fromEntries(
    (rows || []).map(({ key, payload }) => [key, payload && typeof payload === 'object' ? payload : {}])
  );
  const hero = { ...DEFAULT_HERO, ...values.home_hero };
  // Sesuaikan hanya teks bawaan dari migration 005, tanpa menimpa konten yang telah diedit Admin.
  if (hero.title === 'Bergabunglah dengan Komunitas E-Sport Telkom Purwokerto') {
    hero.title = DEFAULT_HERO.title;
  }
  if (hero.description === 'Pendaftaran digital cepat dan mudah. Tunjukkan skill terbaikmu dan jadilah bagian dari komunitas esports Telkom University Purwokerto.') {
    hero.description = DEFAULT_HERO.description;
  }
  if (hero.badge === 'NEW SEASON REGISTRATION OPEN') {
    hero.badge = DEFAULT_HERO.badge;
  }
  return {
    hero,
    stats: { ...DEFAULT_STATS, ...values.home_stats },
    advantages: Array.isArray(values.home_advantages?.items)
      ? values.home_advantages.items
      : DEFAULT_ADVANTAGES,
    games: Array.isArray(values.home_games?.items)
      ? values.home_games.items
      : DEFAULT_HOME_GAMES,
  };
}

export async function fetchHomeContent() {
  const { data, error } = await supabase.from('ridoooo_site_content')
    .select('key,payload')
    .in('key', ['home_hero', 'home_stats', 'home_advantages', 'home_games']);
  if (error) throw error;
  return normalizeHomeContent(data);
}

export async function saveHomeContentSection(key, payload) {
  const { data, error } = await supabase.from('ridoooo_site_content')
    .update({ payload, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select('key')
    .single();
  if (error) throw error;
  return data;
}
