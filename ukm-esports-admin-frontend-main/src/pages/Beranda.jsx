import AdminSidebarProfile from '../components/AdminSidebarProfile';
import {
  ClipboardCheck,
  FileText,
  RefreshCw,
  Table2,
  UserRoundPlus,
  Users,
} from 'lucide-react';
import logo from '../assets/logo-figma.png';
import dashboardIcon from '../assets/ui-icons/Icon.png';
import pendaftarIcon from '../assets/ui-icons/Icon-3.png';
import anggotaIcon from '../assets/ui-icons/Icon-7.png';


export default function Beranda({
  adminUser, onLogout, onNavigate, onDetail,
  applicants = [], loading = false, loadError = '', refreshedAt = null, onRefresh,
}) {
  const pendingCount = applicants.filter((item) => item.statusCode === 'pending').length;
  const newStudentsCount = new Set(applicants
    .filter((item) => new Date(item.created_at).getTime() >= Date.now() - 7 * 86400000)
    .map((item) => item.user_id)).size;
  const activeMembersCount = new Set(applicants
    .filter((item) => item.statusCode === 'accepted')
    .map((item) => item.user_id)).size;
  const dataReady = Boolean(refreshedAt);
  const updatedLabel = refreshedAt
    ? new Date(refreshedAt).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
    : null;
  return (
    <main className="beranda-page">
      <aside className="beranda-sidebar">
        <div className="beranda-brand">
          <img src={logo} alt="Logo UKM Esports Tel-U" />
          <div className="beranda-brand__copy">
            <strong>UKM ESPORTS TEL-U</strong>
            <span>ADMIN CONSOLE</span>
          </div>
        </div>

        <nav className="beranda-nav" aria-label="Navigasi admin">
          <button type="button" className="beranda-nav__item beranda-nav__item--active">
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

      <section className="beranda-main">
        <header className="beranda-header">
          <h1>Beranda</h1>

          <div className="beranda-header__actions">
            <div className="beranda-period">
              <span className="beranda-period__dot" />
              <span>Data Pendaftaran Terkini</span>
            </div>
          </div>
        </header>

        <div className="beranda-content">
          {loadError ? (
            <div className="beranda-data-alert" role="alert">
              {loadError} {dataReady ? 'Angka yang tampil adalah data terakhir yang berhasil dimuat.' : 'Data belum dapat ditampilkan.'}
              <button type="button" onClick={onRefresh} disabled={loading}>Coba Lagi</button>
            </div>
          ) : null}
          <section className="beranda-summary">
            <article className="beranda-summary-card">
              <div>
                <p className="beranda-summary-card__label">Pendaftar yang Perlu Dicek</p>
                <div className="beranda-summary-card__value">
                  <strong>{dataReady ? pendingCount : '—'}</strong>
                  <span>Pengajuan</span>
                </div>
                <div className={'beranda-summary-card__badge beranda-summary-card__badge--' + (pendingCount ? 'warning' : 'info')}>
                  <span />
                  {pendingCount ? 'Perlu ditinjau segera' : 'Tidak ada antrean'}
                </div>
              </div>

              <div className="beranda-summary-card__icon beranda-summary-card__icon--warning">
                <ClipboardCheck size={18} strokeWidth={1.8} />
              </div>
            </article>

            <article className="beranda-summary-card">
              <div>
                <p className="beranda-summary-card__label">Pendaftar Baru</p>
                <div className="beranda-summary-card__value">
                  <strong>{dataReady ? newStudentsCount : '—'}</strong>
                  <span>Mahasiswa</span>
                </div>
                <div className="beranda-summary-card__badge beranda-summary-card__badge--info">
                  <span />
                  7 hari terakhir
                </div>
              </div>

              <div className="beranda-summary-card__icon beranda-summary-card__icon--info">
                <UserRoundPlus size={18} strokeWidth={1.8} />
              </div>
            </article>

            <article className="beranda-summary-card">
              <div>
                <p className="beranda-summary-card__label">Anggota Aktif</p>
                <div className="beranda-summary-card__value">
                  <strong>{dataReady ? activeMembersCount : '—'}</strong>
                  <span>Mahasiswa</span>
                </div>
                <div className="beranda-summary-card__badge beranda-summary-card__badge--info">
                  <span />
                  Sudah diterima
                </div>
              </div>
              <div className="beranda-summary-card__icon beranda-summary-card__icon--info">
                <Users size={18} strokeWidth={1.8} />
              </div>
            </article>
          </section>

          <section className="beranda-table-card">
            <div className="beranda-table-card__head">
              <div>
                <h2>Pendaftar Terbaru</h2>
                <p>Data registrasi calon anggota yang baru masuk sistem.</p>
                {updatedLabel ? <small className="beranda-last-update">Terakhir diperbarui {updatedLabel} WIB</small> : null}
              </div>
              <div className="beranda-table-actions">
                <button type="button" className="beranda-reload" disabled={loading} onClick={onRefresh}
                  aria-label="Muat ulang data dashboard">
                  <RefreshCw size={13} strokeWidth={1.8} />
                  <span>{loading ? 'Memuat...' : 'Muat Ulang'}</span>
                </button>
                <button type="button" className="beranda-see-all" onClick={() => onNavigate?.('/pendaftar')}>
                  Lihat Semua Pendaftar <span>→</span>
                </button>
              </div>
            </div>

            <div className="beranda-table-wrap">
              <table className="beranda-table">
                <thead>
                  <tr>
                    <th>NAMA MAHASISWA</th>
                    <th>NIM</th>
                    <th>GAME</th>
                    <th>TANGGAL DAFTAR</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {!applicants.length ? (
                    <tr>
                      <td className="beranda-empty-row" colSpan={6}>
                        {loading && !dataReady ? 'Memuat pendaftar dari Supabase...'
                          : loadError && !dataReady ? 'Pendaftar belum dapat dimuat. Coba Lagi untuk memuat ulang.'
                            : 'Belum ada pendaftaran yang masuk.'}
                      </td>
                    </tr>
                  ) : null}
                  {applicants.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td data-label="Mahasiswa" className="beranda-table__name">
                        <div className="beranda-person">
                          <strong title={item.name}>{item.name}</strong>
                          <span title={item.email}>{item.email}</span>
                        </div>
                      </td>
                      <td data-label="NIM" className="admin-nim" title={item.nim || "NIM belum tersedia"}>{item.nim}</td>
                      <td data-label="Game">{item.game}</td>
                      <td data-label="Tanggal Daftar">{item.date}</td>
                      <td data-label="Status">
                        <span className={`beranda-status beranda-status--${item.tone}`}>
                          <i />
                          {item.status}
                        </span>
                      </td>
                      <td data-label="Aksi">
                        <button type="button" className="beranda-detail" onClick={() => onDetail?.(item)}>
                          Detail <span>→</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
