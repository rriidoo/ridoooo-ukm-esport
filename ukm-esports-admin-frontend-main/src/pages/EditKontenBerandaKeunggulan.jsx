import AdminSidebarProfile from '../components/AdminSidebarProfile';
import { useEffect, useMemo, useState } from 'react';
import { fetchHomeContent, saveHomeContentSection } from '../lib/homeContent';
import { FileText, Home, Save, Table2, Trophy, Gamepad2 } from 'lucide-react';
import logo from '../assets/logo-figma.png';
import dashboardIcon from '../assets/ui-icons/Icon.png';
import pendaftarIcon from '../assets/ui-icons/Icon-3.png';
import anggotaIcon from '../assets/ui-icons/Icon-7.png';
import listDocumentIcon from '../assets/edit-keunggulan-icons/Background.png';
import listProgressIcon from '../assets/edit-keunggulan-icons/Background-1.png';
import listCertificateIcon from '../assets/edit-keunggulan-icons/Background-2.png';
import editIcon from '../assets/edit-keunggulan-icons/Background-3.png';
import documentIcon from '../assets/edit-keunggulan-icons/Container.png';
import progressIcon from '../assets/edit-keunggulan-icons/Container-1.png';
import certificateIcon from '../assets/edit-keunggulan-icons/Container-2.png';
import rosterIcon from '../assets/edit-keunggulan-icons/Icon.png';
import esportsIcon from '../assets/edit-keunggulan-icons/Icon-1.png';
import officialIcon from '../assets/edit-keunggulan-icons/Icon-2.png';

const iconOptions = [
  { id: 'document', label: 'Dokumen', selectedLabel: 'Dokumen Digital', icon: documentIcon },
  { id: 'progress', label: 'Progres', selectedLabel: 'Progres Real-time', icon: progressIcon },
  { id: 'certificate', label: 'Sertifikat', selectedLabel: 'Sertifikat', icon: certificateIcon },
  { id: 'roster', label: 'Roster', selectedLabel: 'Roster Tim', icon: rosterIcon },
  { id: 'esports', label: 'Esports', selectedLabel: 'Esports', icon: esportsIcon },
  { id: 'official', label: 'Resmi', selectedLabel: 'Resmi', icon: officialIcon },
];

const listIconsById = {
  document: listDocumentIcon,
  progress: listProgressIcon,
  certificate: listCertificateIcon,
  roster: rosterIcon,
  esports: esportsIcon,
  official: officialIcon,
};

const initialPillars = [
  {
    id: 1,
    title: 'Pendaftaran 100% Online',
    description: 'Tak perlu repot cetak berkas, semua proses digital langsung dari gawai Anda.',
    iconId: 'document',
    icon: listDocumentIcon,
    active: true,
  },
  {
    id: 2,
    title: 'Pantau Status Real-time',
    description: 'Dapatkan notifikasi langsung ke dashboard status seleksi dan verifikasi berkas.',
    iconId: 'progress',
    icon: listProgressIcon,
    active: true,
  },
  {
    id: 3,
    title: 'Sertifikat & Rekomendasi',
    description: 'Dukungan resmi delegasi turnamen nasional dan poin SKK / TAK universitas.',
    iconId: 'certificate',
    icon: listCertificateIcon,
    active: true,
  },
];

export default function EditKontenBerandaKeunggulan({ adminUser, onLogout, onNavigate }) {
  const [pillars, setPillars] = useState(initialPillars);
  const [selectedId, setSelectedId] = useState(1);
  const selected = useMemo(() => pillars.find((item) => item.id === selectedId) || pillars[0], [pillars, selectedId]);
  const [draft, setDraft] = useState(() => ({ ...initialPillars[0] }));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  useEffect(() => {
    let active = true;
    fetchHomeContent().then((content) => {
      if (!active) return;
      const items = content.advantages.map((item) => ({
        ...item, icon: listIconsById[item.iconId] || listDocumentIcon,
      }));
      if (items.length) {
        setPillars(items);
        setSelectedId(items[0].id);
        setDraft({ ...items[0] });
      }
    }).catch(() => { if (active) setFeedback('Konten belum tersambung. Jalankan migration 005 di Supabase.'); });
    return () => { active = false; };
  }, []);

  function selectPillar(item) {
    setSelectedId(item.id);
    setDraft({ ...item });
  }

  function resetDraft() {
    setDraft({ ...selected });
  }

  async function saveDraft() {
    if (saving) return;
    if (!draft.title.trim() || !draft.description.trim()) {
      setFeedback('Judul dan deskripsi tidak boleh kosong.');
      return;
    }
    if (draft.title.length > 100 || draft.description.length > 300) {
      setFeedback('Judul maksimal 100 karakter dan deskripsi maksimal 300 karakter.');
      return;
    }
    setSaving(true);
    setFeedback('');
    const next = pillars.map((item) => (
      item.id === selectedId ? { ...item, ...draft, title: draft.title.trim(), description: draft.description.trim() } : item
    ));
    try {
      await saveHomeContentSection('home_advantages', {
        items: next.map(({ id, iconId, title, description, active }) => ({ id, iconId, title, description, active })),
      });
      setPillars(next);
      setFeedback('Keunggulan berhasil disimpan dan akan tampil pada website User.');
    } catch (error) {
      setFeedback('Gagal menyimpan keunggulan: ' + (error.message || 'Periksa SQL 005.'));
    } finally {
      setSaving(false);
    }
  }

  const selectedIcon = iconOptions.find((item) => item.id === draft.iconId) || iconOptions[0];

  return (
    <main className="keunggulan-page">
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

      <section className="keunggulan-main">
        <header className="beranda-header">
          <h1>Kelola Konten</h1>
          <div className="beranda-header__actions">
            <div className="beranda-period">
              <span className="beranda-period__dot" />
              <span>Data Pendaftaran UKM Esports</span>
            </div>
          </div>
        </header>

        <div className="keunggulan-content">
          <div className="konten-tabs" role="tablist" aria-label="Kelola Konten">
            <button type="button" className="konten-tab konten-tab--active" onClick={() => onNavigate?.('/konten-beranda')}>
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

          <h2 className="keunggulan-page-title">Kelola Keunggulan Komunitas</h2>
          {feedback && <p role="status" aria-live="polite" style={{ marginBottom: 16, color: '#e4efff' }}>{feedback}</p>}

          <div className="keunggulan-layout">
            <section className="keunggulan-list-card">
              <div className="keunggulan-list-head">
                <h3>Daftar Keunggulan</h3>
                <span>3 Pilar</span>
              </div>

              <div className="keunggulan-list">
                {pillars.map((item, index) => {
                  const editing = item.id === selectedId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={editing ? 'keunggulan-item keunggulan-item--active' : 'keunggulan-item'}
                      onClick={() => selectPillar(item)}
                    >
                      <img src={listIconsById[editing ? draft.iconId : item.iconId] || listDocumentIcon} alt="" aria-hidden="true" />
                      <div className="keunggulan-item__copy">
                        <div className="keunggulan-item__title-row">
                          <strong>{item.title}</strong>
                          <span className="keunggulan-status">AKTIF</span>
                        </div>
                        <p>{item.description}</p>
                        <div className="keunggulan-item__meta">
                          <span>Posisi {index + 1}</span>
                          <span>{editing ? 'Sedang Diedit' : 'Klik untuk edit'}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="keunggulan-form-card">
              <div className="keunggulan-form-head">
                <div className="keunggulan-form-head__icon">
                  <img src={editIcon} alt="" aria-hidden="true" />
                </div>
                <div>
                  <h3>Edit Keunggulan Komunitas</h3>
                  <p>Tekan Simpan untuk menerbitkan perubahan ke website User.</p>
                </div>
                <span className="keunggulan-editing-badge">SEDANG DISUNTING</span>
              </div>

              <div className="keunggulan-form-body">
                <label className="keunggulan-field">
                  <span className="keunggulan-field__label">
                    <b>Judul Keunggulan *</b>
                    <small>Ringkas &amp; memikat</small>
                  </span>
                  <input
                    value={draft.title}
                    onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  />
                </label>

                <div className="keunggulan-field">
                  <span className="keunggulan-field__label">
                    <b>Pilihan Ikon Representatif *</b>
                    <small>Terpilih: {selectedIcon.selectedLabel}</small>
                  </span>

                  <div className="keunggulan-icon-options">
                    {iconOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={draft.iconId === option.id ? 'keunggulan-icon-option keunggulan-icon-option--active' : 'keunggulan-icon-option'}
                        onClick={() => setDraft((current) => ({
                          ...current,
                          iconId: option.id,
                          icon: listIconsById[option.id],
                        }))}
                      >
                        <img src={option.icon} alt="" aria-hidden="true" />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="keunggulan-field">
                  <span className="keunggulan-field__label">
                    <b>Deskripsi Singkat *</b>
                    <small>{draft.description.length} / 300 Karakter</small>
                  </span>
                  <textarea
                    maxLength={300}
                    value={draft.description}
                    onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  />
                </label>

                <div className="keunggulan-visibility">
                  <span>Status Visibilitas di Website</span>
                  <label>
                    <input
                      type="checkbox"
                      checked={draft.active}
                      onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))}
                    />
                    <i />
                    <b>{draft.active ? 'Aktif (Tampilkan di Beranda)' : 'Nonaktif'}</b>
                  </label>
                </div>
              </div>

              <div className="keunggulan-form-footer">
                <button type="button" className="keunggulan-reset-button" onClick={resetDraft}>Batal / Reset</button>
                <button type="button" className="keunggulan-save-button" onClick={saveDraft} disabled={saving}>
                  <Save size={13} strokeWidth={2} />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Keunggulan'}</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
