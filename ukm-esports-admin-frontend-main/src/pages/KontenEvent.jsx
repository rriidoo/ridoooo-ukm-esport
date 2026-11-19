import AdminSidebarProfile from '../components/AdminSidebarProfile';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchGameDivisions } from '../lib/gameDivisions';
import { fetchAdminEvents, formatEventDate } from '../lib/events';
import {
  FileText,
  CalendarDays,
  Eye,
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

function toUiEvent(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category || '',
    games: row.games || [],
    date: formatEventDate(row.end_date || row.start_date),
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    prize: row.prize_pool || '',
    slots: row.slots == null ? '' : String(row.slots),
    status: row.status,
    description: row.description || '',
    benefit: row.benefit || '',
    regulation: row.regulation_url || '',
    banner_url: row.banner_url || null,
    bannerName: row.banner_url ? 'Banner tersimpan' : 'Belum ada banner',
    bannerMeta: row.banner_url ? '' : 'Rekomendasi 1920 × 1080 px',
  };
}

async function validateEventBanner(file) {
  if (!file) return null;
  const extensions = { 'image/png': ['png'], 'image/jpeg': ['jpg', 'jpeg'], 'image/webp': ['webp'] };
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extensions[file.type]?.includes(extension)) return 'Banner harus PNG, JPG, atau WebP.';
  if (!file.size || file.size > 2 * 1024 * 1024) return 'Banner maksimal 2 MB.';
  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const matches = file.type === 'image/png'
      ? [137,80,78,71,13,10,26,10].every((v, i) => bytes[i] === v)
      : file.type === 'image/jpeg'
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
          String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    if (!matches) return 'Isi file banner tidak sesuai dengan formatnya.';
  } catch { return 'File banner tidak bisa dibaca.'; }
  return null;
}

function EventBannerDetails({ src, file, fallback = '' }) {
  const [dimensions, setDimensions] = useState(null);
  useEffect(() => {
    setDimensions(null);
    if (!src) return;
    let active = true;
    const image = new Image();
    image.onload = () => { if (active) setDimensions([image.naturalWidth, image.naturalHeight]); };
    image.onerror = () => { if (active) setDimensions([]); };
    image.src = src;
    return () => { active = false; image.onload = null; image.onerror = null; };
  }, [src]);
  if (!src) return <small>{fallback || 'Belum ada file'}</small>;
  if (!dimensions) return <small>Memuat ukuran gambar...</small>;
  if (!dimensions.length) return <small>Gambar tidak dapat dibaca</small>;
  const type = file ? file.name.split('.').pop().toUpperCase()
    : src.split(/[?#]/)[0].split('.').pop().toUpperCase();
  const size = file ? ' · ' + (file.size / 1024).toFixed(1) + ' KB' : '';
  return <small>{dimensions[0]} × {dimensions[1]} px · {type}{size}</small>;
}

export default function KontenEvent({ adminUser, onLogout, onNavigate }) {
  const [events, setEvents] = useState([]);
  const [gameOptions, setGameOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const bannerInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const editingEvent = useMemo(() => events.find((item) => item.id === editingId) || null, [events, editingId]);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    let active = true;
    fetchAdminEvents().then((rows) => {
      if (active) setEvents(rows.map(toUiEvent));
    }).catch(() => {
      if (active) setFeedback('Gagal memuat event. Jalankan migration 008_kelola_event.sql di Supabase SQL Editor.');
    }).finally(() => { if (active) setLoading(false); });

    fetchGameDivisions().then((rows) => {
      if (active) setGameOptions(rows.map((row) => row.name));
    }).catch(() => {
      if (active) setFeedback((message) => message || 'Daftar cabang game gagal dimuat. Periksa koneksi Supabase.');
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!bannerFile) { setBannerPreview(''); return; }
    const src = URL.createObjectURL(bannerFile);
    setBannerPreview(src);
    return () => URL.revokeObjectURL(src);
  }, [bannerFile]);

  async function chooseBanner(file) {
    if (!file) return;
    const problem = await validateEventBanner(file);
    if (problem) { setFeedback(problem); return; }
    setBannerFile(file);
    setFeedback('Banner dipilih. Klik Simpan untuk mengunggah dan mempublikasikan perubahan.');
  }

  function removeBanner() {
    if (saving || !draft) return;
    setBannerFile(null);
    setDraft((current) => current ? {
      ...current,
      banner_url: null,
      bannerName: 'Belum ada banner',
      bannerMeta: 'Rekomendasi 1920 × 1080 px',
    } : current);
    setFeedback('Banner akan dihapus setelah kamu klik Simpan. Klik Batal jika ingin membatalkan perubahan.');
  }

  function openEdit(eventItem) {
    setBannerFile(null);
    setFeedback('');
    setAdding(false);
    setEditingId(eventItem.id);
    setDraft({ ...eventItem, games: [...eventItem.games] });
    requestAnimationFrame(() => {
      document.getElementById('event-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function openAdd() {
    setBannerFile(null);
    setFeedback('');
    setEditingId(null);
    setAdding(true);
    setDraft({
      id: '',
      name: '',
      category: '',
      games: [],
      date: '',
      startDate: '',
      endDate: '',
      prize: '',
      slots: '',
      status: 'DRAFT',
      description: '',
      benefit: '',
      regulation: '',
      bannerName: '',
      bannerMeta: '',
      banner_url: null,
    });
    requestAnimationFrame(() => {
      document.getElementById('event-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function closeEdit() {
    setBannerFile(null);
    setAdding(false);
    setEditingId(null);
    setDraft(null);
  }

  function toggleGame(game) {
    if (!draft) return;
    setDraft((current) => ({
      ...current,
      games: current.games.includes(game)
        ? current.games.filter((item) => item !== game)
        : [...current.games, game],
    }));
  }

  async function saveEvent() {
    if (!draft || saving) return;
    const name = draft.name.trim();
    const category = draft.category.trim();
    const description = draft.description.trim();
    const benefit = draft.benefit.trim();
    const prize = draft.prize.trim();
    const regulation = draft.regulation.trim();
    const slots = String(draft.slots).trim();
    const validDate = (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const date = new Date(value + 'T00:00:00Z');
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    };

    if (name.length < 1 || name.length > 160) {
      setFeedback('Nama Event wajib diisi (maksimal 160 karakter).'); return;
    }
    if (category.length > 100) {
      setFeedback('Kategori event maksimal 100 karakter.'); return;
    }
    if (draft.games.length > 20) {
      setFeedback('Cabang game maksimal 20 pilihan.'); return;
    }
    if ((draft.startDate && !validDate(draft.startDate)) ||
        (draft.endDate && !validDate(draft.endDate)) ||
        (draft.startDate && draft.endDate && draft.endDate < draft.startDate)) {
      setFeedback('Periksa tanggal event. Jika keduanya diisi, tanggal selesai tidak boleh sebelum tanggal mulai.'); return;
    }
    if (slots && (!/^\d{1,6}$/.test(slots) || Number(slots) < 1 || Number(slots) > 100000)) {
      setFeedback('Jumlah slot, jika diisi, harus angka 1–100000.'); return;
    }
    if (description.length > 2000) {
      setFeedback('Deskripsi maksimal 2000 karakter.'); return;
    }
    if (prize.length > 100 || benefit.length > 500) {
      setFeedback('Prize Pool atau Benefit terlalu panjang.'); return;
    }
    if (regulation) {
      try {
        const url = new URL(regulation);
        if (!['https:', 'http:'].includes(url.protocol) || regulation.length > 1000) throw new Error();
      } catch {
        setFeedback('Link Jadwal / Regulasi harus URL lengkap http:// atau https://.'); return;
      }
    }
    const problem = await validateEventBanner(bannerFile);
    if (problem) { setFeedback(problem); return; }
    setSaving(true);
    setFeedback('');
    const bucket = supabase.storage.from('ridoooo-event-media');
    let uploadedPath = null;
    try {
      const values = {
        name, category, games: draft.games, start_date: draft.startDate || null,
        end_date: draft.endDate || null, prize_pool: prize, slots: slots ? Number(slots) : null,
        status: draft.status, description, benefit, regulation_url: regulation,
        banner_url: draft.banner_url || null,
        updated_at: new Date().toISOString(),
      };
      if (bannerFile) {
        const extension = bannerFile.type === 'image/png' ? 'png'
          : bannerFile.type === 'image/webp' ? 'webp' : 'jpg';
        uploadedPath = 'banners/' + crypto.randomUUID() + '.' + extension;
        const { error: uploadError } = await bucket.upload(uploadedPath, bannerFile, {
          contentType: bannerFile.type, upsert: false,
        });
        if (uploadError) throw uploadError;
        values.banner_url = bucket.getPublicUrl(uploadedPath).data.publicUrl;
      }
      const query = adding
        ? supabase.from('ridoooo_events').insert(values)
        : supabase.from('ridoooo_events').update(values).eq('id', draft.id);
      const { data, error } = await query.select('*').single();
      if (error) throw error;
      const saved = toUiEvent(data);
      setEvents((items) => {
        const updated = adding ? [...items, saved] : items.map((item) => item.id === saved.id ? saved : item);
        return updated.sort((a, b) => (b.endDate || b.startDate || '').localeCompare(a.endDate || a.startDate || ''));
      });
      const oldBanner = editingEvent?.banner_url || null;
      closeEdit();
      let notice = oldBanner && !values.banner_url
        ? 'Banner berhasil dihapus dari event. Event tetap tersimpan.'
        : 'Event berhasil disimpan di Supabase. Status Tampil akan muncul di website User.';
      if (oldBanner && oldBanner !== values.banner_url &&
          oldBanner.includes('/storage/v1/object/public/ridoooo-event-media/banners/')) {
        const oldPath = oldBanner.split('/ridoooo-event-media/')[1]?.split('?')[0];
        if (oldPath?.startsWith('banners/')) {
          try {
            const { error: deleteError } = await bucket.remove([decodeURIComponent(oldPath)]);
            if (deleteError) throw deleteError;
          } catch {
            notice += ' Namun file lama gagal dibersihkan dari Storage.';
          }
        }
      }
      setFeedback(notice);
    } catch (error) {
      if (uploadedPath) await bucket.remove([uploadedPath]).catch(() => {});
      setFeedback('Gagal menyimpan event: ' + (error.message || 'Periksa koneksi dan SQL migration 008.'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(eventItem) {
    if (saving || !window.confirm('Hapus event "' + eventItem.name + '" secara permanen?')) return;
    setSaving(true);
    setFeedback('');
    try {
      const { data, error } = await supabase.from('ridoooo_events')
        .delete().eq('id', eventItem.id).select('id').single();
      if (error) throw error;
      if (!data) throw new Error('Event tidak ditemukan atau akses Admin ditolak.');
      setEvents((items) => items.filter((item) => item.id !== eventItem.id));
      if (editingId === eventItem.id) closeEdit();
      setFeedback('Event berhasil dihapus dari Admin dan website User.');
      if (eventItem.banner_url?.includes('/storage/v1/object/public/ridoooo-event-media/banners/')) {
        const path = eventItem.banner_url.split('/ridoooo-event-media/')[1]?.split('?')[0];
        if (path?.startsWith('banners/')) {
          supabase.storage.from('ridoooo-event-media').remove([decodeURIComponent(path)]).catch(() => {});
        }
      }
    } catch (error) {
      setFeedback('Gagal menghapus event: ' + (error.message || 'Periksa koneksi dan hak akses.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="event-page">
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

      <section className="event-main">
        <header className="beranda-header">
          <h1>Kelola Konten</h1>
          <div className="beranda-header__actions">
            <div className="beranda-period">
              <span className="beranda-period__dot" />
              <span>Data Pendaftaran UKM Esports</span>
            </div>
          </div>
        </header>

        <div className="event-content">
          <div className="konten-tabs" role="tablist" aria-label="Kelola Konten">
            <button type="button" className="konten-tab" onClick={() => onNavigate?.('/konten-beranda')}>
              <Home size={13} strokeWidth={2} />
              <span>Beranda</span>
            </button>
            <button type="button" className="konten-tab" onClick={() => onNavigate?.('/konten-game-divisi')}>
              <Gamepad2 size={13} strokeWidth={1.9} />
              <span>Game / Divisi</span>
            </button>
            <button type="button" className="konten-tab konten-tab--active">
              <Trophy size={13} strokeWidth={1.9} />
              <span>Event</span>
            </button>
          </div>

          {!draft && feedback ? <p className="event-feedback" role="status">{feedback}</p> : null}

          {!adding ? (
            <>
          <section className="event-topbar">
            <div className="event-count">
              <span className="event-count__dot" />
              <strong>{events.length} Event Terdaftar</strong>
            </div>
            <button type="button" className="event-add" onClick={openAdd}>
              <Plus size={13} strokeWidth={2.1} />
              <span>Tambah Event</span>
            </button>
          </section>

          <section className="event-table-card">
            <div className="event-table-head">
              <Trophy size={16} strokeWidth={1.8} />
              <h2>Daftar Event / Turnamen</h2>
            </div>

            {loading ? <p className="event-feedback">Memuat data event...</p> : null}
            {!loading && !events.length ? <p className="event-feedback">Belum ada event tersimpan. Klik Tambah Event untuk membuat event pertama.</p> : null}
            <div className="event-table-wrap" tabIndex={0} role="region" aria-label="Daftar event, dapat digeser secara horizontal bila diperlukan">
              <table className="event-table">
                <thead>
                  <tr>
                    <th>BANNER /<br />THUMBNAIL</th>
                    <th>NAMA EVENT</th>
                    <th>GAME</th>
                    <th>TANGGAL</th>
                    <th>PRIZE POOL</th>
                    <th>SLOT</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((item) => (
                    <tr key={item.id} className={editingId === item.id ? 'event-row event-row--editing' : 'event-row'}>
                      <td data-label="Banner">
                        <div className={'event-thumb event-thumb--' + item.id}
                          style={item.banner_url ? { backgroundImage: 'url(' + JSON.stringify(item.banner_url) + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                          {!item.banner_url ? <span>ESPORTS</span> : null}
                        </div>
                      </td>
                      <td data-label="Nama Event">
                        <div className="event-name">
                          <strong>{item.name}</strong>
                          {item.category ? <span>{item.category}</span> : null}
                        </div>
                      </td>
                      <td data-label="Game">
                        <div className="event-game-tags">
                          {item.games.length ? item.games.map((game) => <span key={game}>{game}</span>) : <span>—</span>}
                        </div>
                      </td>
                      <td data-label="Tanggal"><span className="event-date">{item.date}</span></td>
                      <td data-label="Prize Pool"><strong className="event-prize">{item.prize || '—'}</strong></td>
                      <td data-label="Slot"><span className="event-slot">{item.slots ? item.slots + ' Slot' : '—'}</span></td>
                      <td data-label="Status">
                        <span className={'event-status event-status--' + item.status.toLowerCase()}>
                          {item.status === 'TAMPIL' ? <Eye size={10} strokeWidth={2} /> : null}
                          {item.status}
                        </span>
                      </td>
                      <td data-label="Aksi">
                        <div className="event-actions">
                          <button type="button" className={editingId === item.id ? 'event-edit event-edit--active' : 'event-edit'} onClick={() => openEdit(item)}>
                            <Pencil size={12} strokeWidth={2} />
                            <span>Edit</span>
                          </button>
                          <button type="button" className="event-delete" aria-label={'Hapus ' + item.name}
                            disabled={saving} onClick={() => deleteEvent(item)}>
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

          {draft && (editingEvent || adding) ? (
            <section className="event-edit-card" id="event-edit-form">
              <div className="event-edit-head">
                <div className="event-edit-head__icon">
                  <Pencil size={16} strokeWidth={2} />
                </div>
                <div className="event-edit-head__copy">
                  <div className="event-edit-head__title-row">
                    <h2>{adding ? 'Tambah Event Baru' : 'Edit Event: ' + editingEvent.name}</h2>
                    {!adding ? <span>SEDANG DISUNTING</span> : null}
                  </div>
                  <p>Cukup isi Nama Event. Kolom lainnya opsional sesuai kebutuhan acara.</p>
                </div>
              </div>

              <div className="event-edit-body">
                <div className="event-edit-grid event-edit-grid--top">
                  <label className="event-field">
                    <span>Nama Event (Wajib)</span>
                    <input
                      placeholder={adding ? 'Contoh: Piala Rektor Esports Championship 2025' : ''}
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                  </label>

                  <label className="event-field">
                    <span>Kategori Event (Opsional)</span>
                    <input
                      placeholder={adding ? 'Pilih Kategori Event (misal: Campus Competition, Community Tournament)' : ''}
                      value={draft.category}
                      onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    />
                  </label>
                </div>

                <div className="event-field">
                  <span>Cabang Game (Opsional, bisa pilih lebih dari satu)</span>
                  <div className="event-game-options">
                    {[...new Set([...gameOptions, ...draft.games])].map((game) => (
                      <button
                        key={game}
                        type="button"
                        className={draft.games.includes(game) ? 'event-game-option event-game-option--active' : 'event-game-option'}
                        onClick={() => toggleGame(game)}
                      >
                        <span className="event-game-option__check">{draft.games.includes(game) ? '✓' : '+'}</span>
                        <span>{game}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="event-edit-grid event-edit-grid--dates">
                  <label className="event-field">
                    <span>Tanggal Mulai (Opsional)</span>
                    <div className="event-date-input">
                      <input
                        type="date"
                        max="2100-12-31"
                        value={draft.startDate}
                        onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                      />
                      <CalendarDays size={13} strokeWidth={1.8} />
                    </div>
                  </label>

                  <label className="event-field">
                    <span>Tanggal Selesai (Opsional)</span>
                    <div className="event-date-input">
                      <input
                        type="date"
                        min={draft.startDate || undefined}
                        max="2100-12-31"
                        value={draft.endDate}
                        onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                      />
                      <CalendarDays size={13} strokeWidth={1.8} />
                    </div>
                  </label>
                </div>

                <div className="event-edit-grid event-edit-grid--numbers">
                  <label className="event-field">
                    <span>Total Prize Pool (Opsional)</span>
                    <input
                      placeholder={adding ? 'Contoh: Rp 10.000.000' : ''}
                      value={draft.prize}
                      onChange={(e) => setDraft({ ...draft, prize: e.target.value })}
                    />
                  </label>

                  <label className="event-field">
                    <span>Jumlah Slot (Opsional)</span>
                    <input
                      placeholder={adding ? 'Contoh: 32' : ''}
                      value={draft.slots}
                      inputMode="numeric"
                      onChange={(e) => setDraft({ ...draft, slots: e.target.value })}
                    />
                  </label>
                </div>

                <label className="event-field">
                  <span>Deskripsi Singkat (Opsional)</span>
                  <textarea
                    rows={4}
                    placeholder={adding ? 'Tuliskan deskripsi singkat event yang akan tampil di landing page...' : ''}
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  />
                </label>

                <label className="event-field">
                  <span>Benefit (Opsional)</span>
                  <input
                    placeholder={adding ? 'Contoh: Sertifikat Resmi Rektorat, Hadiah Tunai, TAK / SKK Kemahasiswaan' : ''}
                    value={draft.benefit}
                    onChange={(e) => setDraft({ ...draft, benefit: e.target.value })}
                  />
                </label>

                <label className="event-field">
                  <span>Link Jadwal / Regulasi (Opsional)</span>
                  <input
                    className="event-field__mono"
                    placeholder={adding ? 'https://... (link file PDF regulasi atau jadwal)' : ''}
                    value={draft.regulation}
                    onChange={(e) => setDraft({ ...draft, regulation: e.target.value })}
                  />
                </label>

                <div className="event-edit-bottom-grid">
                  <div className="event-banner-field">
                    <span>Banner Event (Opsional, 16:9)</span>
                    <input ref={bannerInputRef} type="file" hidden accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => { chooseBanner(e.target.files?.[0]); e.target.value = ''; }} />
                    {adding ? (
                      <div className="event-add-banner-box">
                        <div className="event-add-banner-drop"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => { e.preventDefault(); if (!saving) chooseBanner(e.dataTransfer?.files?.[0]); }}>
                          {bannerPreview
                            ? <img src={bannerPreview} alt="Preview banner event" style={{ height: 80, maxWidth: '100%', objectFit: 'contain' }} />
                            : <ImageUp size={22} strokeWidth={1.7} />}
                          <strong>{bannerFile ? bannerFile.name : 'Pilih berkas banner atau tarik ke sini'}</strong>
                          <span>Format PNG, JPG, WebP rasio 16:9 (maks. 2 MB)</span>
                        </div>
                        <div className="event-add-banner-meta">
                          <div>
                            <strong>{bannerFile ? bannerFile.name : 'Belum ada file dipilih'}</strong>
                            <EventBannerDetails src={bannerPreview} file={bannerFile} fallback="Rekomendasi 1920 × 1080 px" />
                          </div>
                          <button type="button" disabled={saving} onClick={() => bannerInputRef.current?.click()}>
                            <ImageUp size={11} strokeWidth={1.9} />
                            <span>Pilih Banner</span>
                          </button>
                          {bannerFile ? <button type="button" className="event-banner-remove" disabled={saving} onClick={removeBanner}>
                            <Trash2 size={11} strokeWidth={1.9} />
                            <span>Hapus Banner</span>
                          </button> : null}
                        </div>
                      </div>
                    ) : (
                      <div className="event-banner-preview">
                        <div className="event-banner-art" style={bannerPreview || draft.banner_url ? {
                          backgroundImage: 'url(' + JSON.stringify(bannerPreview || draft.banner_url) + ')',
                          backgroundSize: 'cover', backgroundPosition: 'center',
                        } : undefined}>
                          {!bannerPreview && !draft.banner_url ? <span>ESPORTS</span> : null}
                        </div>
                        <div>
                          <strong>{bannerFile?.name || draft.bannerName}</strong>
                          <EventBannerDetails src={bannerPreview || draft.banner_url} file={bannerFile} fallback={draft.bannerMeta} />
                          <button type="button" disabled={saving} onClick={() => bannerInputRef.current?.click()}>
                            <ImageUp size={11} strokeWidth={1.9} />
                            <span>Ganti Banner</span>
                          </button>
                          {(bannerFile || draft.banner_url) ? <button type="button" className="event-banner-remove"
                            disabled={saving} onClick={removeBanner}>
                            <Trash2 size={11} strokeWidth={1.9} />
                            <span>Hapus Banner</span>
                          </button> : null}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="event-status-control">
                    <span>Status Event</span>
                    <div>
                      {['DRAFT', 'TAMPIL', 'SELESAI'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={draft.status === status ? 'is-active is-' + status.toLowerCase() : ''}
                          onClick={() => setDraft({ ...draft, status })}
                        >
                          {status === 'Draft'.toUpperCase() ? 'Draft' : status === 'TAMPIL' ? 'Tampil' : 'Selesai'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {feedback ? <p className="event-feedback" role="alert">{feedback}</p> : null}
              <div className="event-edit-footer">
                <button type="button" className="event-edit-cancel" onClick={closeEdit}>Batal</button>
                <button type="button" className="event-edit-save" disabled={saving} onClick={saveEvent}>
                  <Save size={13} strokeWidth={2} />
                  <span>{saving ? 'Menyimpan...' : adding ? 'Simpan Event Baru' : 'Simpan Perubahan Event'}</span>
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
