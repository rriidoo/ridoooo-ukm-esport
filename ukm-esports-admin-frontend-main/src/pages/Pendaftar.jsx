import AdminSidebarProfile from '../components/AdminSidebarProfile';
import { useMemo, useState } from 'react';
import {
  FileText,
  Grid2X2,
  RotateCcw,
  Search,
  Table2,
  UserRoundPlus,
  Users,
} from 'lucide-react';
import logo from '../assets/logo-figma.png';
import dashboardIcon from '../assets/ui-icons/Icon.png';
import pendaftarIcon from '../assets/ui-icons/Icon-3.png';
import anggotaIcon from '../assets/ui-icons/Icon-7.png';

export const applicants = [
  {
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
  },
  {
    initials: 'CN',
    name: 'Clara Nathania',
    email: 'clara.n@ittelkom-pwt.ac.id',
    nim: '24103022',
    study: 'S1 Desain Komunikasi Visual',
    game: 'Mobile Legends',
    cohort: '2024',
    date: '24 Okt 2024',
    status: 'Menunggu Verifikasi',
    tone: 'waiting',
  },
  {
    initials: 'FR',
    name: 'Fajar Ramadhani',
    email: 'fajar.r@ittelkom-pwt.ac.id',
    nim: '22104089',
    study: 'S1 Rekayasa Perangkat Lunak',
    game: 'PUBG Mobile',
    cohort: '2022',
    date: '23 Okt 2024',
    status: 'Diterima',
    tone: 'accepted',
  },
  {
    initials: 'DA',
    name: 'Dewi Anggraini',
    email: 'dewi.a@ittelkom-pwt.ac.id',
    nim: '23101077',
    study: 'S1 Sistem Informasi',
    game: 'Valorant',
    cohort: '2023',
    date: '23 Okt 2024',
    status: 'Diterima',
    tone: 'accepted',
  },
  {
    initials: 'BW',
    name: 'Bagus Wicaksono',
    email: 'bagus.w@ittelkom-pwt.ac.id',
    nim: '21102051',
    study: 'S1 Teknik Telekomunikasi',
    game: 'eFootball',
    cohort: '2021',
    date: '22 Okt 2024',
    status: 'Ditolak',
    tone: 'rejected',
  },
  {
    initials: 'RK',
    name: 'Rifqi Kurniawan',
    email: 'rifqi.k@ittelkom-pwt.ac.id',
    nim: '24102015',
    study: 'S1 Informatika',
    game: 'Valorant',
    cohort: '2024',
    date: '22 Okt 2024',
    status: 'Menunggu Verifikasi',
    tone: 'waiting',
  },
  {
    initials: 'NP',
    name: 'Nadia Putri',
    email: 'nadia.p@ittelkom-pwt.ac.id',
    nim: '24103088',
    study: 'S1 Desain Komunikasi Visual',
    game: 'Mobile Legends',
    cohort: '2024',
    date: '21 Okt 2024',
    status: 'Menunggu Verifikasi',
    tone: 'waiting',
  },
  {
    initials: 'DW',
    name: 'Dimas Wahyu',
    email: 'dimas.w@ittelkom-pwt.ac.id',
    nim: '23101019',
    study: 'S1 Informatika',
    game: 'eFootball',
    cohort: '2023',
    date: '20 Okt 2024',
    status: 'Ditolak',
    tone: 'rejected',
  },
];

export default function Pendaftar({ adminUser, onLogout, onNavigate, onDetail, applicants = [], loadError = '' }) {
  const [query, setQuery] = useState('');
  const [game, setGame] = useState('');
  const [cohort, setCohort] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const filteredApplicants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return applicants.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.email.toLowerCase().includes(normalizedQuery) ||
        (item.nim || '').toLowerCase().includes(normalizedQuery);
      const matchesGame = !game || item.game === game;
      const matchesCohort = !cohort || item.cohort === cohort;
      const matchesStatus = !status || item.status === status;

      return matchesQuery && matchesGame && matchesCohort && matchesStatus;
    });
  }, [applicants, query, game, cohort, status]);

  const pageCount = Math.max(1, Math.ceil(filteredApplicants.length / 10));
  const visibleApplicants = filteredApplicants.slice((Math.min(page, pageCount) - 1) * 10, Math.min(page, pageCount) * 10);
  function resetFilters() {
    setQuery('');
    setGame('');
    setCohort('');
    setStatus('');
    setPage(1);
  }

  return (
    <main className="pendaftar-page">
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
          <button type="button" className="beranda-nav__item beranda-nav__item--active">
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

      <section className="pendaftar-main">
        <header className="beranda-header">
          <h1>Pendaftar</h1>

          <div className="beranda-header__actions">
            <div className="beranda-period">
              <span className="beranda-period__dot" />
              <span>Data Pendaftaran UKM Esports</span>
            </div>
          </div>
        </header>

        <div className="pendaftar-content">
          <section className="pendaftar-filter-card" aria-label="Filter pendaftar">
            <label className="pendaftar-search">
              <Search size={17} strokeWidth={1.8} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama, NIM, atau email..."
                aria-label="Cari nama, NIM, atau email"
              />
            </label>

            <select
              value={game}
              onChange={(event) => {
                setGame(event.target.value);
                setPage(1);
              }}
              aria-label="Filter game"
            >
              <option value="">Semua Game</option>
              {[...new Set(applicants.map((item) => item.game))].filter(Boolean).sort((a, b) => a.localeCompare(b)).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select
              value={cohort}
              onChange={(event) => {
                setCohort(event.target.value);
                setPage(1);
              }}
              aria-label="Filter angkatan"
            >
              <option value="">Semua Angkatan</option>
              {[...new Set(applicants.map(a => a.cohort))].sort().reverse().map(year => <option key={year} value={year}>{year}</option>)}
            </select>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              aria-label="Filter status"
            >
              <option value="">Semua Status</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Diterima">Diterima</option>
              <option value="Ditolak">Ditolak</option>
            </select>

            <button type="button" className="pendaftar-reset" onClick={resetFilters}>
              <RotateCcw size={15} strokeWidth={1.8} />
              <span>Reset Filter</span>
            </button>
          </section>

          <section className="pendaftar-table-card">
            <div className="pendaftar-table-scroll">
              <table className="pendaftar-table">
                <thead>
                  <tr>
                    <th>NAMA MAHASISWA</th>
                    <th>NIM</th>
                    <th>PROGRAM STUDI</th>
                    <th>GAME</th>
                    <th>TANGGAL DAFTAR</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleApplicants.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Mahasiswa">
                        <div className="pendaftar-person">
                          <span className="pendaftar-person__avatar">{item.initials}</span>
                          <div>
                            <strong title={item.name}>{item.name}</strong>
                            <span title={item.email}>{item.email}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="NIM" className="admin-nim" title={item.nim || "NIM belum tersedia"}>{item.nim}</td>
                      <td data-label="Program Studi">{item.study}</td>
                      <td data-label="Game">
                        <span className={`pendaftar-game pendaftar-game--${item.game.toLowerCase().replaceAll(' ', '-').replace('football', 'football')}`}>
                          <i />
                          {item.game}
                        </span>
                      </td>
                      <td data-label="Tanggal Daftar">{item.date}</td>
                      <td data-label="Status">
                        <span className={`beranda-status beranda-status--${item.tone}`}>
                          <i />
                          {item.status}
                        </span>
                      </td>
                      <td data-label="Aksi">
                        <button type="button" className="pendaftar-detail" onClick={() => onDetail?.(item)}>
                          Detail <span>›</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loadError && <div className="pendaftar-empty" role="alert">{loadError}</div>}
              {filteredApplicants.length === 0 && !loadError && (
                <div className="pendaftar-empty">Tidak ada pendaftar yang sesuai dengan filter.</div>
              )}
            </div>

            <footer className="pendaftar-pagination">
              <p>
                Menampilkan <strong>{filteredApplicants.length ? ((Math.min(page,pageCount)-1)*10+1) + '–' + Math.min(Math.min(page,pageCount)*10,filteredApplicants.length) : '0'}</strong> dari{' '}
                <strong>{applicants.length}</strong> pendaftar
              </p>

              <div className="pendaftar-pagination__controls">
                <button
                  type="button"
                  className="pendaftar-page-button pendaftar-page-button--wide"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  ‹ Sebelumnya
                </button>
                {Array.from({ length: Math.min(3,pageCount) }, (_, i) => i+1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={page === pageNumber ? 'pendaftar-page-button pendaftar-page-button--active' : 'pendaftar-page-button'}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}

                {pageCount > 3 && <button
                  type="button"
                  className={page === pageCount ? 'pendaftar-page-button pendaftar-page-button--active' : 'pendaftar-page-button'}
                  onClick={() => setPage(pageCount)}
                >
                  {pageCount}
                </button>}
                <button
                  type="button"
                  className="pendaftar-page-button pendaftar-page-button--wide"
                  disabled={page === pageCount}
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                >
                  Berikutnya ›
                </button>
              </div>
            </footer>
          </section>
        </div>
      </section>
    </main>
  );
}
