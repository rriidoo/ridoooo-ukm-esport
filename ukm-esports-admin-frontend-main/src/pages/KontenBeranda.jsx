import AdminSidebarProfile from '../components/AdminSidebarProfile';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_GAME_DIVISIONS, fetchGameDivisions } from '../lib/gameDivisions';
import { DEFAULT_HERO, DEFAULT_STATS, DEFAULT_ADVANTAGES, fetchHomeContent, saveHomeContentSection } from '../lib/homeContent';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Gamepad2,
  Home,
  Image as ImageIcon,
  Pencil,
  Save,
  Table2,
  Trophy,
} from 'lucide-react';
import logo from '../assets/logo-figma.png';
import dashboardIcon from '../assets/ui-icons/Icon.png';
import pendaftarIcon from '../assets/ui-icons/Icon-3.png';
import anggotaIcon from '../assets/ui-icons/Icon-7.png';
import heroIcon from '../assets/konten-icons/Container.png';
import statisticIcon from '../assets/konten-icons/Background.png';
import advantageIcon from '../assets/konten-icons/Background-1.png';
import onlineIcon from '../assets/konten-icons/Background-2.png';
import realtimeIcon from '../assets/konten-icons/Background-3.png';
import certificateIcon from '../assets/konten-icons/Background-4.png';
import gameIcon from '../assets/konten-icons/Background-5.png';
import rosterAdvantageIcon from '../assets/edit-keunggulan-icons/Icon.png';
import esportsAdvantageIcon from '../assets/edit-keunggulan-icons/Icon-1.png';
import officialAdvantageIcon from '../assets/edit-keunggulan-icons/Icon-2.png';

const initialGames = [
  { order: 1, code: 'MLBB', name: 'Mobile Legends: Bang Bang', detail: 'Divisi MOBA • 240 Anggota', visible: true },
  { order: 2, code: 'PUBG', name: 'PUBG Mobile', detail: 'Divisi Battle Royale • 120 Anggota', visible: true },
  { order: 3, code: 'VLRN', name: 'Valorant', detail: 'Divisi Tactical FPS • 135 Anggota', visible: true },
  { order: 4, code: 'EFB', name: 'eFootball', detail: 'Divisi Sports Sim • 85 Anggota', visible: true },
];

const initialAdvantages = [
  {
    icon: onlineIcon,
    title: 'Pendaftaran 100% Online',
    description: 'Tak perlu repot cetak berkas, semua proses digital langsung dari gawai.',
  },
  {
    icon: realtimeIcon,
    title: 'Pantau Status Real-time',
    description: 'Dapatkan notifikasi langsung ke dashboard status seleksi dan verifikasi berkas.',
  },
  {
    icon: certificateIcon,
    title: 'Sertifikat & Rekomendasi Kampus',
    description: 'Dukungan resmi delegasi turnamen nasional dan poin SKK / TAK universitas.',
  },
];

export default function KontenBeranda({ adminUser, onLogout, onNavigate }) {
  const fileInputRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [statVisible, setStatVisible] = useState(true);
  const [games, setGames] = useState(initialGames);
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [advantages, setAdvantages] = useState(initialAdvantages);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [saving, setSaving] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchHomeContent(),
      fetchGameDivisions().catch(() => DEFAULT_GAME_DIVISIONS),
    ]).then(([content, divisions]) => {
      if (!mounted) return;
      setHero(content.hero);
      setHeroVisible(content.hero.visible !== false);
      setStats(content.stats);
      setStatVisible(content.stats.visible !== false);
      const aliases = { mlbb: 'MLBB', pubg: 'PUBG', valorant: 'VLRN', efootball: 'EFB' };
      const catalogue = divisions.map((division) => {
        const seed = initialGames.find((item) => item.code === aliases[division.code]);
        return {
          id: division.code,
          code: division.short,
          name: division.name,
          detail: seed?.detail || division.division_label || 'Divisi Game',
          divisionVisible: division.is_visible !== false,
          visible: true,
        };
      });
      const byCode = new Map();
      for (const item of catalogue) {
        byCode.set(item.code, item);
        if (aliases[item.id]) byCode.set(aliases[item.id], item);
      }
      const arranged = [];
      const used = new Set();
      for (const entry of content.games) {
        const division = byCode.get(entry.code);
        if (!division || used.has(division.id)) continue;
        used.add(division.id);
        arranged.push({ ...division, visible: entry.visible !== false });
      }
      for (const division of catalogue) {
        if (!used.has(division.id)) arranged.push(division);
      }
      setGames(arranged.map((item, i) => ({ ...item, order: i + 1 })));
      const iconById = {
        document: onlineIcon, progress: realtimeIcon, certificate: certificateIcon,
        roster: rosterAdvantageIcon, esports: esportsAdvantageIcon, official: officialAdvantageIcon,
      };
      setAdvantages(content.advantages.map((item) => ({ ...item, icon: iconById[item.iconId] || onlineIcon })));
    }).catch(() => {
      if (mounted) setFeedback('Konten belum tersambung. Jalankan SQL migration 005 di Supabase agar perubahan bisa disimpan.');
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!bannerFile) { setBannerPreview(''); return; }
    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  async function saveHero() {
    if (saving) return;
    const next = {
      ...hero,
      visible: heroVisible,
      badge: hero.badge.trim(),
      title: hero.title.trim(),
      description: hero.description.trim(),
      cta: hero.cta.trim(),
    };
    if (!next.title || !next.cta || !next.description || !next.badge) {
      setFeedback('Lengkapi semua teks Hero sebelum menyimpan.');
      return;
    }
    if (next.title.length > 180 || next.description.length > 600 || next.badge.length > 100 || next.cta.length > 60) {
      setFeedback('Teks Hero terlalu panjang. Perpendek judul, deskripsi, badge, atau CTA.');
      return;
    }
    setSaving('hero');
    setFeedback('');
    let uploadedPath = null;
    try {
      if (bannerFile) {
        const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
        const extension = extensions[bannerFile.type];
        if (!extension || bannerFile.size === 0 || bannerFile.size > 2 * 1024 * 1024) {
          throw new Error('Gambar Hero harus JPG/PNG/WebP dan maksimal 2 MB.');
        }
        uploadedPath = 'home/' + crypto.randomUUID() + '.' + extension;
        const { error: uploadError } = await supabase.storage.from('ridoooo-site-banners')
          .upload(uploadedPath, bannerFile, { upsert: false, contentType: bannerFile.type });
        if (uploadError) throw uploadError;
        next.banner_url = supabase.storage.from('ridoooo-site-banners').getPublicUrl(uploadedPath).data.publicUrl;
      }
      await saveHomeContentSection('home_hero', next);
      setHero(next);
      setBannerFile(null);
      setFeedback('Hero tersimpan. Perubahan tampil pada website User setelah halaman diperbarui.');
    } catch (error) {
      if (uploadedPath) await supabase.storage.from('ridoooo-site-banners').remove([uploadedPath]);
      setFeedback('Gagal menyimpan Hero: ' + (error.message || 'Periksa koneksi Supabase dan SQL 005.'));
    } finally {
      setSaving('');
    }
  }

  async function saveStats() {
    if (saving) return;
    const next = { ...stats, visible: statVisible };
    if ([next.students, next.divisions, next.champions].some((value) => !value.trim() || value.length > 30)) {
      setFeedback('Isi seluruh statistik (maksimal 30 karakter per angka).');
      return;
    }
    setSaving('stats');
    setFeedback('');
    try {
      await saveHomeContentSection('home_stats', next);
      setStats(next);
      setFeedback('Statistik tersimpan dan siap ditampilkan di website User.');
    } catch (error) {
      setFeedback('Gagal menyimpan statistik: ' + (error.message || 'Periksa SQL 005.'));
    } finally {
      setSaving('');
    }
  }

  async function saveGames(next) {
    if (saving) return;
    setSaving('games');
    setFeedback('');
    try {
      await saveHomeContentSection('home_games', {
        items: next.map(({ code, visible }) => ({ code, visible })),
      });
      setGames(next.map((item, i) => ({ ...item, order: i + 1 })));
      setFeedback('Urutan dan visibilitas game sudah tersimpan di website User.');
    } catch (error) {
      setFeedback('Gagal menyimpan game: ' + (error.message || 'Periksa SQL 005.'));
    } finally {
      setSaving('');
    }
  }

  function toggleGameVisibility(code) {
    saveGames(games.map((item) => (item.code === code ? { ...item, visible: !item.visible } : item)));
  }

  function moveGame(index, direction) {
    const other = index + direction;
    if (other < 0 || other >= games.length) return;
    const next = [...games];
    [next[index], next[other]] = [next[other], next[index]];
    saveGames(next);
  }

  function resetBannerToDefault() {
    setBannerFile(null);
    setHero((current) => ({ ...current, banner_url: null }));
    setFeedback('Gambar bawaan dipilih. Klik Simpan Perubahan Hero agar perubahan tampil di website User.');
  }

  function chooseBanner(file) {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type) || file.size === 0 || file.size > 2 * 1024 * 1024) {
      setFeedback('Gambar harus JPG/PNG/WebP dengan ukuran maksimal 2 MB.');
      return;
    }
    setFeedback('Gambar dipilih. Tekan Simpan Perubahan Hero untuk mengunggahnya.');
    setBannerFile(file);
  }

  return (
    <main className="konten-page">
      <aside className="beranda-sidebar">
        <div className="beranda-brand">
          <img src={logo} alt="Logo UKM Esports Tel-U" />
          <div className="beranda-brand__copy">
            <strong>UKM ESPORTS TEL-U</strong>
            <span>ADMIN CONSOLE</span>
          </div>
        </div>

        <nav className="beranda-nav" aria-label="Navigasi admin">
          <button type="button" className="beranda-nav__item" onClick={() => onNavigate?.('/beranda')}>
            <img className="ui-nav-icon" src={dashboardIcon} alt="" aria-hidden="true" />
            <span>Beranda</span>
          </button>

          <button type="button" className="beranda-nav__item beranda-nav__item--active">
            <FileText size={17} strokeWidth={1.8} />
            <span>Kelola Konten</span>
          </button>

          <button type="button" className="beranda-nav__item" onClick={() => onNavigate?.('/pendaftar')}>
            <img className="ui-nav-icon ui-nav-icon--pendaftar" src={pendaftarIcon} alt="" aria-hidden="true" />
            <span>Pendaftar</span>
          </button>

          <button type="button" className="beranda-nav__item" onClick={() => onNavigate?.('/anggota')}>
            <img className="ui-nav-icon ui-nav-icon--anggota" src={anggotaIcon} alt="" aria-hidden="true" />
            <span>Anggota</span>
          </button>

          <button type="button" className="beranda-nav__item" onClick={() => onNavigate?.('/export-data')}>
            <Table2 size={17} strokeWidth={1.8} />
            <span>Export Data</span>
          </button>
        </nav>

        <AdminSidebarProfile adminUser={adminUser} onLogout={onLogout} />
      </aside>

      <section className="konten-main">
        <header className="beranda-header">
          <h1>Kelola Konten</h1>
          <div className="beranda-header__actions">
            <div className="beranda-period">
              <span className="beranda-period__dot" />
              <span>Data Pendaftaran UKM Esports</span>
            </div>
          </div>
        </header>

        <div className="konten-content">
          <div className="konten-tabs" role="tablist" aria-label="Kelola Konten">
            <button type="button" className="konten-tab konten-tab--active">
              <Home size={13} strokeWidth={2} />
              <span>Beranda</span>
            </button>
            <button type="button" className="konten-tab" onClick={() => onNavigate?.('/konten-game-divisi')}>
              <Gamepad2 size={13} strokeWidth={1.9} />
              <span>Game / Divisi</span>
            </button>
            <button type="button" className="konten-tab" onClick={() => onNavigate?.('/konten-event')}>
              <Trophy size={13} strokeWidth={1.9} />
              <span>Event</span>
            </button>
          </div>

          {feedback && <p role="status" aria-live="polite" style={{ color: '#e5efff', padding: '12px 16px', border: '1px solid #31435f', borderRadius: 10, margin: '0 0 16px' }}>{feedback}</p>}

          <section className="konten-card konten-card--hero">
            <div className="konten-card__head">
              <div className="konten-card__heading">
                <img src={heroIcon} alt="" aria-hidden="true" className="konten-section-icon konten-section-icon--hero" />
                <div>
                  <h2>Hero Section</h2>
                  <p>Konten visual utama pembuka di beranda website mahasiswa.</p>
                </div>
              </div>
              <label className="konten-switch-row">
                <span>Tampilkan di Website</span>
                <input type="checkbox" checked={heroVisible} onChange={(e) => setHeroVisible(e.target.checked)} />
                <i />
              </label>
            </div>

            <div className="konten-hero-grid">
              <div className="konten-form-stack">
                <label className="konten-field">
                  <span>Badge / Teks Pengumuman</span>
                  <input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
                </label>

                <label className="konten-field">
                  <span>Judul Utama</span>
                  <input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
                </label>

                <label className="konten-field">
                  <span>Deskripsi Singkat</span>
                  <textarea rows={3} value={hero.description} onChange={(e) => setHero({ ...hero, description: e.target.value })} />
                </label>

                <label className="konten-field">
                  <span>Teks Tombol CTA</span>
                  <input value={hero.cta} onChange={(e) => setHero({ ...hero, cta: e.target.value })} />
                </label>
              </div>

              <div className="konten-banner-control">
                <span className="konten-banner-control__label">Banner / Gambar Utama</span>
                <div className="konten-banner-preview">
                  {(bannerPreview || hero.banner_url) && <img src={bannerPreview || hero.banner_url} alt="Preview gambar hero" style={{ position: 'absolute', inset: 0, width: '100%', height: 'calc(100% - 41px)', objectFit: 'cover' }} />}
                  <div className="konten-banner-preview__glow" />
                  <div className="konten-banner-preview__screen">
                    <span>TEL-U</span>
                    <strong>ESPORTS</strong>
                  </div>
                  <div className="konten-banner-preview__stage" />
                  <div className="konten-banner-preview__meta">
                    <div>
                      <strong>{bannerFile?.name || (hero.banner_url ? 'Gambar Hero tersimpan' : 'Gambar bawaan website')}</strong>
                      <span>{bannerFile ? (bannerFile.size / 1048576).toFixed(2) + ' MB • Belum disimpan' : hero.banner_url ? 'Aktif di website User' : 'Belum ada gambar unggahan'}</span>
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()}>
                      <ImageIcon size={12} strokeWidth={1.8} />
                      Ganti Gambar
                    </button>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={(e) => { chooseBanner(e.target.files?.[0]); e.target.value = ''; }} />
                <p className="konten-help">Format JPG/PNG/WebP, rekomendasi rasio 16:9, maksimal ukuran file 2 MB.</p>
                {(hero.banner_url || bannerFile) && (
                  <button type="button" className="konten-secondary-button" disabled={Boolean(saving)} onClick={resetBannerToDefault}>
                    Kembalikan Gambar Bawaan
                  </button>
                )}
              </div>
            </div>

            <div className="konten-card__footer">
              <button type="button" className="konten-save-button" onClick={saveHero} disabled={Boolean(saving)}>
                <span className="konten-save-button__check">✓</span>
                {saving === 'hero' ? 'Menyimpan...' : 'Simpan Perubahan Hero'}
              </button>
            </div>
          </section>

          <section className="konten-card">
            <div className="konten-card__head">
              <div className="konten-card__heading">
                <img src={statisticIcon} alt="" aria-hidden="true" className="konten-section-icon konten-section-icon--stats" />
                <div>
                  <h2>Statistik Beranda</h2>
                  <p>Pengaturan angka pencapaian yang disorot pada homepage mahasiswa.</p>
                </div>
              </div>
              <label className="konten-switch-row">
                <span>Tampilkan di Website</span>
                <input type="checkbox" checked={statVisible} onChange={(e) => setStatVisible(e.target.checked)} />
                <i />
              </label>
            </div>

            <div className="konten-stat-grid">
              <label className="konten-stat-field">
                <span>Total Mahasiswa</span>
                <input value={stats.students} onChange={(e) => setStats({ ...stats, students: e.target.value })} />
                <small>Jumlah mahasiswa yang bergabung</small>
              </label>
              <label className="konten-stat-field">
                <span>Divisi Game</span>
                <input value={stats.divisions} onChange={(e) => setStats({ ...stats, divisions: e.target.value })} />
                <small>Total cabang game aktif</small>
              </label>
              <label className="konten-stat-field">
                <span>Juara Nasional</span>
                <input value={stats.champions} onChange={(e) => setStats({ ...stats, champions: e.target.value })} />
                <small>Trofi & prestasi kompetisi</small>
              </label>
            </div>

            <div className="konten-card__footer">
              <button type="button" className="konten-save-button" onClick={saveStats} disabled={Boolean(saving)}>
                <Save size={12} strokeWidth={2} />
                {saving === 'stats' ? 'Menyimpan...' : 'Simpan Statistik'}
              </button>
            </div>
          </section>

          <section className="konten-card">
            <div className="konten-card__head">
              <div className="konten-card__heading">
                <img src={advantageIcon} alt="" aria-hidden="true" className="konten-section-icon" />
                <div>
                  <h2>Keunggulan Komunitas</h2>
                  <p>Pilar keunggulan UKM yang dipromosikan kepada calon pendaftar.</p>
                </div>
              </div>
              <button type="button" className="konten-secondary-button" onClick={() => onNavigate?.('/edit-konten-beranda-keunggulan')}>
                <Pencil size={11} strokeWidth={1.8} />
                Edit Keunggulan
              </button>
            </div>

            <div className="konten-feature-list">
              {advantages.map((item) => (
                <article className="konten-feature-row" key={item.title}>
                  <img src={item.icon} alt="" aria-hidden="true" />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                  <span className="konten-active-badge">{item.active === false ? 'Nonaktif' : 'Aktif'}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="konten-card">
            <div className="konten-card__head konten-card__head--compact">
              <div className="konten-card__heading">
                <img src={gameIcon} alt="" aria-hidden="true" className="konten-section-icon" />
                <div>
                  <div className="konten-heading-with-badge">
                    <h2>Game yang Ditampilkan</h2>
                    <span>{games.filter((item) => item.visible && item.divisionVisible !== false).length} Game Aktif</span>
                  </div>
                  <p>Urutan dan visibilitas game yang langsung disorot pada landing page.</p>
                </div>
              </div>
            </div>

            <div className="konten-game-list">
              {games.map((game, index) => (
                <article className="konten-game-row" key={game.code}>
                  <span className="konten-game-order">{game.order}</span>
                  <span className="konten-game-code">{game.code}</span>
                  <div className="konten-game-copy">
                    <strong>{game.name}</strong>
                    <span>{game.detail}</span>
                  </div>
                  <span className={game.visible && game.divisionVisible !== false ? 'konten-show-badge' : 'konten-show-badge konten-show-badge--hidden'}>{game.divisionVisible === false ? 'Disembunyikan dari Game/Divisi' : game.visible ? 'Tampil' : 'Disembunyikan'}</span>
                  <div className="konten-order-actions" aria-label={`Atur urutan ${game.name}`}>
                    <button type="button" disabled={index === 0 || Boolean(saving)} onClick={() => moveGame(index, -1)} aria-label={'Naikkan ' + game.name}>
                      <ChevronUp size={14} strokeWidth={1.8} />
                    </button>
                    <button type="button" disabled={index === games.length - 1 || Boolean(saving)} onClick={() => moveGame(index, 1)} aria-label={'Turunkan ' + game.name}>
                      <ChevronDown size={14} strokeWidth={1.8} />
                    </button>
                  </div>
                  <button type="button" className="konten-hide-button" disabled={Boolean(saving) || game.divisionVisible === false} title={game.divisionVisible === false ? 'Aktifkan lagi melalui tab Game/Divisi.' : 'Atur tampilan kartu di Beranda.'} onClick={() => toggleGameVisibility(game.code)}>{game.visible ? 'Sembunyikan' : 'Tampilkan'}</button>
                </article>
              ))}
            </div>

            <p className="konten-note">
              <span>ⓘ</span>
              Catatan: Urutan menentukan susunan kartu game pada halaman utama. Kelola detail spesifikasi &amp; pendaftaran divisi melalui tab Game / Divisi.
            </p>
          </section>

        </div>
      </section>
    </main>
  );
}
