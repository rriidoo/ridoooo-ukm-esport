import AdminSidebarProfile from '../components/AdminSidebarProfile';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import PrivateDocumentPreview from '../components/PrivateDocumentPreview';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,

  Table2,
} from 'lucide-react';
import logo from '../assets/logo-figma.png';
import dashboardIcon from '../assets/ui-icons/Icon.png';
import pendaftarIcon from '../assets/ui-icons/Icon-3.png';
import anggotaIcon from '../assets/ui-icons/Icon-7.png';
import personalIcon from '../assets/ui-icons/Icon-2.png';
import gameIcon from '../assets/ui-icons/Icon-4.png';
import motivationIcon from '../assets/ui-icons/Icon-6.png';
import documentIcon from '../assets/ui-icons/Icon-10.png';

const fallbackMember = {
  initials: 'RS',
  name: 'Rido Sihombing',
  email: 'rido.s@ittelkom-pwt.ac.id',
  nim: '23102014',
  study: 'S1 Informatika',
  game: 'Mobile Legends',
  cohort: '2023',
};

export default function DetailAnggota({ adminUser, member, onBack, onLogout, onNavigate, onRemoved }) {
  const data = member;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  async function viewDocument(path, download = false) {
    if (!path) { setError('Dokumen tidak tersedia.'); return; }
    setError('');
    const { data: signed, error: signedError } = await supabase.storage
      .from('ridoooo-application-documents')
      .createSignedUrl(path, 60, { download });
    if (signedError || !signed?.signedUrl) {
      setError(signedError?.message || 'Dokumen tidak bisa dibuka.');
      return;
    }
    window.open(signed.signedUrl, '_blank', 'noopener,noreferrer');
  }

  async function removeMembership() {
    if (!data?.id || busy) return;
    setBusy(true); setError('');
    const { error: rpcError } = await supabase.rpc('ridoooo_remove_member', {
      p_application_id: data.id,
      p_reason: null
    });
    setBusy(false);
    if (rpcError) { setShowRemoveConfirm(false); setError(rpcError.message); return; }
    setShowRemoveConfirm(false);
    await onRemoved?.();
    onBack?.();
  }

  if (!data) return <main style={{ padding: 40 }}>
    <p>Pilih anggota dari daftar terlebih dahulu.</p>
    <button onClick={onBack}>Kembali ke Anggota</button>
  </main>;

  return (
    <main className="detail-anggota-page">
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

          <button type="button" className="beranda-nav__item" onClick={() => onNavigate?.('/pendaftar')}>
            <img className="ui-nav-icon ui-nav-icon--pendaftar" src={pendaftarIcon} alt="" aria-hidden="true" />
            <span>Pendaftar</span>
          </button>

          <button type="button" className="beranda-nav__item beranda-nav__item--active" onClick={onBack}>
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

      <section className="detail-anggota-main">
        <header className="beranda-header">
          <h1>Anggota</h1>
          <div className="beranda-header__actions">
            <div className="beranda-period">
              <span className="beranda-period__dot" />
              <span>Data Pendaftaran UKM Esports</span>
            </div>
          </div>
        </header>

        <div className="detail-anggota-content">
          <button type="button" className="detail-anggota-back" onClick={onBack}>
            <ArrowLeft size={15} strokeWidth={1.8} />
            <span>Kembali ke Anggota</span>
          </button>

          <section className="detail-anggota-hero">
            <div>
              <div className="detail-anggota-hero__title-row">
                <h2>Detail Anggota</h2>
                <span className="detail-anggota-hero__id">#{data.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <p>Diterima {data.reviewed_at ? new Date(data.reviewed_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB' : '—'}</p>
            </div>
          </section>

          <section className="detail-anggota-card">
            <div className="detail-anggota-card__title">
              <img className="ui-section-icon ui-section-icon--person" src={personalIcon} alt="" aria-hidden="true" />
              <h3>Informasi Mahasiswa</h3>
            </div>

            <div className="detail-anggota-info-grid">
              <div className="detail-anggota-info">
                <span>Nama Lengkap</span>
                <strong>{data.name}</strong>
              </div>
              <div className="detail-anggota-info">
                <span>NIM</span>
                <strong className="detail-anggota-mono">{data.nim || '—'}</strong>
              </div>
              <div className="detail-anggota-info">
                <span>Email</span>
                <strong className="detail-anggota-info__regular">{data.email}</strong>
              </div>
              <div className="detail-anggota-info">
                <span>Program Studi</span>
                <strong>{data.study}</strong>
              </div>
              <div className="detail-anggota-info">
                <span>Angkatan</span>
                <strong>{data.cohort}</strong>
              </div>
              <div className="detail-anggota-info">
                <span>Nomor WhatsApp</span>
                <strong className="detail-anggota-mono">{data.whatsapp || '—'}</strong>
              </div>
            </div>
          </section>

          <section className="detail-anggota-card">
            <div className="detail-anggota-card__title">
              <img className="ui-section-icon ui-section-icon--game" src={gameIcon} alt="" aria-hidden="true" />
              <h3>Informasi Game</h3>
            </div>

            <div className="detail-anggota-info-grid detail-anggota-info-grid--game">
              <div className="detail-anggota-info">
                <span>Game / Divisi</span>
                <strong>{data.game}</strong>
              </div>
              <div className="detail-anggota-info">
                <span>Nickname / ID Game</span>
                <strong className="detail-anggota-mono">{data.game_nickname || '—'}</strong>
              </div>
            </div>
          </section>

          <section className="detail-anggota-card">
            <div className="detail-anggota-card__title">
              <img className="ui-section-icon ui-section-icon--motivation" src={motivationIcon} alt="" aria-hidden="true" />
              <h3>Motivasi Bergabung</h3>
            </div>

            <div className="detail-anggota-motivation">
              {data.motivation || 'Tidak ada motivasi tertulis.'}
            </div>
          </section>

          <section className="detail-anggota-card detail-anggota-card--documents">
            <div className="detail-anggota-card__title">
              <img className="ui-section-icon ui-section-icon--document" src={documentIcon} alt="" aria-hidden="true" />
              <h3>Dokumen Pendaftaran</h3>
            </div>

            <div className="detail-anggota-documents">
              <article className="detail-anggota-document">
                <div className="detail-anggota-document__head">
                  <div>
                    <h4>Kartu Tanda Mahasiswa (KTM)</h4>
                    <p>{data.ktm_path?.split('/').pop() || 'Berkas tidak tersedia'}</p>
                  </div>
                  <span>Privat</span>
                </div>

                <div className="detail-anggota-document__preview detail-anggota-document__preview--ktm">
                  <PrivateDocumentPreview path={data.ktm_path} label="KTM" />
                </div>

                <div className="detail-anggota-document__actions">
                  <button type="button" onClick={() => viewDocument(data.ktm_path)}><Eye size={13} strokeWidth={1.9} /> Lihat Penuh</button>
                  <button type="button" onClick={() => viewDocument(data.ktm_path, true)}><Download size={13} strokeWidth={1.9} /> Download</button>
                </div>
              </article>

              <article className="detail-anggota-document">
                <div className="detail-anggota-document__head">
                  <div>
                    <h4>Bukti Follow Instagram</h4>
                    <p>{data.instagram_path?.split('/').pop() || 'Berkas tidak tersedia'}</p>
                  </div>
                  <span>Privat</span>
                </div>

                <div className="detail-anggota-document__preview detail-anggota-document__preview--instagram">
                  <PrivateDocumentPreview path={data.instagram_path} label="Bukti Follow Instagram" />
                </div>

                <div className="detail-anggota-document__actions">
                  <button type="button" onClick={() => viewDocument(data.instagram_path)}><Eye size={13} strokeWidth={1.9} /> Lihat Penuh</button>
                  <button type="button" onClick={() => viewDocument(data.instagram_path, true)}><Download size={13} strokeWidth={1.9} /> Download</button>
                </div>
              </article>
            </div>
          </section>

          <section className="detail-anggota-actions">
            {error && <p role="alert" style={{ color: '#ff7777', marginBottom: 12 }}>{error}</p>}
            <button type="button" className="detail-anggota-delete" disabled={busy}
              onClick={() => setShowRemoveConfirm(true)}>{busy ? 'Memproses...' : 'Hapus Anggota'}</button>
          </section>
        </div>
      </section>
      <AdminConfirmDialog
        open={showRemoveConfirm}
        tone="danger"
        title="Konfirmasi Hapus Anggota"
        description="Yakin ingin menghapus keanggotaan mahasiswa ini dari divisi? Tindakan ini akan mengubah status keanggotaan."
        detail={<><strong>{data.name}</strong><span>Divisi: {data.game}</span><small>Riwayat pendaftaran dan akun mahasiswa tetap tersimpan. Mahasiswa dapat mendaftar ulang ke divisi ini.</small></>}
        confirmLabel="Ya, Hapus Anggota"
        busy={busy}
        onCancel={() => setShowRemoveConfirm(false)}
        onConfirm={removeMembership}
      />
    </main>
  );
}
