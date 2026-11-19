export const divisionNames = {
  mlbb: 'Mobile Legends', pubg: 'PUBG Mobile',
  valorant: 'Valorant', efootball: 'eFootball'
};
export function toApplicant(row, currentDivisionNames = {}) {
  const tones = { pending: 'waiting', accepted: 'accepted', rejected: 'rejected', removed: 'rejected' };
  const labels = { pending: 'Menunggu Verifikasi', accepted: 'Diterima', rejected: 'Ditolak', removed: 'Dihapus' };
  const name = row.full_name || 'Mahasiswa';
  return {
    ...row,
    name,
    initials: name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase(),
    nim: row.nim || '—',
    statusCode: row.status,
    study: row.study_program,
    game: currentDivisionNames[row.division_code] || divisionNames[row.division_code] || row.division_code,
    cohort: String(row.entry_year),
    date: new Date(row.created_at).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric' }),
    status: labels[row.status] || row.status,
    tone: tones[row.status] || 'waiting'
  };
}
