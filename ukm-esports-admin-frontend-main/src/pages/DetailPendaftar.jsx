import AdminSidebarProfile from '../components/AdminSidebarProfile';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import PrivateDocumentPreview from '../components/PrivateDocumentPreview';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import {
  ArrowLeft,
  Check,
  FileText,
  FolderOpen,
  Gamepad2,
  Grid2X2,

  MessageSquareQuote,
  Table2,
  Eye,
  Download,
  UserRound,
  UserRoundPlus,
  Users,
  X,
} from 'lucide-react';
import logo from '../assets/logo-figma.png';
import dashboardIcon from '../assets/ui-icons/Icon.png';
import pendaftarIcon from '../assets/ui-icons/Icon-3.png';
import anggotaIcon from '../assets/ui-icons/Icon-7.png';
import personalIcon from '../assets/ui-icons/Icon-2.png';
import gameIcon from '../assets/ui-icons/Icon-4.png';
import motivationIcon from '../assets/ui-icons/Icon-6.png';
import documentIcon from '../assets/ui-icons/Icon-10.png';

export default function DetailPendaftar({ adminUser, applicant, onBack, onLogout, onNavigate, onReviewed }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reviewNote, setReviewNote] = useState(applicant?.review_note || '');
  const [pendingDecision, setPendingDecision] = useState(null);
  const review = async (decision) => {
    if (!data.id || data.status !== 'Menunggu Verifikasi' || busy) return;
    setBusy(true); setError('');
    const { error: reviewError } = await supabase.rpc('ridoooo_review_application', {
      p_application_id: data.id, p_decision: decision, p_note: reviewNote || null
    });
    setBusy(false);
    if (reviewError) { setPendingDecision(null); setError(reviewError.message); return; }
    setPendingDecision(null);
    await onReviewed?.();
    onBack?.();
  };
  const openDocument = async (path, download = false) => {
    if (!path) { setError('Berkas tidak tersedia.'); return; }
    setError('');
    const { data: signed, error: signedError } = await supabase.storage
      .from('ridoooo-application-documents').createSignedUrl(path, 60, { download });
    if (signedError || !signed?.signedUrl) { setError(signedError?.message || 'Gagal mengakses berkas.'); return; }
    window.open(signed.signedUrl, '_blank', 'noopener,noreferrer');
  };
  const data = applicant || {
    initials: 'AB',
    name: 'Arya Bramanto',
    email: 'arya.b@ittelkom-pwt.ac.id',
    nim: '23102014',
    study: 'S1 Informatika',
    game: 'Valorant',
    cohort: '2023',
    date: '24 Okt 2024',
    status: 'Menunggu Verifikasi',
    tone: 'waiting',
  };

  if (!applicant) return <main style={{ padding: 40 }}><p>Pilih pendaftar dari daftar terlebih dahulu.</p><button onClick={onBack}>Kembali ke Pendaftar</button></main>;
  return (
    <main className="detail-pendaftar-page">
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
          <button type="button" className="beranda-nav__item" onClick={() => onNavigate?.('/konten-beranda')}>
            <FileText size={17} strokeWidth={1.8} />
            <span>Kelola Konten</span>
          </button>
          <button type="button" className="beranda-nav__item beranda-nav__item--active" onClick={onBack}>
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

      <section className="detail-pendaftar-main">
        <header className="beranda-header">
          <h1>Pendaftar</h1>
          <div className="beranda-header__actions">
            <div className="beranda-period">
              <span className="beranda-period__dot" />
              <span>Data Pendaftaran UKM Esports</span>
            </div>
          </div>
        </header>

        <div className="detail-pendaftar-content">
          <button type="button" className="detail-pendaftar-back" onClick={onBack}>
            <ArrowLeft size={15} strokeWidth={1.8} />
            <span>Kembali ke Pendaftar</span>
          </button>

          <section className="detail-pendaftar-hero">
            <div>
              <div className="detail-pendaftar-hero__title-row">
                <h2>Detail Pendaftar</h2>
                <span className="detail-pendaftar-hero__id">#{data.id?.slice(0, 8).toUpperCase()}</span>
              </div>
              <p>{data.name}</p>
            </div>
            <span className={`detail-pendaftar-status detail-pendaftar-status--${data.tone}`}>
              <i />
              {data.status}
            </span>
          </section>

          <section className="detail-pendaftar-card">
            <div className="detail-pendaftar-card__title">
              <img className="ui-section-icon ui-section-icon--person" src={personalIcon} alt="" aria-hidden="true" />
              <h3>Informasi Mahasiswa</h3>
            </div>
            <div className="detail-pendaftar-info-grid">
              <div className="detail-pendaftar-info">
                <span>Nama Lengkap</span>
                <strong>{data.name}</strong>
              </div>
              <div className="detail-pendaftar-info">
                <span>NIM</span>
                <strong>{data.nim}</strong>
              </div>
              <div className="detail-pendaftar-info">
                <span>Email</span>
                <strong>{data.email}</strong>
              </div>
              <div className="detail-pendaftar-info">
                <span>Program Studi</span>
                <strong>{data.study}</strong>
              </div>
              <div className="detail-pendaftar-info">
                <span>Angkatan</span>
                <strong>{data.cohort}</strong>
              </div>
              <div className="detail-pendaftar-info">
                <span>No. WhatsApp</span>
                <strong>{data.whatsapp || '-'}</strong>
              </div>
            </div>
          </section>

          <section className="detail-pendaftar-card">
            <div className="detail-pendaftar-card__title">
              <img className="ui-section-icon ui-section-icon--game" src={gameIcon} alt="" aria-hidden="true" />
              <h3>Informasi Game</h3>
            </div>
            <div className="detail-pendaftar-info-grid detail-pendaftar-info-grid--game">
              <div className="detail-pendaftar-info">
                <span>Game Pilihan</span>
                <strong>{data.game}</strong>
              </div>
              <div className="detail-pendaftar-info">
                <span>Nickname / ID Game</span>
                <strong>{data.game_nickname || '-'}</strong>
              </div>
            </div>
          </section>

          <section className="detail-pendaftar-card">
            <div className="detail-pendaftar-card__title">
              <img className="ui-section-icon ui-section-icon--motivation" src={motivationIcon} alt="" aria-hidden="true" />
              <h3>Motivasi Bergabung</h3>
            </div>
            <div className="detail-pendaftar-motivation">
              {data.motivation || 'Tidak ada motivasi tertulis.'}
            </div>
          </section>

          <section className="detail-pendaftar-card detail-pendaftar-card--documents">
            <div className="detail-pendaftar-card__title">
              <img className="ui-section-icon ui-section-icon--document" src={documentIcon} alt="" aria-hidden="true" />
              <h3>Dokumen Pendaftaran</h3>
            </div>

            <div className="detail-pendaftar-documents">
              <article className="detail-document">
                <div className="detail-document__head">
                  <div>
                    <h4>Kartu Tanda Mahasiswa (KTM)</h4>
                    <p>{data.ktm_path?.split('/').pop() || 'KTM belum tersedia'}</p>
                  </div>
                  <span>Berkas privat</span>
                </div>
                <div className="detail-document__preview detail-document__preview--ktm">
                  <PrivateDocumentPreview path={data.ktm_path} label="KTM" />
                </div>
                <div className="detail-document__view-actions">
                  <button type="button" onClick={() => openDocument(data.ktm_path)}><Eye size={13} strokeWidth={1.9} /> Lihat Penuh</button>
                  <button type="button" onClick={() => openDocument(data.ktm_path, true)}><Download size={13} strokeWidth={1.9} /> Download</button>
                </div>
                <div className="detail-document__actions">Periksa berkas KTM secara manual sebelum mengambil keputusan.</div>
              </article>

              <article className="detail-document">
                <div className="detail-document__head">
                  <div>
                    <h4>Bukti Follow Instagram</h4>
                    <p>{data.instagram_path?.split('/').pop() || 'Bukti belum tersedia'}</p>
                  </div>
                  <span>Berkas privat</span>
                </div>
                <div className="detail-document__preview detail-document__preview--instagram">
                  <PrivateDocumentPreview path={data.instagram_path} label="Bukti Follow Instagram" />
                </div>
                <div className="detail-document__view-actions">
                  <button type="button" onClick={() => openDocument(data.instagram_path)}><Eye size={13} strokeWidth={1.9} /> Lihat Penuh</button>
                  <button type="button" onClick={() => openDocument(data.instagram_path, true)}><Download size={13} strokeWidth={1.9} /> Download</button>
                </div>
                <div className="detail-document__actions">Periksa bukti Instagram secara manual sebelum mengambil keputusan.</div>
              </article>
            </div>
          </section>

          {error && <p role="alert" style={{ color: '#ff7777', marginBottom: 12 }}>{error}</p>}
          <label className="detail-pendaftar-note">{data.status === 'Menunggu Verifikasi' ? 'Catatan keputusan (opsional)' : 'Catatan keputusan'}
            <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} disabled={data.status !== 'Menunggu Verifikasi'} maxLength={500} placeholder={data.status === 'Menunggu Verifikasi' ? 'Alasan penolakan atau catatan verifikasi' : 'Tidak ada catatan keputusan'} />
          </label>
          <section className="detail-pendaftar-review">
            <div>
              <span>Status Pendaftaran:</span>
              <strong className={`detail-pendaftar-review__status detail-pendaftar-review__status--${data.tone}`}>
                <i />
                {data.status}
              </strong>
            </div>
            <div className="detail-pendaftar-review__actions">
              <button type="button" className="detail-pendaftar-reject" disabled={busy || data.status !== 'Menunggu Verifikasi'} onClick={() => setPendingDecision('rejected')}>Tolak Pendaftar</button>
              <button type="button" className="detail-pendaftar-accept" disabled={busy || data.status !== 'Menunggu Verifikasi'} onClick={() => setPendingDecision('accepted')}>{busy ? 'Memproses...' : 'Terima Pendaftar'}</button>
            </div>
          </section>
        </div>
      </section>
      <AdminConfirmDialog
        open={Boolean(pendingDecision)}
        tone={pendingDecision === 'accepted' ? 'success' : 'danger'}
        title={pendingDecision === 'accepted' ? 'Konfirmasi Penerimaan' : 'Konfirmasi Penolakan'}
        description={pendingDecision === 'accepted'
          ? 'Yakin ingin menerima mahasiswa ini sebagai anggota UKM Esport Universitas Telkom Purwokerto?'
          : 'Yakin ingin menolak pendaftaran mahasiswa ini? Keputusan akan terlihat pada akun mahasiswa.'}
        detail={<><strong>{data.name}</strong><span>NIM: {data.nim || '-'} · Divisi: {data.game}</span></>}
        confirmLabel={pendingDecision === 'accepted' ? 'Ya, Terima Anggota' : 'Ya, Tolak Pendaftaran'}
        busy={busy}
        onCancel={() => setPendingDecision(null)}
        onConfirm={() => review(pendingDecision)}
      />
    </main>
  );
}
