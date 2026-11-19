import AdminSidebarProfile from '../components/AdminSidebarProfile';
import { useMemo, useState } from 'react';
import {
  FileText,
  CalendarDays,
  ChevronDown,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Table2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import logo from '../assets/logo-figma.png';
import dashboardIcon from '../assets/ui-icons/Icon.png';
import pendaftarIcon from '../assets/ui-icons/Icon-3.png';
import anggotaIcon from '../assets/ui-icons/Icon-7.png';



export default function ExportData({
  adminUser, onLogout, onNavigate, members = [],
  loadError = '', loading = false, dataLoaded = false, onRetry,
}) {
  const gameOptions = ['Semua Game', ...[...new Set(members.map(m => m.game))].filter(Boolean).sort((a, b) => a.localeCompare(b))];
  const cohortOptions = ['Semua Angkatan', ...new Set(members.map(m => m.cohort))].sort();
  const studyOptions = ['Semua Program Studi', ...new Set(members.map(m => m.study))].sort();
  const [game, setGame] = useState('Semua Game');
  const [cohort, setCohort] = useState('Semua Angkatan');
  const [study, setStudy] = useState('Semua Program Studi');
  const [dateRange, setDateRange] = useState('');
  const dateRangeParts = dateRange.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2})\/(\d{2})\/(\d{4})$/);
  const startDate = dateRangeParts ? new Date(Number(dateRangeParts[3]), Number(dateRangeParts[2]) - 1, Number(dateRangeParts[1])) : null;
  const endDate = dateRangeParts ? new Date(Number(dateRangeParts[6]), Number(dateRangeParts[5]) - 1, Number(dateRangeParts[4]), 23, 59, 59, 999) : null;
  const validRange = !dateRange.trim() || (dateRangeParts && startDate <= endDate &&
    startDate.getDate() === Number(dateRangeParts[1]) && endDate.getDate() === Number(dateRangeParts[4]));

  const filtered = useMemo(() => members.filter((item) => {
    const gameMatch = game === 'Semua Game' || item.game === game;
    const cohortMatch = cohort === 'Semua Angkatan' || item.cohort === cohort;
    const studyMatch = study === 'Semua Program Studi' || item.study === study;
    const dateMatch = !dateRange.trim() || (validRange && item.created_at &&
      new Date(item.created_at) >= startDate && new Date(item.created_at) <= endDate);
    return gameMatch && cohortMatch && studyMatch && dateMatch;
  }), [members, game, cohort, study, dateRange, validRange]);

  const exportCount = filtered.length;

  function resetFilters() {
    setGame('Semua Game');
    setCohort('Semua Angkatan');
    setStudy('Semua Program Studi');
    setDateRange('');
  }

  function exportExcel() {
    const rows = filtered.map((item) => ({
      Nama: item.name,
      NIM: item.nim === '—' ? '' : String(item.nim),
      'Program Studi': item.study,
      Angkatan: item.cohort,
      Game: item.game,
      Email: item.email || '',
      'Nomor WhatsApp': item.whatsapp ? String(item.whatsapp) : '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: ['Nama', 'NIM', 'Program Studi', 'Angkatan', 'Game', 'Email', 'Nomor WhatsApp'],
    });
    worksheet['!cols'] = [
      { wch: 28 }, { wch: 18 }, { wch: 30 }, { wch: 12 },
      { wch: 24 }, { wch: 36 }, { wch: 22 },
    ];
    // Nomor induk dan WhatsApp harus tetap berupa teks agar angka 0 di depan tidak hilang.
    for (let row = 1; row <= rows.length; row += 1) {
      for (const column of ['B', 'G']) {
        const cell = worksheet[column + (row + 1)];
        if (cell) { cell.t = 's'; cell.z = '@'; }
      }
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Anggota');
    XLSX.writeFile(workbook, 'data-anggota-tel-u-esports.xlsx');
  }

  return (
    <main className="export-page">
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
          <button type="button" className="beranda-nav__item" onClick={() => onNavigate?.('/anggota')}>
            <img className="ui-nav-icon ui-nav-icon--anggota" src={anggotaIcon} alt="" aria-hidden="true" />
            <span>Anggota</span>
          </button>
          <button type="button" className="beranda-nav__item beranda-nav__item--active">
            <Table2 size={17} strokeWidth={1.8} />
            <span>Export Data</span>
          </button>
        </nav>

        <AdminSidebarProfile adminUser={adminUser} onLogout={onLogout} />
      </aside>

      <section className="export-main">
        <header className="beranda-header">
          <h1>Export Data</h1>
          <div className="beranda-header__actions">
            <div className="beranda-period">
              <span className="beranda-period__dot" />
              <span>Data Pendaftaran UKM Esports</span>
            </div>
          </div>
        </header>

        <div className="export-content">
          {loadError ? (
            <div className="beranda-data-alert" role="alert">
              <span>
                {loadError} Ekspor dinonaktifkan agar file tidak berisi data yang salah atau tidak lengkap.
              </span>
              <button type="button" onClick={onRetry} disabled={loading}>Coba Lagi</button>
            </div>
          ) : null}
          {loading && !loadError ? (
            <p role="status" style={{ color: '#a6b1c5', margin: '0 0 16px', fontSize: 13 }}>
              Memuat data anggota dari Supabase...
            </p>
          ) : null}
          <section className="export-filter-card">
            <div className="export-section-head">
              <h2>Filter Data</h2>
              <button type="button" className="export-reset" onClick={resetFilters}>
                <RotateCcw size={12} strokeWidth={1.9} />
                <span>Reset Filter</span>
              </button>
            </div>

            <div className="export-filter-grid">
              <label className="export-field">
                <span>Game / Divisi</span>
                <div className="export-select-wrap">
                  <select value={game} onChange={(e) => setGame(e.target.value)}>
                    {gameOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <ChevronDown size={13} strokeWidth={1.8} />
                </div>
              </label>

              <label className="export-field">
                <span>Angkatan</span>
                <div className="export-select-wrap">
                  <select value={cohort} onChange={(e) => setCohort(e.target.value)}>
                    {cohortOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <ChevronDown size={13} strokeWidth={1.8} />
                </div>
              </label>

              <label className="export-field">
                <span>Program Studi</span>
                <div className="export-select-wrap">
                  <select value={study} onChange={(e) => setStudy(e.target.value)}>
                    {studyOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <ChevronDown size={13} strokeWidth={1.8} />
                </div>
              </label>

              <label className="export-field">
                <span>Rentang Tanggal</span>
                <div className="export-date-wrap">
                  <input value={dateRange} onChange={(e) => setDateRange(e.target.value)} placeholder="DD/MM/YYYY - DD/MM/YYYY" aria-label="Rentang tanggal" />
                  <CalendarDays size={13} strokeWidth={1.8} />
                </div>
              </label>
            </div>

            {!validRange && <p role="alert" style={{ color: '#ff7777', fontSize: 12 }}>Gunakan format DD/MM/YYYY - DD/MM/YYYY dengan tanggal valid.</p>}
            <div className="export-summary">
              <div>
                <span>Total:</span>
                <strong>{exportCount} data akan diexport</strong>
              </div>
              <p>Berdasarkan filter yang aktif</p>
            </div>
          </section>

          <section className="export-preview-card">
            <div className="export-preview-head">
              <div>
                <h2>Preview Data</h2>
                <span>(Maksimal 5 baris data teratas)</span>
              </div>
              <span>{Math.min(filtered.length, 5)} data ditampilkan</span>
            </div>

            <div className="export-table-wrap">
              <table className="export-table">
                <thead>
                  <tr>
                    <th>NAMA</th>
                    <th>NIM</th>
                    <th>PROGRAM STUDI</th>
                    <th>ANGKATAN</th>
                    <th>GAME</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td data-label="Nama"><strong>{item.name}</strong></td>
                      <td data-label="NIM"><span className="export-mono" title={item.nim || "NIM belum tersedia"}>{item.nim}</span></td>
                      <td data-label="Program Studi">{item.study}</td>
                      <td data-label="Angkatan">{item.cohort}</td>
                      <td data-label="Game"><span className="export-game-pill">{item.game}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="export-bottom">
              <span>{exportCount} data siap diexport</span>
              <button type="button" disabled={!exportCount || !validRange || loading || !dataLoaded || Boolean(loadError)} onClick={exportExcel}>
                <FileSpreadsheet size={14} strokeWidth={1.9} />
                <span>Export Excel (.xlsx)</span>
                <Download size={13} strokeWidth={1.9} />
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
