import AdminSidebarProfile from '../components/AdminSidebarProfile';
import { useMemo, useState } from 'react';
import {
  FileText,
  Gamepad2,
  Grid2X2,

  Search,
  Table2,
  UserRoundPlus,
  Users,
} from 'lucide-react';
import logo from '../assets/logo-figma.png';
import dashboardIcon from '../assets/ui-icons/Icon.png';
import pendaftarIcon from '../assets/ui-icons/Icon-3.png';
import anggotaIcon from '../assets/ui-icons/Icon-7.png';
import anggotaTotalIcon from '../assets/ui-icons/Icon-1.png';
import anggotaGameIcon from '../assets/ui-icons/Icon-11.png';
import anggotaCohortIcon from '../assets/ui-icons/Icon-12.png';

const members = [
  { initials: 'AB', name: 'Arya Bramanto', email: 'arya.b@ittelkom-pwt.ac.id', nim: '23102014', study: 'S1 Informatika', game: 'Valorant', cohort: '2023' },
  { initials: 'CN', name: 'Clara Nathania', email: 'clara.n@ittelkom-pwt.ac.id', nim: '24103022', study: 'S1 Desain Komunikasi Visual', game: 'Mobile Legends', cohort: '2024' },
  { initials: 'FR', name: 'Fajar Ramadhani', email: 'fajar.r@ittelkom-pwt.ac.id', nim: '22104089', study: 'S1 Rekayasa Perangkat Lunak', game: 'PUBG Mobile', cohort: '2022' },
  { initials: 'DA', name: 'Dewi Anggraini', email: 'dewi.a@ittelkom-pwt.ac.id', nim: '23101077', study: 'S1 Sistem Informasi', game: 'Valorant', cohort: '2023' },
  { initials: 'BW', name: 'Bagus Wicaksono', email: 'bagus.w@ittelkom-pwt.ac.id', nim: '21102051', study: 'S1 Teknik Telekomunikasi', game: 'eFootball', cohort: '2021' },
  { initials: 'RK', name: 'Rifqi Kurniawan', email: 'rifqi.k@ittelkom-pwt.ac.id', nim: '24102015', study: 'S1 Informatika', game: 'Valorant', cohort: '2024' },
  { initials: 'NP', name: 'Nadia Putri', email: 'nadia.p@ittelkom-pwt.ac.id', nim: '24103088', study: 'S1 Desain Komunikasi Visual', game: 'Mobile Legends', cohort: '2024' },
  { initials: 'DW', name: 'Dimas Wahyu', email: 'dimas.w@ittelkom-pwt.ac.id', nim: '23101019', study: 'S1 Informatika', game: 'eFootball', cohort: '2023' },
];

export default function Anggota({ adminUser, onLogout, onNavigate, onDetail, members = [] }) {
  const [query, setQuery] = useState('');
  const [game, setGame] = useState('');
  const [cohort, setCohort] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((item) => {
      const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q) || (item.nim || '').toLowerCase().includes(q);
      const matchesGame = !game || item.game === game;
      const matchesCohort = !cohort || item.cohort === cohort;
      return matchesQuery && matchesGame && matchesCohort;
    });
  }, [members, query, game, cohort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const visibleMembers = filtered.slice((Math.min(page, pageCount) - 1) * 10, Math.min(page, pageCount) * 10);

  return (
    <main className="anggota-page">
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
          <button type="button" className="beranda-nav__item beranda-nav__item--active">
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

      <section className="anggota-main">
        <header className="beranda-header">
          <h1>Anggota</h1>
          <div className="beranda-header__actions">
            <div className="beranda-period">
              <span className="beranda-period__dot" />
              <span>Data Pendaftaran UKM Esports</span>
            </div>
          </div>
        </header>

        <div className="anggota-content">
          <section className="anggota-summary">
            <article className="anggota-stat anggota-stat--total">
              <div>
                <p>TOTAL ANGGOTA</p>
                <div className="anggota-stat__value">
                  <strong>{new Set(members.map(m => m.user_id)).size}</strong>
                  <span>Mahasiswa</span>
                </div>
                <small><i /> Aktif di seluruh Program/Game</small>
              </div>
              <div className="anggota-stat__icon">
                <img className="anggota-stat__asset anggota-stat__asset--members" src={anggotaTotalIcon} alt="" aria-hidden="true" />
              </div>
            </article>

            <article className="anggota-stat anggota-stat--games">
              <div className="anggota-stat__head">
                <p>ANGGOTA PER GAME</p>
                <img className="anggota-stat__asset anggota-stat__asset--game" src={anggotaGameIcon} alt="" aria-hidden="true" />
              </div>
              <div className="anggota-game-grid">
                {['Valorant', 'Mobile Legends', 'PUBG Mobile', 'eFootball',
                  ...[...new Set(members.map((member) => member.game))]
                    .filter((name) => name && !['Valorant', 'Mobile Legends', 'PUBG Mobile', 'eFootball'].includes(name))
                    .sort((a, b) => a.localeCompare(b)),
                ].map((name) => {
                  const style = {
                    'Valorant': 'blue',
                    'Mobile Legends': 'red',
                    'PUBG Mobile': 'yellow',
                    'eFootball': 'cyan',
                  }[name] || 'blue';
                  return (
                    <div key={name}>
                      <span>{name === 'PUBG Mobile' ? 'PUBG M' : name}</span>
                      <b className={'anggota-number anggota-number--' + style}>{members.filter((member) => member.game === name).length}</b>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="anggota-stat anggota-stat--cohort">
              <div className="anggota-stat__head">
                <p>ANGGOTA PER ANGKATAN</p>
                <img className="anggota-stat__asset anggota-stat__asset--cohort" src={anggotaCohortIcon} alt="" aria-hidden="true" />
              </div>
              <div className="anggota-cohort-grid">
                {[...new Set(members.map(m => m.cohort))].sort().map(year => <div key={year}><span>{year}</span><b>{new Set(members.filter(m => m.cohort === year).map(m => m.user_id)).size}</b></div>)}
              </div>
            </article>
          </section>

          <section className="anggota-filter">
            <label className="anggota-search">
              <Search size={17} strokeWidth={1.8} />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama, NIM, atau email..."
              />
            </label>

            <select value={game} onChange={(event) => { setGame(event.target.value); setPage(1); }}>
              <option value="">Semua Game</option>
              {[...new Set(members.map((item) => item.game))].filter(Boolean).sort((a, b) => a.localeCompare(b)).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select value={cohort} onChange={(event) => { setCohort(event.target.value); setPage(1); }}>
              <option value="">Semua Angkatan</option>
              {[...new Set(members.map(m => m.cohort))].sort().reverse().map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <button type="button" className="anggota-reset" onClick={() => {
              setQuery('');
              setGame('');
              setCohort('');
              setPage(1);
            }}>
              Reset Filter
            </button>
          </section>

          <section className="anggota-table-card">
            <div className="anggota-table-scroll">
              <table className="anggota-table">
                <thead>
                  <tr>
                    <th>NAMA MAHASISWA</th>
                    <th>NIM</th>
                    <th>PROGRAM STUDI</th>
                    <th>GAME</th>
                    <th>ANGKATAN</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMembers.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Mahasiswa">
                        <div className="anggota-person">
                          <span className="anggota-person__avatar">{item.initials}</span>
                          <div>
                            <strong title={item.name}>{item.name}</strong>
                            <span title={item.email}>{item.email}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="NIM" className="admin-nim" title={item.nim || "NIM belum tersedia"}>{item.nim}</td>
                      <td data-label="Program Studi">{item.study}</td>
                      <td data-label="Game">
                        <span className={`pendaftar-game pendaftar-game--${item.game.toLowerCase().replaceAll(' ', '-')}`}>
                          <i />
                          {item.game}
                        </span>
                      </td>
                      <td data-label="Angkatan">{item.cohort}</td>
                      <td data-label="Aksi">
                        <button type="button" className="anggota-detail" onClick={() => onDetail?.(item)}>
                          Detail <span>›</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="pendaftar-empty">Tidak ada anggota yang sesuai dengan filter.</div>
              )}
            </div>

            <footer className="anggota-pagination">
              <p>
                Menampilkan <strong>{filtered.length ? ((Math.min(page,pageCount)-1)*10+1) + '–' + Math.min(Math.min(page,pageCount)*10, filtered.length) : '0'}</strong> dari <strong>{filtered.length}</strong> anggota
              </p>
              <div className="pendaftar-pagination__controls">
                <button type="button" className="pendaftar-page-button pendaftar-page-button--wide" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                  ‹ Sebelumnya
                </button>
                {Array.from({ length: Math.min(3, pageCount) }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" className={page === n ? 'pendaftar-page-button pendaftar-page-button--active' : 'pendaftar-page-button'} onClick={() => setPage(n)}>
                    {n}
                  </button>
                ))}
                {pageCount > 3 && <>
                  <span className="pendaftar-pagination__ellipsis">...</span>
                  <button type="button" className={page === pageCount ? 'pendaftar-page-button pendaftar-page-button--active' : 'pendaftar-page-button'} onClick={() => setPage(pageCount)}>{pageCount}</button>
                </>}
                <button type="button" className="pendaftar-page-button pendaftar-page-button--wide" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>
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
