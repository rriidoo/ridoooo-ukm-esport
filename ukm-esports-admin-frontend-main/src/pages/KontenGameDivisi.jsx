import AdminSidebarProfile from '../components/AdminSidebarProfile';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchGameDivisions } from '../lib/gameDivisions';
import {
  FileText,
  Eye,
  EyeOff,
  Gamepad2,
  Home,
  ImageUp,
  Pencil,
  Plus,
  Save,
  Table2,
  Trash2,
  Trophy,
} from 'lucide-react';
import logo from '../assets/logo-figma.png';
import dashboardIcon from '../assets/ui-icons/Icon.png';
import pendaftarIcon from '../assets/ui-icons/Icon-3.png';
import anggotaIcon from '../assets/ui-icons/Icon-7.png';
import gameSectionIcon from '../assets/game-divisi-icons/game-section-icon.png';
import mlbbLogo from '../assets/game-divisi-icons/mlbb.png';
import pubgLogo from '../assets/game-divisi-icons/pubg.png';

const gameSeed = [
  {
    id: 'mlbb',
    name: 'Mobile Legends: Bang Bang',
    short: 'MLBB',
    division: 'Divisi MOBA',
    description: 'Divisi MOBA mobile 5v5 untuk turnamen mahasiswa dan liga kampus.',
    registration: 'DIBUKA',
    visible: true,
    logo: mlbbLogo,
    logoName: 'mlbb-emblem.png',
    logoMeta: '512 × 512 px · PNG',
    bannerName: 'mlbb-banner.webp',
    bannerMeta: '1920 × 1080 px · 420 KB',
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile',
    short: 'PUBG',
    division: 'Divisi Battle Royale',
    description: 'Divisi Battle Royale 4-man squad kompetisi IESPA/LIMA nasional.',
    registration: 'DIBUKA',
    visible: true,
    logo: pubgLogo,
    logoName: 'pubg-logo.png',
    logoMeta: '512 × 512 px · PNG',
    bannerName: 'pubg-banner.webp',
    bannerMeta: '1920 × 1080 px · 386 KB',
  },
  {
    id: 'valorant',
    name: 'Valorant',
    short: 'VLRN',
    division: 'Tactical FPS PC',
    description: 'Divisi Tactical FPS PC turnamen antarmahasiswa dan piala rektor.',
    registration: 'DIBUKA',
    visible: true,
    logo: null,
    logoName: 'valorant-logo.png',
    logoMeta: '512 × 512 px · PNG',
    bannerName: 'valorant-banner.webp',
    bannerMeta: '1920 × 1080 px · 404 KB',
  },
  {
    id: 'efootball',
    name: 'eFootball',
    short: 'EFB',
    division: 'Sports Simulation',
    description: 'Divisi simulasi olahraga sepak bola konsol dan mobile universitas.',
    registration: 'DITUTUP',
    visible: true,
    logo: null,
    logoName: 'efootball-logo.png',
    logoMeta: '512 × 512 px · PNG',
    bannerName: 'efootball-banner.webp',
    bannerMeta: '1920 × 1080 px · 395 KB',
  },
];

function toUiGame(row) {
  const fallback = gameSeed.find((item) => item.id === row.code);
  return {
    ...fallback,
    id: row.code,
    name: row.name,
    short: row.short || fallback?.short || row.code.toUpperCase().slice(0, 5),
    division: row.division_label || fallback?.division || 'Divisi Game',
    description: row.description || fallback?.description || '',
    registration: row.is_active ? 'DIBUKA' : 'DITUTUP',
    visible: row.is_visible !== false,
    logo: row.logo_url || fallback?.logo || null,
    logo_url: row.logo_url || null,
    banner_url: row.banner_url || null,
    logoName: row.logo_url ? 'Logo tersimpan' : fallback?.logoName || 'Belum ada logo',
    logoMeta: row.logo_url ? 'Gambar publik' : fallback?.logoMeta || '',
    bannerName: row.banner_url ? 'Banner tersimpan' : fallback?.bannerName || 'Belum ada banner',
    bannerMeta: row.banner_url ? 'Gambar publik' : fallback?.bannerMeta || '',
    display_order: row.display_order ?? 100,
  };
}

async function validateGameImage(file, type) {
  if (!file) return null;
  const maximum = type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
  const acceptable = ['image/jpeg', 'image/png', 'image/webp'];
  const validExt = { 'image/jpeg': ['jpg', 'jpeg'], 'image/png': ['png'], 'image/webp': ['webp'] };
  if (!acceptable.includes(file.type) || !validExt[file.type].includes(file.name.split('.').pop().toLowerCase())) {
    return 'Gunakan format JPG, PNG, atau WebP untuk ' + type + '.';
  }
  if (file.size === 0 || file.size > maximum) return type === 'logo' ? 'Logo harus maksimal 2 MB.' : 'Banner harus maksimal 5 MB.';
  try {
    const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const ok = file.type === 'image/jpeg'
      ? b[0] === 255 && b[1] === 216 && b[2] === 255
      : file.type === 'image/png'
        ? [137,80,78,71,13,10,26,10].every((v, i) => b[i] === v)
        : String.fromCharCode(...b.slice(0,4)) === 'RIFF' && String.fromCharCode(...b.slice(8,12)) === 'WEBP';
    if (!ok) return 'Isi file ' + type + ' tidak cocok dengan format gambar.';
  } catch { return 'File gambar tidak dapat dibaca.'; }
  return null;
}

function ImageDetails({ src, file, fallback = '' }) {
  const [dimensions, setDimensions] = useState(null);

  useEffect(() => {
    setDimensions(null);
    if (!src) return;
    let active = true;
    const image = new Image();
    image.onload = () => {
      if (active) setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      if (active) setDimensions({ unavailable: true });
    };
    image.src = src;
    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [src]);

  if (!src) return <span>{fallback || 'Belum ada gambar'}</span>;
  if (!dimensions) return <span>Membaca ukuran gambar...</span>;
  if (dimensions.unavailable) return <span>Ukuran gambar tidak tersedia</span>;

  const extension = file
    ? file.name.split('.').pop().toUpperCase()
    : src.split(/[?#]/)[0].split('.').pop().toUpperCase();
  const fileSize = file ? ' · ' + (file.size / 1024).toFixed(1) + ' KB' : '';
  return <span>{dimensions.width} × {dimensions.height} px · {extension}{fileSize}</span>;
}

function GameLogo({ game, large = false }) {
  if (game.logo) {
    return <img className={large ? 'game-divisi-logo game-divisi-logo--large' : 'game-divisi-logo'} src={game.logo} alt="" aria-hidden="true" />;
  }
  return (
    <span className={large ? 'game-divisi-logo-fallback game-divisi-logo-fallback--large' : 'game-divisi-logo-fallback'} aria-hidden="true">
      {game.short.slice(0, 2)}
    </span>
  );
}

export default function KontenGameDivisi({ adminUser, onLogout, onNavigate }) {
  const [games, setGames] = useState(gameSeed);
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const editingGame = useMemo(() => games.find((item) => item.id === editingId) || null, [games, editingId]);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetchGameDivisions().then((rows) => {
      if (mounted) setGames(rows.map(toUiGame));
    }).catch(() => {
      if (mounted) setFeedback('Kelola Game/Divisi belum aktif. Jalankan migration 006 di Supabase.');
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!logoFile) { setLogoPreview(''); return; }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    if (!bannerFile) { setBannerPreview(''); return; }
    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  async function chooseImage(file, type) {
    if (!file) return;
    const error = await validateGameImage(file, type);
    if (error) { setFeedback(error); return; }
    if (type === 'logo') setLogoFile(file);
    else setBannerFile(file);
    setFeedback('Gambar ' + type + ' dipilih. Klik Simpan untuk menyimpan ke website.');
  }

  function openEdit(game) {
    setLogoFile(null);
    setBannerFile(null);
    setFeedback('');
    setAdding(false);
    setEditingId(game.id);
    setDraft({ ...game });
    requestAnimationFrame(() => {
      document.getElementById('game-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function openAdd() {
    setLogoFile(null);
    setBannerFile(null);
    setFeedback('');
    setEditingId(null);
    setAdding(true);
    setDraft({
      id: '',
      logo_url: null,
      banner_url: null,
      display_order: 100,
      name: '',
      short: '',
      division: '',
      description: '',
      registration: 'DIBUKA',
      visible: true,
      logo: null,
      logoName: '',
      logoMeta: '',
      bannerName: '',
      bannerMeta: '',
    });
    requestAnimationFrame(() => {
      document.getElementById('game-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function closeEdit() {
    setLogoFile(null);
    setBannerFile(null);
    setAdding(false);
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit() {
    if (!draft || saving) return;
    const name = draft.name.trim();
    const short = draft.short.trim().toUpperCase();
    const division = draft.division.trim() || 'Divisi Game';
    const description = draft.description.trim();
    if (name.length < 2 || name.length > 120) {
      setFeedback('Nama game wajib diisi, 2–120 karakter.'); return;
    }
    if (!/^[A-Z0-9]{2,5}$/.test(short)) {
      setFeedback('Kode game harus 2–5 huruf/angka tanpa spasi.'); return;
    }
    if (!description || description.length > 1000) {
      setFeedback('Deskripsi wajib diisi, maksimal 1000 karakter.'); return;
    }
    if (division.length > 150) {
      setFeedback('Nama divisi terlalu panjang, maksimal 150 karakter.'); return;
    }
    if (adding && games.some((item) => item.short === short || item.id === short.toLowerCase())) {
      setFeedback('Kode game ini sudah digunakan. Pilih kode yang berbeda.'); return;
    }
    setSaving(true);
    setFeedback('');
    const bucket = supabase.storage.from('ridoooo-game-media');
    const uploaded = [];
    try {
      const logoError = await validateGameImage(logoFile, 'logo');
      const bannerError = await validateGameImage(bannerFile, 'banner');
      if (logoError || bannerError) throw new Error(logoError || bannerError);

      const next = {
        name, short, division_label: division, description,
        is_active: draft.registration === 'DIBUKA',
        is_visible: Boolean(draft.visible),
        logo_url: draft.logo_url || null,
        banner_url: draft.banner_url || null,
        display_order: adding ? Math.max(0, ...games.map((item) => item.display_order || 0)) + 1 : draft.display_order,
      };

      for (const [kind, file] of [['logo', logoFile], ['banner', bannerFile]]) {
        if (!file) continue;
        const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        const path = (kind === 'logo' ? 'logos/' : 'banners/') + crypto.randomUUID() + '.' + ext;
        const { error: uploadError } = await bucket.upload(path, file, { upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        uploaded.push(path);
        next[kind + '_url'] = bucket.getPublicUrl(path).data.publicUrl;
      }

      let query;
      if (adding) {
        query = supabase.from('ridoooo_divisions').insert({ ...next, code: short.toLowerCase() });
      } else {
        query = supabase.from('ridoooo_divisions').update(next).eq('code', draft.id);
      }
      const { data, error } = await query.select().single();
      if (error) throw error;
      const saved = toUiGame(data);
      setGames((items) => adding
        ? [...items, saved]
        : items.map((item) => item.id === saved.id ? saved : item));
      setLogoFile(null);
      setBannerFile(null);
      setAdding(false);
      setEditingId(null);
      setDraft(null);
      setFeedback('Game/Divisi berhasil disimpan. Refresh website User untuk melihat perubahan.');
    } catch (error) {
      if (uploaded.length) await bucket.remove(uploaded);
      setFeedback('Gagal menyimpan game: ' + (error?.code === '23505'
        ? 'Kode game sudah digunakan.' : error.message || 'Periksa SQL 006 dan koneksi.'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteGame(game) {
    if (saving) return;
    if (!window.confirm('Hapus "' + game.name + '" dari katalog? Game akan hilang dari Admin dan formulir User. Riwayat pendaftar yang sudah masuk tetap disimpan.')) return;
    setSaving(true);
    setFeedback('');
    try {
      const { data, error } = await supabase.from('ridoooo_divisions')
        .delete().eq('code', game.id).select('code').single();

      if (error?.code === '23503') {
        // Ada riwayat pendaftar: hapus dari katalog tanpa merusak foreign key.
        const { data: archived, error: archiveError } = await supabase
          .from('ridoooo_divisions')
          .update({ deleted_at: new Date().toISOString(), is_visible: false, is_active: false })
          .eq('code', game.id).select('code').single();
        if (archiveError) {
          if (/deleted_at/i.test(archiveError.message || '') || ['42703', 'PGRST204'].includes(archiveError.code)) {
            throw new Error('Jalankan migration 007_hapus_game_dari_katalog.sql di Supabase SQL Editor terlebih dahulu. Riwayat pendaftar tetap aman.');
          }
          throw archiveError;
        }
        if (!archived) throw new Error('Game tidak ditemukan atau akses Admin ditolak.');
      } else {
        if (error) throw error;
        if (!data) throw new Error('Game tidak ditemukan atau akses Admin ditolak.');
      }

      setGames((items) => items.filter((item) => item.id !== game.id));
      if (editingId === game.id) closeEdit();
      setFeedback('Game berhasil dihapus dari katalog dan tidak akan muncul di formulir User. Refresh halaman User untuk memeriksa.');
    } catch (error) {
      setFeedback('Gagal menghapus game: ' + (error.message || 'Periksa koneksi Supabase.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="game-divisi-page">
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
          <button type="button" className="beranda-nav__item beranda-nav__item--active" onClick={() => onNavigate?.('/konten-beranda')}>
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

      <section className="game-divisi-main">
        <header className="beranda-header">
          <h1>Kelola Konten</h1>
          <div className="beranda-header__actions">
            <div className="beranda-period">
              <span className="beranda-period__dot" />
              <span>Data Pendaftaran UKM Esports</span>
            </div>
          </div>
        </header>

        <div className="game-divisi-content">
          <div className="konten-tabs" role="tablist" aria-label="Kelola Konten">
            <button type="button" className="konten-tab" onClick={() => onNavigate?.('/konten-beranda')}>
              <Home size={13} strokeWidth={2} />
              <span>Beranda</span>
            </button>
            <button type="button" className="konten-tab konten-tab--active">
              <Gamepad2 size={13} strokeWidth={1.9} />
              <span>Game / Divisi</span>
            </button>
            <button type="button" className="konten-tab" onClick={() => onNavigate?.('/konten-event')}>
              <Trophy size={13} strokeWidth={1.9} />
              <span>Event</span>
            </button>
          </div>

          {feedback && <p role="status" aria-live="polite" style={{ padding: '12px 16px', border: '1px solid #33445e', borderRadius: 9, color: '#e5efff', marginBottom: 14 }}>{feedback}</p>}
          {loading && <p aria-live="polite">Memuat divisi game...</p>}
          {!adding ? (
            <>
          <section className="game-divisi-topbar">
            <div className="game-divisi-count">
              <span className="game-divisi-count__dot" />
              <strong>{games.length} Divisi Game Terdaftar</strong>
            </div>
            <button type="button" className="game-divisi-add" disabled={saving || loading} onClick={openAdd}>
              <Plus size={13} strokeWidth={2.1} />
              <span>Tambah Game</span>
            </button>
          </section>

          <section className="game-divisi-table-card">
            <div className="game-divisi-table-head">
              <img src={gameSectionIcon} alt="" aria-hidden="true" />
              <h2>Daftar Game / Divisi</h2>
            </div>

            <div className="game-divisi-table-wrap">
              <table className="game-divisi-table">
                <thead>
                  <tr>
                    <th>LOGO</th>
                    <th>NAMA GAME &amp; SINGKATAN</th>
                    <th>DESKRIPSI SINGKAT</th>
                    <th>STATUS<br />PENDAFTARAN</th>
                    <th>STATUS<br />TAMPIL</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr key={game.id} className={editingId === game.id ? 'game-divisi-row game-divisi-row--editing' : 'game-divisi-row'}>
                      <td data-label="Logo"><GameLogo game={game} /></td>
                      <td data-label="Nama Game">
                        <div className="game-divisi-name">
                          <strong>{game.name}</strong>
                          <div>
                            <span>{game.short}</span>
                            <small>| {game.division}</small>
                          </div>
                        </div>
                      </td>
                      <td data-label="Deskripsi"><p className="game-divisi-description">{game.description}</p></td>
                      <td data-label="Pendaftaran">
                        <span className={game.registration === 'DIBUKA' ? 'game-divisi-registration game-divisi-registration--open' : 'game-divisi-registration game-divisi-registration--closed'}>
                          {game.registration}
                        </span>
                      </td>
                      <td data-label="Status Tampil">
                        <span className="game-divisi-visible">
                          {game.visible ? <Eye size={12} strokeWidth={2} /> : <EyeOff size={12} strokeWidth={2} />}
                          {game.visible ? 'TAMPIL' : 'DISEMBUNYIKAN'}
                        </span>
                      </td>
                      <td data-label="Aksi">
                        <div className="game-divisi-actions">
                          <button type="button" className={editingId === game.id ? 'game-divisi-edit game-divisi-edit--active' : 'game-divisi-edit'} onClick={() => openEdit(game)}>
                            <Pencil size={12} strokeWidth={2} />
                            <span>Edit</span>
                          </button>
                          <button type="button" className="game-divisi-delete" disabled={saving} onClick={() => deleteGame(game)} aria-label={'Hapus ' + game.name}>
                            <Trash2 size={13} strokeWidth={1.9} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
            </>
          ) : null}

          {draft && (editingGame || adding) ? (
            <section className="game-edit-card" id="game-edit-form">
              <div className="game-edit-head">
                <div className="game-edit-head__icon">
                  <Pencil size={16} strokeWidth={2} />
                </div>
                <div className="game-edit-head__copy">
                  <div className="game-edit-head__title-row">
                    <h2>{adding ? 'Tambah Game / Divisi Baru' : 'Edit Game / Divisi: ' + (editingGame.id === 'mlbb' ? 'Mobile Legends' : editingGame.name)}</h2>
                    {!adding ? <span>SEDANG DISUNTING</span> : null}
                  </div>
                  <p>{adding ? 'Lengkapi informasi dan visibilitas game baru yang akan ditampilkan di website mahasiswa.' : 'Perbarui informasi dan visibilitas game di website mahasiswa.'}</p>
                </div>
              </div>

              <div className="game-edit-body">
                <div className="game-edit-column game-edit-column--text">
                  <label className="game-edit-field">
                    <span>Nama Game</span>
                    <input
                      placeholder={adding ? 'Contoh: Free Fire / Apex Legends' : ''}
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                  </label>

                  <label className="game-edit-field">
                    <span>Singkatan / Tag Kode</span>
                    <input
                      className="game-edit-mono"
                      maxLength={5}
                      placeholder={adding ? 'CONTOH: FF / APEX' : ''}
                      value={draft.short}
                      onChange={(e) => setDraft({ ...draft, short: e.target.value.toUpperCase() })}
                    />
                    {adding ? <small className="game-edit-helper">Maksimal 5 karakter, digunakan pada badge kartu pendaftaran.</small> : null}
                  </label>

                  <label className="game-edit-field">
                    <span>Nama / Kategori Divisi</span>
                    <input value={draft.division} placeholder="Contoh: Divisi MOBA" maxLength={150} onChange={(e) => setDraft({ ...draft, division: e.target.value })} />
                  </label>

                  <label className="game-edit-field">
                    <span>Deskripsi Singkat Divisi</span>
                    <textarea
                      rows={5}
                      placeholder={adding ? 'Tuliskan deskripsi singkat divisi game untuk pendaftar...' : ''}
                      value={draft.description}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    />
                    {adding ? <small className="game-edit-helper">Ditampilkan pada ringkasan divisi dan formulir pemilihan cabang.</small> : null}
                  </label>
                </div>

                <div className="game-edit-column game-edit-column--media">
                  <div className="game-edit-media-grid">
                    <div className="game-edit-upload">
                      <span className="game-edit-upload__label">Logo Game (Square 1:1)</span>
                      {adding ? (
                        <div className="game-add-upload-box">
                          {logoPreview ? <img src={logoPreview} alt="Preview logo" style={{ width: 60, height: 60, objectFit: 'contain' }} /> : <ImageUp size={20} strokeWidth={1.7} />}
                          <strong>{logoFile ? logoFile.name : 'Unggah Logo Game'}</strong>
                          <span>{logoFile ? <ImageDetails src={logoPreview} file={logoFile} /> : 'PNG, JPG maks 2MB (1:1)'}</span>
                        </div>
                      ) : (
                        <div className="game-edit-upload__preview">
                          <GameLogo game={{ ...draft, logo: logoPreview || draft.logo }} large />
                          <div>
                            <strong>{draft.logoName}</strong>
                            <ImageDetails src={logoPreview || draft.logo_url} file={logoFile} fallback={draft.logoMeta} />
                          </div>
                        </div>
                      )}
                      <input ref={logoInputRef} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={(e) => { chooseImage(e.target.files?.[0], 'logo'); e.target.value = ''; }} />
                      <button type="button" disabled={saving} onClick={() => logoInputRef.current?.click()}>
                        <ImageUp size={12} strokeWidth={1.9} />
                        <span>{adding ? 'Pilih Logo' : 'Ganti Logo'}</span>
                      </button>
                    </div>

                    <div className="game-edit-upload">
                      <span className="game-edit-upload__label">Banner Game (16:9)</span>
                      {adding ? (
                        <div className="game-add-upload-box game-add-upload-box--banner">
                          {bannerPreview ? <img src={bannerPreview} alt="Preview banner" style={{ width: '100%', maxHeight: 80, objectFit: 'cover' }} /> : <ImageUp size={20} strokeWidth={1.7} />}
                          <strong>{bannerFile ? bannerFile.name : 'Unggah Banner Game'}</strong>
                          <span>{bannerFile ? <ImageDetails src={bannerPreview} file={bannerFile} /> : 'Rasio 16:9 · Maks 5MB'}</span>
                        </div>
                      ) : (
                        <div className="game-edit-banner-preview">
                          <div className="game-edit-banner-preview__art" style={bannerPreview || draft.banner_url ? { backgroundImage: 'url(' + JSON.stringify(bannerPreview || draft.banner_url) + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
                          <div>
                            <strong>{draft.bannerName}</strong>
                            <ImageDetails src={bannerPreview || draft.banner_url} file={bannerFile} fallback={draft.bannerMeta} />
                          </div>
                        </div>
                      )}
                      <input ref={bannerInputRef} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={(e) => { chooseImage(e.target.files?.[0], 'banner'); e.target.value = ''; }} />
                      <button type="button" disabled={saving} onClick={() => bannerInputRef.current?.click()}>
                        <ImageUp size={12} strokeWidth={1.9} />
                        <span>{adding ? 'Pilih Banner' : 'Ganti Banner'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="game-edit-status-grid">
                    <div className="game-edit-status-control">
                      <span>Status Pendaftaran</span>
                      <div>
                        <button type="button" className={draft.registration === 'DIBUKA' ? 'is-active is-open' : ''} onClick={() => setDraft({ ...draft, registration: 'DIBUKA' })}>Dibuka</button>
                        <button type="button" className={draft.registration === 'DITUTUP' ? 'is-active is-closed' : ''} onClick={() => setDraft({ ...draft, registration: 'DITUTUP' })}>Ditutup</button>
                      </div>
                    </div>

                    <div className="game-edit-status-control">
                      <span>Status Tampil di Web</span>
                      <div>
                        <button type="button" className={draft.visible ? 'is-active is-visible' : ''} onClick={() => setDraft({ ...draft, visible: true })}>
                          <Eye size={11} strokeWidth={1.9} /> Tampil
                        </button>
                        <button type="button" className={!draft.visible ? 'is-active is-hidden' : ''} onClick={() => setDraft({ ...draft, visible: false })}>
                          <EyeOff size={11} strokeWidth={1.9} /> Sembunyikan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="game-edit-footer">
                <button type="button" className="game-edit-cancel" onClick={closeEdit}>Batal</button>
                <button type="button" className="game-edit-save" disabled={saving} onClick={saveEdit}>
                  <Save size={13} strokeWidth={2} />
                  <span>{saving ? 'Menyimpan...' : adding ? 'Simpan Game Baru' : 'Simpan Perubahan Game'}</span>
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
