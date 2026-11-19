import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { validateDocumentFile, prepareDocumentFile } from './lib/documentValidation';
import { DEFAULT_GAME_DIVISIONS, fetchGameDivisions, homeVisibleDivisions } from './lib/gameDivisions';
import { fetchPublicEvents, formatEventDate } from './lib/events';
import { DEFAULT_HERO, DEFAULT_STATS, DEFAULT_ADVANTAGES, DEFAULT_HOME_GAMES, fetchHomeContent } from './lib/homeContent';
import {
  ArrowRight,
  ChevronRight,
  Gamepad2,
  MonitorCheck,
  ShieldCheck,
  Trophy,
  UsersRound,
  Smartphone,
  TrendingUp,
  Award,
  ChevronLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  MailCheck,
  RefreshCcw,
  UploadCloud,
  ImageIcon,
  CircleCheck,
  AlertTriangle,
  FileText,
  BadgeCheck,
  CirclePlus,
  LogOut,
  MessageSquareText,
  Phone,
} from 'lucide-react';
import logo from './assets/logo.png';
import mlbb from './assets/mlbb.png';
import pubg from './assets/pubg.png';
import userIcon from './assets/user-icons/user.png';
import advantageDocumentIcon from './assets/user-icons/advantage-icons/document.png';
import advantageProgressIcon from './assets/user-icons/advantage-icons/progress.png';
import advantageCertificateIcon from './assets/user-icons/advantage-icons/certificate.png';
import advantageRosterIcon from './assets/user-icons/advantage-icons/roster.png';
import advantageEsportsIcon from './assets/user-icons/advantage-icons/esports.png';
import advantageOfficialIcon from './assets/user-icons/advantage-icons/official.png';
import gameMlbbIcon from './assets/user-icons/game-icons/mlbb.png';
import gamePubgIcon from './assets/user-icons/game-icons/pubg.png';
import gameValorantIcon from './assets/user-icons/game-icons/valorant.png';
import gameEfootballIcon from './assets/user-icons/game-icons/efootball.png';
import instagramIcon from './assets/user-icons/social/instagram.png';
import discordIcon from './assets/user-icons/social/discord.png';
import youtubeIcon from './assets/user-icons/social/youtube.png';
import lockIcon from './assets/user-icons/lock.png';
import gamepadLoginIcon from './assets/user-icons/gamepad-login.png';
import otpLockIcon from './assets/user-icons/otp-lock.png';
import personalLockIcon from './assets/user-icons/personal-lock.png';
import uploadWarningIcon from './assets/user-icons/upload/warning.png';
import uploadCheckLargeIcon from './assets/user-icons/upload/check-large.png';
import uploadCheckSmallIcon from './assets/user-icons/upload/check-small.png';
import uploadCloudIcon from './assets/user-icons/upload/cloud.png';
import uploadImageFileIcon from './assets/user-icons/upload/image-file.png';
import successCheckIcon from './assets/user-icons/success-check.png';
import profileCardIcon from './assets/user-icons/profile-card.png';
import loginUserIcon from './assets/user-icons/login-user.png';
import resetPasswordLockIcon from './assets/user-icons/reset-password-lock.png';

const games = [
  { code: 'MLBB', name: 'Mobile Legends: Bang Bang', meta: 'Divisi MOBA • 240 Anggota', image: mlbb },
  { code: 'PUBG', name: 'PUBG Mobile', meta: 'Divisi Battle Royale • 120 Anggota', image: pubg },
  { code: 'VLRN', name: 'Valorant', meta: 'Divisi Tactical FPS • 135 Anggota', initials: 'V' },
  { code: 'EFB', name: 'eFootball', meta: 'Divisi Sports Sim • 85 Anggota', initials: 'eF' },
];


// Daftar 14 prodi Universitas Telkom Purwokerto (2026).
// S1 Informatika dipertahankan sesuai data registrasi lama dan penyebutan resmi kampus.
const STUDY_PROGRAMS = [
  'S1 Informatika',
  'S1 Sistem Informasi',
  'S1 Rekayasa Perangkat Lunak',
  'S1 Teknik Telekomunikasi',
  'S1 Teknik Elektro',
  'S1 Teknik Biomedis',
  'S1 Teknik Industri',
  'S1 Teknik Logistik',
  'S1 Teknologi Pangan',
  'S1 Bisnis Digital',
  'S1 Desain Komunikasi Visual',
  'S1 Desain Produk',
  'S1 Sains Data',
  'D3 Teknik Telekomunikasi',
];

// Gunakan aset ikon yang sama dengan keenam pilihan di Admin.
const advantageImageById = {
  document: advantageDocumentIcon,
  progress: advantageProgressIcon,
  certificate: advantageCertificateIcon,
  roster: advantageRosterIcon,
  esports: advantageEsportsIcon,
  official: advantageOfficialIcon,
};

function MobileHome({ loggedIn = false, navHref, onHomeLogoClick, homeContent, divisions, events }) {
  const mobileGames = [
    { dbCode: 'MLBB', code: 'MOBILE LEGENDS', className: 'mobile-game-banner--mlbb', mark: 'MOBILE LEGENDS', icon: gameMlbbIcon },
    { dbCode: 'PUBG', code: 'PUBG MOBILE', className: 'mobile-game-banner--pubg', mark: 'PUBG MOBILE', icon: gamePubgIcon },
    { dbCode: 'VLRN', code: 'VALORANT', className: 'mobile-game-banner--valorant', mark: 'VALORANT', icon: gameValorantIcon },
    { dbCode: 'EFB', code: 'E-FOOTBALL', className: 'mobile-game-banner--efootball', mark: 'eFOOTBALL', icon: gameEfootballIcon },
  ];
  const visibleMobileGames = homeVisibleDivisions(divisions, homeContent.games).map((division) => {
    const known = mobileGames.find((item) => item.dbCode === division.short);
    return {
      ...known,
      id: division.code,
      code: known && division.name === DEFAULT_GAME_DIVISIONS.find((row) => row.code === division.code)?.name
        ? known.code : division.name.toUpperCase(),
      mark: known && division.name === DEFAULT_GAME_DIVISIONS.find((row) => row.code === division.code)?.name
        ? known.mark : division.name,
      icon: division.logo_url || known?.icon || null,
      customLogo: Boolean(division.logo_url),
      banner_url: division.banner_url || null,
      is_active: division.is_active,
      className: known?.className || '',
    };
  });
  const hero = homeContent.hero;
  const stats = homeContent.stats;

  return (
    <main className="mobile-home">
      <header className="mobile-header">
        <a
          className="mobile-brand"
          href={navHref('beranda')}
          onClick={onHomeLogoClick}
        >
          <img src={logo} alt="" />
          <div><strong>TEL-U<br />ESPORTS</strong><span>PURWOKERTO</span></div>
        </a>
        {loggedIn ? (
          <a className="mobile-account-button" href="#profil" aria-label="Akun pengguna"><img src={userIcon} alt="" /></a>
        ) : (
          <div className="mobile-header-actions">
            <button type="button" className="mobile-login" onClick={() => { window.location.hash = 'login'; }}>Masuk</button>
            <a className="mobile-register" href="#daftar">Daftar</a>
          </div>
        )}
      </header>

      {hero.visible !== false && <section className="mobile-hero" id="m-home" style={hero.banner_url ? { backgroundImage: 'linear-gradient(rgba(7,13,24,.68),rgba(7,13,24,.82)), url(' + JSON.stringify(hero.banner_url) + ')' } : undefined}>
        <span className="mobile-season"><i /> {hero.badge}</span>
        <h1>{hero.title === DEFAULT_HERO.title ? <>Bergabunglah<br />dengan Komunitas<br /><em>Esports</em> Universitas Telkom<br />Purwokerto</> : hero.title}</h1>
        <p>{hero.description}</p>
        <a className="mobile-primary" href={loggedIn ? "#informasi-personal" : "#daftar"}>{loggedIn ? 'JOIN KOMUNITAS' : hero.cta}</a>
      </section>}

      {stats.visible !== false && <section className="mobile-stats">
        <article><strong>{stats.students}</strong><span>MAHASISWA</span></article>
        <article><strong>{stats.divisions}</strong><span>DIVISI GAME</span></article>
        <article><strong>{stats.champions}</strong><span>JUARA<br />NASIONAL</span></article>
      </section>}

      <section className="mobile-why" id="m-tentang">
        <h2>KENAPA DAFTAR DI SINI?</h2><i className="mobile-title-line" />
        <div className="mobile-benefits">
          {homeContent.advantages.filter((item) => item.active !== false).map((item, index) => {
            const icon = advantageImageById[item.iconId] || advantageDocumentIcon;
            const variant = item.iconId === 'progress' ? 'cyan' : item.iconId === 'certificate' ? 'gold' : 'red';
            return (
              <article key={item.id || index}>
                <div className={'mobile-benefit-icon mobile-benefit-icon--' + variant}><img src={icon} alt="" /></div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mobile-arena" id="m-game">
        <h2>PILIH ARENA KAMU</h2>
        <p>Eksplorasi kategori game resmi UKM dan temukan posisi terbaik sesuai peran dan spesialisasi bermainmu.</p>
        <div className="mobile-game-list">
          {visibleMobileGames.map((game) => (
            <article className="mobile-game-card" key={game.id}>
              <div className={`mobile-game-banner ${game.className}`} style={game.banner_url ? { backgroundImage: 'url(' + JSON.stringify(game.banner_url) + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} aria-label={'Banner ' + game.code} />
              <div className="mobile-game-body">
                <div className="mobile-game-name"><span className={'mobile-game-dot' + (game.customLogo ? ' mobile-game-dot--custom' : '')}>{game.icon ? <img src={game.icon} alt="" /> : game.code.slice(0, 2)}</span>{game.code}</div>
                {game.is_active ? <a className="mobile-join-squad" href={loggedIn ? "#informasi-personal" : "#daftar"}>JOIN SQUAD <ChevronRight size={11} /></a> : <span className="mobile-join-squad">DITUTUP</span>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mobile-events" id="m-event">
        {events.map((event) => (
          <article className="mobile-event-card" key={event.id}
            style={event.banner_url ? { backgroundImage: 'linear-gradient(115deg,rgba(17,20,33,.95),rgba(17,20,33,.76)),url(' + JSON.stringify(event.banner_url) + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
            {event.category?.trim() || event.end_date || event.start_date ? (
              <div className="mobile-event-top">
                {event.category?.trim() ? <span>{event.category}</span> : null}
                {event.end_date || event.start_date ? <time>{formatEventDate(event.end_date || event.start_date, { month: 'short' })}</time> : null}
              </div>
            ) : null}
            <h3>{event.name}</h3>
            {event.description?.trim() ? <p>{event.description}</p> : null}
            {event.benefit?.trim() ? <div className="mobile-event-benefit"><strong>Benefit:</strong> {event.benefit}</div> : null}
            {event.slots != null || event.prize_pool?.trim() || event.regulation_url ? (
              <div className="mobile-event-bottom">
                {event.slots != null || event.prize_pool?.trim()
                  ? <strong>{[event.slots != null ? event.slots + ' Slot' : '', event.prize_pool?.trim()].filter(Boolean).join(' · ')}</strong>
                  : null}
                {event.regulation_url ? <a href={event.regulation_url} target="_blank" rel="noopener noreferrer">Lihat Jadwal & Regulasi <ChevronRight size={10} /></a> : null}
              </div>
            ) : null}
          </article>
        ))}
        {!events.length ? <p className="mobile-event-empty">Belum ada event yang dipublikasikan.</p> : null}
      </section>

      <footer className="mobile-footer">
        <div className="mobile-footer-brand"><img src={logo} alt="" /><strong>TELKOM ESPORTS</strong></div>
        <p>Unit Kegiatan Mahasiswa Esports Universitas Telkom Purwokerto. Mewadahi minat dan bakat mahasiswa dalam bidang gim dan esports kompetitif di lingkungan kampus.</p>
        <div className="mobile-socials"><span><img src={discordIcon} alt="Discord" /></span><span><img src={instagramIcon} alt="Instagram" /></span><span><img src={youtubeIcon} alt="YouTube" /></span></div>
        <div className="mobile-footer-links">
          <div><strong>MENU</strong><a href={navHref('beranda')}>Beranda</a><a href={navHref('tentang')}>Tentang Kami</a><a href={navHref('game')}>Kategori Game</a><a href={navHref('event')}>Event</a></div>
          <div><strong>RESOURCES</strong><a href="#m-home">Cara Daftar</a><a href="#m-home">Peraturan UKM</a><a href="#m-home">FAQ Seleksi</a><a href="#m-home">Privacy Policy</a></div>
        </div>
        <small>© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</small>
      </footer>
    </main>
  );
}


function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const login = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const form = new FormData(e.currentTarget);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')).trim().toLowerCase(),
      password: String(form.get('password')),
    });
    setBusy(false);
    if (authError) { setError(authError.message); return; }
    window.location.hash = 'beranda-login';
  };

  return (
    <main className="user-login-page">
      <header className="user-login-header">
        <a className="user-login-back" href="#beranda" aria-label="Kembali ke beranda"><ChevronLeft /></a>
        <div className="user-login-heading">
          <strong>UKM ESPORTS</strong>
          <span>TEL-U PURWOKERTO</span>
        </div>
        <div className="user-login-logo"><img src={logo} alt="Tel-U Esports" /></div>
      </header>

      <div className="user-login-accent user-login-accent--left" />
      <div className="user-login-accent user-login-accent--right" />

      <section className="user-login-card">
        <div className="user-login-card__topline" />
        <div className="user-login-gamepad"><img src={gamepadLoginIcon} alt="" /></div>
        <h1>MASUK KE AKUN ANDA</h1>
        <p className="user-login-subtitle">Silakan masukkan email dan kata sandi Anda.</p>

        <form className="user-login-form" onSubmit={login}>
          <label className="user-login-label" htmlFor="login-email">EMAIL</label>
          <div className="user-login-input-wrap">
            <img className="user-login-field-icon user-login-field-icon--image" src={loginUserIcon} alt="" />
            <input id="login-email" name="email" required type="email" placeholder="user@gmail.com" autoComplete="email" />
          </div>

          <div className="user-login-password-row">
            <label className="user-login-label" htmlFor="login-password">KATA SANDI</label>
            <a href="#lupa-sandi">LUPA KATA SANDI?</a>
          </div>
          <div className="user-login-input-wrap">
            <img className="user-login-field-icon user-login-lock-icon" src={lockIcon} alt="" />
            <input id="login-password" name="password" required type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" />
            <button className="user-login-eye" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {error && <p role="alert" style={{ color: "#ff7777" }}>{error}</p>}
          <button className="user-login-submit" type="submit" disabled={busy}>{busy ? "MEMPROSES..." : "MASUK"}</button>
        </form>

        <p className="user-login-register-copy">Belum punya akun? <a href="#daftar">Daftar di sini</a></p>
      </section>

      <p className="user-login-copyright">© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</p>
    </main>
  );
}



function PersonalInfoPage({ authUser, onDraft, preferredDivision, divisions, catalogError }) {
  const [selectedGame, setSelectedGame] = useState('');
  const [nim, setNim] = useState('');
  const [blockedDivisions, setBlockedDivisions] = useState({});
  const [checkingDivisions, setCheckingDivisions] = useState(true);
  const [divisionError, setDivisionError] = useState('');

  const gameOptions = divisions.filter((game) => game.is_visible !== false);
  const gameCode = Object.fromEntries(gameOptions.map((game) => [game.name, game.code]));
  const selectedDivision = gameOptions.find((game) => game.name === selectedGame);
  const angkatanOptions = Array.from({ length: 12 }, (_, index) => 2019 + index);

  useEffect(() => {
    if (!authUser?.id) return;
    let active = true;
    supabase.from('ridoooo_applications').select('nim')
      .eq('user_id', authUser.id).not('nim', 'is', null)
      .order('created_at', { ascending: false }).limit(1)
      .then(({ data, error }) => {
        if (active && !error && data?.[0]?.nim) setNim(data[0].nim);
      });
    return () => { active = false; };
  }, [authUser?.id]);

  useEffect(() => {
    let active = true;
    const loadDivisions = async () => {
      const { data, error } = await supabase.from('ridoooo_applications')
        .select('division_code,status').eq('user_id', authUser.id)
        .order('created_at', { ascending: false });
      if (!active) return;
      if (error) {
        setDivisionError('Gagal memeriksa status divisi. Coba refresh halaman.');
        setCheckingDivisions(false);
        return;
      }
      const blocked = {};
      (data || []).forEach((item) => {
        // Riwayat rejected/removed tidak menghalangi pendaftaran ulang.
        // Status accepted tetap diutamakan jika ada lebih dari satu riwayat.
        if (item.status === 'accepted' || (item.status === 'pending' && !blocked[item.division_code])) {
          blocked[item.division_code] = item.status;
        }
      });
      setBlockedDivisions(blocked);
      const preferredGame = gameOptions.find((game) => game.code === preferredDivision);
      setSelectedGame(preferredGame && preferredGame.is_active && !blocked[preferredDivision] ? preferredGame.name : '');
      setDivisionError('');
      setCheckingDivisions(false);
    };
    loadDivisions();
    return () => { active = false; };
  }, [authUser.id, preferredDivision, divisions]);

  return (
    <main className="user-personal-page">
      <header className="user-personal-header">
        <a className="user-personal-back" href="#beranda-login" aria-label="Kembali ke beranda"><ChevronLeft /></a>
        <div className="user-personal-heading">
          <strong>UKM ESPORTS</strong>
          <span>TEL-U PURWOKERTO</span>
        </div>
        <div className="user-personal-logo"><img src={logo} alt="Tel-U Esports" /></div>
      </header>

      <section className="user-personal-wrap">
        <section className="user-personal-card">
          <h1>Informasi Personal</h1>
          <p className="user-personal-subtitle">Lengkapi data dirimu untuk verifikasi keanggotaan resmi UKM.</p>

         <form
  className="user-personal-form"
  onSubmit={(e) => {
    e.preventDefault();
    if (catalogError || checkingDivisions || divisionError || !selectedDivision || !selectedDivision.is_active || blockedDivisions[gameCode[selectedGame]]) {
      setDivisionError('Pilih divisi yang tersedia sebelum melanjutkan.');
      return;
    }
    const form = e.currentTarget;
    onDraft({
      division_code: gameCode[selectedGame],
      full_name: authUser?.user_metadata?.full_name?.trim() || '',
      nim: form.elements.namedItem('nim').value.trim(),
      study_program: form.elements.namedItem('study_program').value,
      entry_year: Number(form.elements.namedItem('entry_year').value),
      game_nickname: form.elements.namedItem('game_nickname').value.trim(),
      whatsapp: form.elements.namedItem('no_whatsapp').value.trim(),
      motivation: form.elements.namedItem('motivation').value.trim(),
    });
    window.location.hash = 'unggah-dokumen';
  }}
>
            <div className="user-personal-group">
              <label htmlFor="personal-name">Nama Lengkap</label>
              <div className="user-personal-input user-personal-input--readonly">
                <input id="personal-name" value={authUser?.user_metadata?.full_name || ""} readOnly />
                <img className="user-personal-lock-icon" src={personalLockIcon} alt="" />
              </div>
              <small>Tersinkronisasi otomatis dari akun mahasiswa</small>
            </div>

            <div className="user-personal-group">
              <label htmlFor="personal-nim">NIM (Nomor Induk Mahasiswa)</label>
              <div className="user-personal-input">
                <input id="personal-nim" name="nim" type="text" inputMode="numeric"
                  autoComplete="off" placeholder="Masukkan NIM mahasiswa"
                  value={nim} onChange={event => setNim(event.target.value.replace(/\D/g, ''))}
                  pattern="[0-9]{6,20}" minLength={6} maxLength={20}
                  title="NIM harus terdiri dari 6 sampai 20 digit angka" required />
              </div>
              <small>Wajib diisi sesuai identitas pada KTM.</small>
            </div>

            <div className="user-personal-grid user-personal-grid--study">
              <div className="user-personal-group">
                <label htmlFor="personal-study">Program Studi</label>
                <div className="user-personal-select-wrap">
                  <select id="personal-study" name="study_program" defaultValue="" required>
                    <option value="" disabled>Pilih Program Studi</option>
                    {STUDY_PROGRAMS.map((program) => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                  <ChevronRight className="user-personal-select-icon" />
                </div>
              </div>
              <div className="user-personal-group">
                <label htmlFor="personal-year">Angkatan</label>
                <div className="user-personal-select-wrap">
                  <select id="personal-year" name="entry_year" defaultValue="" required>
                    <option value="" disabled>Pilih Angkatan</option>
                    {angkatanOptions.map((tahun) => (
                      <option key={tahun} value={tahun}>{tahun}</option>
                    ))}
                  </select>
                  <ChevronRight className="user-personal-select-icon" />
                </div>
              </div>
            </div>

            <div className="user-personal-group">
              <label>Kategori Game Utama</label>
              <div className="user-personal-games">
                {gameOptions.map((game) => {
                  const status = blockedDivisions[game.code];
                  const closed = game.is_active === false;
                  return (
                    <button
                      key={game.code}
                      type="button"
                      className={selectedGame === game.name ? 'is-selected' : ''}
                      disabled={checkingDivisions || Boolean(divisionError) || Boolean(status) || closed}
                      aria-label={game.name + (status || closed ? ' — tidak tersedia' : ' — tersedia')}
                      title={closed ? 'Pendaftaran divisi ditutup' : status === 'accepted' ? 'Sudah diterima' : status === 'pending' ? 'Menunggu verifikasi' : 'Tersedia untuk pendaftaran'}
                      onClick={() => { setSelectedGame(game.name); setDivisionError(''); }}
                    >
                      <span className="user-personal-game-dot" />
                      <span>{game.name}</span>
                      {(status || closed) && <small className="user-personal-game-status">
                        {closed ? 'Ditutup' : status === 'accepted' ? 'Sudah diterima' : status === 'pending' ? 'Menunggu verifikasi' : 'Tidak aktif'}
                      </small>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="user-personal-grid">
              <div className="user-personal-group">
                <label htmlFor="personal-id">Nickname / ID Game</label>
                <div className="user-personal-input">
                  <input id="personal-id" name="game_nickname" required maxLength={100} type="text" placeholder="Progamer#123" />
                </div>
              </div>
              <div className="user-personal-group">
  <label htmlFor="personal-whatsapp">Nomor WhatsApp</label>
  <div className="user-personal-input">
    <input
      id="personal-whatsapp"
      name="no_whatsapp"
      type="tel"
      inputMode="numeric"
      placeholder="Contoh: 081234567890"
      maxLength={15}
      pattern="[0-9]{10,15}"
      title="Masukkan nomor WhatsApp 10–15 digit angka"
      required
    />
  </div>
</div>
            </div>

            <div className="user-personal-group">
              <label htmlFor="personal-motivation">Motivasi Bergabung</label>
              <textarea id="personal-motivation" name="motivation" maxLength={2000} placeholder="Apa tujuan kamu bergabung dengan UKM Esports Universitas Telkom Purwokerto?" />
            </div>

            {checkingDivisions && <p aria-live="polite">Memeriksa divisi yang tersedia...</p>}
            {catalogError && <p role="alert" style={{ color: '#ff7777' }}>{catalogError}</p>}
            {divisionError && <p role="alert" style={{ color: '#ff7777' }}>{divisionError}</p>}
            <button className="user-personal-primary" type="submit"
              disabled={Boolean(catalogError) || checkingDivisions || Boolean(divisionError) || !selectedDivision || !selectedDivision.is_active || Boolean(blockedDivisions[gameCode[selectedGame]])}>
              Lanjutkan
            </button>
            <a className="user-personal-secondary" href="#beranda-login">Kembali</a>
          </form>
        </section>

        <aside className="user-personal-notes">
          <p><i className="note-dot note-dot--cyan" /><span><strong>Keamanan Data:</strong> Identitas hanya digunakan untuk arsip internal keanggotaan UKM.</span></p>
          <p><i className="note-dot note-dot--red" /><span><strong>ID Game:</strong> Pastikan ID in-game aktif untuk seleksi roster divisi.</span></p>
          <p><i className="note-dot note-dot--green" /><span><strong>Bantuan:</strong> Ada kendala pendaftaran? Hubungi Divisi Keanggotaan via Discord/IG/wa.</span></p>
        </aside>
      </section>

      <p className="user-personal-copyright">© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</p>
    </main>
  );
}


function RegistrationDocumentUpload({
  id, title, account, accept, formats, selected, onChoose, onClear, disabled, fieldError
}) {
  const [dragging, setDragging] = useState(false);
  const fileType = selected?.file?.type === 'application/pdf'
    ? 'PDF' : selected?.file?.type === 'image/png' ? 'PNG' : 'JPG';

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled && event.dataTransfer?.files?.length) {
      onChoose(event.dataTransfer.files[0]);
    }
  };

  return (
    <section className="user-upload-card">
      <div className="user-upload-card-head">
        <h2>{title}{account && <small>{account}</small>}</h2>
        <span className="user-upload-required">Wajib</span>
      </div>

      <div
        className={`user-upload-dropzone${selected ? ' is-ready' : ''}${dragging ? ' is-dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }}
        onDrop={handleDrop}
      >
        <input
          id={id}
          className="user-upload-file-input"
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(event) => {
            onChoose(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        <label className="user-upload-dropzone__control" htmlFor={id}>
          <span className={`user-upload-circle ${selected ? 'user-upload-circle--green' : 'user-upload-circle--cyan'}`}>
            <img src={selected ? uploadCheckLargeIcon : uploadCloudIcon} alt="" />
          </span>
          <strong>{selected ? 'Berkas siap diunggah' : 'Pilih berkas atau tarik ke sini'}</strong>
          <small>Format {formats} (Maks. 5MB)</small>
        </label>

        {selected && (
          <div className="user-upload-file-block">
            <div className="user-upload-file-row">
              <span className="user-upload-filetype">{fileType}</span>
              <span className="user-upload-filename" title={selected.name}>{selected.name}</span>
              <strong>Siap diunggah</strong>
            </div>
            <div className="user-upload-meta">
              <span>Ukuran: {selected.size}</span>
              <div className="user-upload-file-actions">
                <label htmlFor={id}>Ganti Berkas</label>
                <button type="button" disabled={disabled} onClick={onClear}>Batalkan</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {fieldError && <p className="user-upload-field-error" role="alert">{fieldError}</p>}
    </section>
  );
}

function UploadDocumentsPage({ authUser, draft, onSubmitted }) {
  const [ktmFile, setKtmFile] = useState(null);
  const [followFile, setFollowFile] = useState(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const pickFile = (setter, isInstagram = false) => async (file) => {
    if (!file) return;
    const field = isInstagram ? 'instagram' : 'ktm';
    const prepared = await prepareDocumentFile(file, { isInstagram });
    if (prepared.error) {
      setter(null);
      setFieldErrors((current) => ({ ...current, [field]: prepared.error }));
      setError('');
      return;
    }
    setFieldErrors((current) => ({ ...current, [field]: '' }));
    setError('');
    setter({ file: prepared.file, name: file.name || prepared.file.name,
      size: (prepared.file.size / 1048576).toFixed(2) + ' MB' });
  };

  const submitApplication = async () => {
    setError('');
    if (!draft?.division_code) { window.location.hash = 'informasi-personal'; return; }
    if (!ktmFile?.file || !followFile?.file) {
      setError('Unggah KTM dan bukti follow Instagram terlebih dahulu.'); return;
    }
    const ktmInvalid = await validateDocumentFile(ktmFile.file);
    const instagramInvalid = await validateDocumentFile(followFile.file, { isInstagram: true });
    if (ktmInvalid || instagramInvalid) { setError(ktmInvalid || instagramInvalid); return; }
    if (!authUser?.id || !authUser.email_confirmed_at) {
      setError('Silakan login menggunakan akun yang emailnya sudah terverifikasi.'); return;
    }
    setBusy(true);
    const bucket = 'ridoooo-application-documents';
    const uploaded = [];
    try {
      const { data: division, error: divisionCheckError } = await supabase
        .from('ridoooo_divisions').select('is_active,name,division_label')
        .eq('code', draft.division_code).single();
      if (divisionCheckError) throw divisionCheckError;
      if (!division?.is_active) throw new Error(
        'Pendaftaran divisi ini sudah ditutup. Pilih divisi lain yang masih dibuka.'
      );
      const { data: existing, error: checkError } = await supabase
        .from('ridoooo_applications').select('id,status')
        .eq('user_id', authUser.id).eq('division_code', draft.division_code)
        .in('status', ['pending', 'accepted']).limit(1);
      if (checkError) throw checkError;
      if (existing?.length) throw new Error(
        existing[0].status === 'accepted'
          ? 'Kamu sudah diterima di divisi ini.'
          : 'Pendaftaran divisi ini masih menunggu verifikasi admin.'
      );
      // Jangan unggah dokumen jika migration NIM belum diterapkan.
      const { error: nimSchemaError } = await supabase.from('ridoooo_applications')
        .select('nim').limit(1);
      if (nimSchemaError) throw new Error('Pendaftaran NIM belum diaktifkan di database. Hubungi admin UKM.');
      const id = crypto.randomUUID();
      const extension = (file) => file.type === 'application/pdf' ? 'pdf'
        : file.type === 'image/png' ? 'png' : 'jpg';
      const ktm_path = authUser.id + '/' + id + '/ktm.' + extension(ktmFile.file);
      const instagram_path = authUser.id + '/' + id + '/instagram.' + extension(followFile.file);
      for (const [path, file] of [[ktm_path, ktmFile.file], [instagram_path, followFile.file]]) {
        const { error: uploadError } = await supabase.storage.from(bucket)
          .upload(path, file, { upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        uploaded.push(path);
      }
      const { data, error: insertError } = await supabase
        .from('ridoooo_applications')
        .insert({
          id, user_id: authUser.id, email: authUser.email,
          ...draft, ktm_path, instagram_path, status: 'pending'
        }).select().single();
      if (insertError?.code === '23505' && insertError.message?.includes('ridoooo_one_active_application')) {
        throw new Error('Pendaftaran divisi ini masih dibatasi database. Jika keanggotaan sebelumnya sudah dihapus, minta Admin menjalankan migration 010 di Supabase.');
      }
      if (insertError) throw insertError;
      onSubmitted({ ...data, division_name: division.name, division_label: division.division_label });
      window.location.hash = 'pendaftaran-berhasil';
    } catch (err) {
      if (uploaded.length) await supabase.storage.from(bucket).remove(uploaded);
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="user-upload-page">
      <header className="user-upload-header">
        <a className="user-upload-back" href="#informasi-personal" aria-label="Kembali ke informasi personal"><ChevronLeft /></a>
        <div className="user-upload-heading">
          <strong>UKM ESPORTS</strong>
          <span>TEL-U PURWOKERTO</span>
        </div>
        <div className="user-upload-logo"><img src={logo} alt="Tel-U Esports" /></div>
      </header>

      <section className="user-upload-wrap">
        <h1>Unggah Dokumen</h1>
        <p className="user-upload-subtitle">Unggah dokumen identitas dan bukti keanggotaan untuk validasi kurasi tim UKM Esports Tel-U Purwokerto.</p>

        <RegistrationDocumentUpload
          id="upload-ktm"
          title="Kartu Tanda Mahasiswa (KTM)"
          accept=".jpg,.jpeg,.png,.pdf"
          formats="JPG, PNG, PDF"
          selected={ktmFile}
          onChoose={pickFile(setKtmFile)}
          onClear={() => { setKtmFile(null); setError(''); setFieldErrors((current) => ({ ...current, ktm: '' })); }}
          fieldError={fieldErrors.ktm}
          disabled={busy}
        />
        <RegistrationDocumentUpload
          id="upload-instagram"
          title="Tangkapan Layar Follow IG"
          account="@telupwt.esports"
          accept=".jpg,.jpeg,.png"
          formats="JPG, PNG"
          selected={followFile}
          onChoose={pickFile(setFollowFile, true)}
          onClear={() => { setFollowFile(null); setError(''); setFieldErrors((current) => ({ ...current, instagram: '' })); }}
          fieldError={fieldErrors.instagram}
          disabled={busy}
        />

        <aside className="user-upload-warning">
          <img className="user-upload-warning-icon" src={uploadWarningIcon} alt="" />
          <div>
            <strong>Penting: Verifikasi Identitas</strong>
            <p>Pastikan nama pada Kartu Tanda Mahasiswa (KTM) sesuai dengan data diri yang telah diisi. Dokumen yang tidak valid atau tidak sesuai dapat menyebabkan proses verifikasi pendaftaran keanggotaan ditolak.</p>
          </div>
        </aside>

        {error && <p role="alert" style={{ color: "#ff7777", marginBottom: 12 }}>{error}</p>}
        <button className="user-upload-primary" type="button" disabled={busy} onClick={submitApplication}>{busy ? "Mengirim pendaftaran..." : "Submit Dokumen"}</button>
        <a className="user-upload-secondary" href="#informasi-personal">Kembali</a>
      </section>

      <p className="user-upload-copyright">© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</p>
    </main>
  );
}



function UserProfilePage({ authUser, onReapply, divisions }) {
  const [applications, setApplications] = useState([]);
  const [historicalDivisions, setHistoricalDivisions] = useState([]);
  useEffect(() => {
    let active = true;
    fetchGameDivisions({ includeDeleted: true }).then((rows) => {
      if (active) setHistoricalDivisions(rows);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    let active = true;
    supabase.from('ridoooo_applications')
      .select('id,division_code,status,created_at,review_note')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        setApplications(data || []);
        setLoadError(error ? 'Gagal memuat riwayat divisi. Silakan coba lagi atau hubungi Admin UKM Esports.' : '');
        setLoading(false);
      });
    return () => { active = false; };
  }, [authUser.id]);
  const activeApps = applications.filter(a => a.status === 'pending' || a.status === 'accepted');
  const reapplyIds = new Set();
  const lastSeenDivisions = new Set();
  applications.forEach((app) => {
    if (lastSeenDivisions.has(app.division_code)) return;
    lastSeenDivisions.add(app.division_code);
    if (['rejected', 'removed'].includes(app.status)
      && !activeApps.some((active) => active.division_code === app.division_code)
      && divisions.some((division) => division.code === app.division_code && division.is_active && division.is_visible !== false)) {
      reapplyIds.add(app.id);
    }
  });
  const names = { mlbb: 'Mobile Legends', valorant: 'Valorant', pubg: 'PUBG Mobile', efootball: 'eFootball', ...Object.fromEntries(historicalDivisions.map((item) => [item.code, item.name])), ...Object.fromEntries(divisions.map((item) => [item.code, item.name])) };
  const statusText = { pending: 'Menunggu Verifikasi', accepted: 'Diterima', rejected: 'Ditolak', removed: 'Dihapus' };
  const statusTone = { pending: 'verify', accepted: 'accepted', rejected: 'rejected', removed: 'rejected' };
  return (
    <main className="user-profile-page">
      <header className="user-profile-header">
        <a className="user-profile-back" href="#beranda-login" aria-label="Kembali ke beranda"><ChevronLeft /></a>
        <div className="user-profile-heading">
          <strong>UKM ESPORTS</strong>
          <span>TEL-U PURWOKERTO</span>
        </div>
        <div className="user-profile-account"><img src={logo} alt="Tel-U Esports" /></div>
      </header>

      <section className="user-profile-wrap">
        <section className="user-profile-card">
          <div className="user-profile-avatar">{(authUser?.user_metadata?.full_name || authUser?.email || "M").split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase()}</div>
          <div className="user-profile-copy">
            <div className="user-profile-name-row">
              <h1>{authUser?.user_metadata?.full_name || "Mahasiswa"}</h1>
              <BadgeCheck />
            </div>
            <p>{authUser?.email}</p>
            <small>Terdaftar di sistem UKM Esports Universitas Telkom Purwokerto</small>
          </div>
          <div className="user-profile-card-slot" aria-hidden="true"><img src={profileCardIcon} alt="" /></div>
        </section>

        <div className="user-profile-stats">
          <section className="user-profile-stat-card">
            <div>
              <span className="user-profile-total-label">PENDAFTARAN AKTIF</span>
              <strong>{activeApps.length} Divisi</strong>
            </div>
            <div className="user-profile-stat-icon"><Gamepad2 /></div>
          </section>

          <section className="user-profile-stat-card">
            <div>
              <span>PENDAFTARAN DITERIMA</span>
              <strong className="is-green">{applications.filter(a => a.status === "accepted").length} Diterima</strong>
            </div>
            <div className="user-profile-stat-icon user-profile-stat-icon--green"><CircleCheck /></div>
          </section>
        </div>

        <div className="user-profile-section-head">
          <h2>RIWAYAT PENDAFTARAN DIVISI</h2>
          <span>{activeApps.length} Pengajuan Aktif</span>
        </div>

        <div className="user-profile-games">
          {loading && <p>Memuat pendaftaran divisi...</p>}
          {loadError && <p role="alert" style={{ color: "#ff7777" }}>{loadError}</p>}
          {!loading && !loadError && applications.length === 0 && <p>Belum ada pendaftaran divisi.</p>}
          {applications.map(app => (
            <section className="user-profile-game-card" key={app.id}>
              <div>
                <h3>{names[app.division_code] || app.division_code}</h3>
                {app.review_note && (
                  <div className="user-profile-admin-note">
                    <strong>Catatan Admin</strong>
                    <p>{app.review_note}</p>
                  </div>
                )}
                {reapplyIds.has(app.id) && (
                  <a className="user-profile-reapply" href="#informasi-personal"
                    onClick={() => onReapply(app.division_code)}>
                    Daftar Ulang Divisi <ChevronRight size={15} />
                  </a>
                )}
              </div>
              <span className={`user-profile-status user-profile-status--${statusTone[app.status] || 'verify'}`}>
                {statusText[app.status] || app.status}
              </span>
            </section>
          ))}
        </div>

        <a className="user-profile-add-game" href="#informasi-personal">
          <CirclePlus /> <span>Daftar Divisi Lain</span>
        </a>

        <a className="user-profile-logout" href="#beranda" onClick={async (e) => {
          e.preventDefault();
          await supabase.auth.signOut();
          window.location.hash = 'beranda';
        }}>
          <LogOut /> <span>Keluar Akun</span>
        </a>

        <section className="user-profile-help">
          <p><MessageSquareText /><strong>Butuh Bantuan?</strong> <span>Kontak Pengurus</span></p>
          <a className="user-profile-contact-link" href="https://wa.me/6285117075805" target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp pengurus UKM Esports di +62 851-1707-5805">
            <Phone /> <span>+62 851-1707-5805</span>
          </a>
        </section>
      </section>

      <p className="user-profile-copyright">© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</p>
    </main>
  );
}

function RegistrationSuccessPage({ application, divisions }) {
  const [historicalDivision, setHistoricalDivision] = useState(null);
  useEffect(() => {
    if (!application?.division_code || application?.division_name) return;
    let active = true;
    fetchGameDivisions({ includeDeleted: true }).then((rows) => {
      if (active) setHistoricalDivision(rows.find((item) => item.code === application.division_code) || null);
    }).catch(() => {});
    return () => { active = false; };
  }, [application?.division_code, application?.division_name]);
  const selectedDivision = divisions.find((item) => item.code === application?.division_code) || historicalDivision;
  const gameName = application?.division_name || selectedDivision?.name || application?.division_code || '-';
  const divisionLabel = application?.division_label || selectedDivision?.division_label || '';
  return (
    <main className="user-success-page">
      <header className="user-success-header">
        <div />
        <div className="user-success-heading">
          <strong>UKM ESPORTS</strong>
          <span>TEL-U PURWOKERTO</span>
        </div>
        <div className="user-success-logo"><img src={logo} alt="Tel-U Esports" /></div>
      </header>

      <section className="user-success-wrap">
        <div className="user-success-icon-wrap">
          <span className="user-success-icon-ring user-success-icon-ring--outer" />
          <span className="user-success-icon-ring user-success-icon-ring--inner" />
          <span className="user-success-icon-core"><img src={successCheckIcon} alt="" /></span>
        </div>

        <h1>Pendaftaran Berhasil Dikirim!</h1>
        <p className="user-success-subtitle">
          Data dan dokumen sudah terkirim. Pengurus UKM akan memeriksa pendaftaranmu.
          Pantau status melalui halaman profil.
        </p>

        <section className="user-success-summary">
          <div className="user-success-summary-head">
            <h2>RINGKASAN<br />PENDAFTARAN</h2>
            <span className="user-success-status"><i /> Menunggu<br />Verifikasi</span>
          </div>

          <div className="user-success-divider" />

          <dl className="user-success-details">
            <div><dt>Nama Lengkap</dt><dd>{application?.full_name || '-'}</dd></div>
            <div><dt>Program Studi / Angkatan</dt><dd>{application?.study_program || '-'} • {application?.entry_year || '-'}</dd></div>
            <div><dt>Kategori Game</dt><dd className="is-accent">{gameName}{divisionLabel ? <small className="user-success-game-category">{divisionLabel}</small> : null}</dd></div>
            <div><dt>Nickname / ID</dt><dd>{application?.game_nickname || '-'}</dd></div>
            <div className="user-success-submit-time"><dt>Waktu Submit</dt><dd>{application?.created_at ? new Date(application.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB' : '-'}</dd></div>
          </dl>
        </section>

        <a className="user-success-primary" href="#profil">Lihat Profil Saya</a>
        <a className="user-success-secondary" href="#beranda-login">Kembali ke Beranda</a>
      </section>

      <p className="user-success-copyright">© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</p>
    </main>
  );
}

function ResetPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sendReset = async (e) => {
    e.preventDefault(); setError('');
    const email = String(new FormData(e.currentTarget).get('email')).trim().toLowerCase();
    setBusy(true);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email);
    setBusy(false);
    if (authError) { setError(authError.message); return; }
    sessionStorage.setItem('ridoooo_recovery_email', email);
    window.location.hash = 'verifikasi-otp-reset';
  };
  return (
    <main className="user-reset-page">
      <header className="user-reset-header">
        <a className="user-reset-back" href="#login" aria-label="Kembali ke login"><ChevronLeft /></a>
        <div className="user-reset-heading">
          <strong>UKM ESPORTS</strong>
          <span>TEL-U PURWOKERTO</span>
        </div>
        <div className="user-reset-logo"><img src={logo} alt="Tel-U Esports" /></div>
      </header>
      <section className="user-reset-card">
        <div className="user-reset-icon"><MailCheck /></div>
        <h1>Lupa Kata Sandi</h1>
        <p className="user-reset-subtitle">Masukkan email yang terdaftar<br />untuk menerima kode verifikasi OTP</p>
        <form className="user-reset-form" onSubmit={sendReset}>
          <label htmlFor="reset-email">EMAIL</label>
          <div className="user-reset-input-wrap">
            <MailCheck className="user-reset-field-icon" />
            <input id="reset-email" name="email" required type="email" placeholder="user@gmail.com" autoComplete="email" />
          </div>
          {error && <p role="alert" style={{ color: "#ff7777" }}>{error}</p>}
          <button className="user-reset-submit" type="submit" disabled={busy}>{busy ? "MENGIRIM..." : "KIRIM KODE OTP"}</button>
        </form>
        <p className="user-reset-login-copy">Ingat kata sandi? <a href="#login">Masuk di sini</a></p>
      </section>
      <p className="user-reset-copyright">© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</p>
    </main>
  );
}

function ResetOtpPage() {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [seconds, setSeconds] = useState(60);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const email = sessionStorage.getItem('ridoooo_recovery_email') || '';
  const verifyRecovery = async (e) => {
    e.preventDefault(); setError('');
    if (!email) { setError('Email pemulihan tidak ditemukan. Ulangi permintaan reset.'); return; }
    if (!/^[0-9]{6}$/.test(otp.join(''))) { setError('Masukkan kode OTP 6 digit.'); return; }
    setBusy(true);
    const { error: authError } = await supabase.auth.verifyOtp({ email, token: otp.join(''), type: 'recovery' });
    setBusy(false);
    if (authError) { setError(authError.message); return; }
    sessionStorage.removeItem('ridoooo_recovery_email');
    window.location.hash = 'kata-sandi-baru';
  };

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const updateOtp = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtp((items) => items.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) document.getElementById('reset-otp-' + (index + 1))?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById('reset-otp-' + (index - 1))?.focus();
    }
  };

  const resend = async () => {
    if (seconds > 0 || busy || !email) return;
    setBusy(true); setError('');
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email);
    setBusy(false);
    if (authError) { setError(authError.message); return; }
    setSeconds(60);
    setOtp(Array(6).fill(''));
    requestAnimationFrame(() => document.getElementById('reset-otp-0')?.focus());
  };

  return (
    <main className="user-reset-page user-reset-otp-page">
      <header className="user-reset-header">
        <a className="user-reset-back" href="#lupa-sandi" aria-label="Kembali ke lupa kata sandi"><ChevronLeft /></a>
        <div className="user-reset-heading">
          <strong>UKM ESPORTS</strong>
          <span>TEL-U PURWOKERTO</span>
        </div>
        <div className="user-reset-logo"><img src={logo} alt="Tel-U Esports" /></div>
      </header>
      <section className="user-reset-card user-reset-otp-card">
        <div className="user-reset-icon user-reset-icon--glow"><ShieldCheck /></div>
        <h1>Verifikasi Kode OTP</h1>
        <p className="user-reset-subtitle">Masukkan 6 digit kode verifikasi yang telah<br />dikirimkan ke email :</p>
        <div className="user-reset-email-pill">{email || "email pemulihan"}</div>
        <form className="user-reset-form" onSubmit={verifyRecovery}>
          <div className="user-reset-otp-inputs" aria-label="Masukkan kode OTP reset kata sandi">
            {otp.map((digit, index) => (
              <input key={index} id={'reset-otp-' + index} type="text" inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength="1" value={digit}
                onChange={(e) => updateOtp(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0} />
            ))}
          </div>
          <button className="user-reset-resend" type="button" onClick={resend} disabled={seconds > 0}>
            Tidak menerima kode? <strong>Kirim Ulang</strong> {seconds > 0 && <span>(00:{String(seconds).padStart(2, '0')})</span>}
          </button>
          {error && <p role="alert" style={{ color: "#ff7777" }}>{error}</p>}
          <button className="user-reset-submit" type="submit" disabled={busy}>{busy ? "MEMPROSES..." : "VERIFIKASI KODE"}</button>
        </form>
      </section>
      <p className="user-reset-copyright">© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</p>
    </main>
  );
}

function NewPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const savePassword = async (e) => {
    e.preventDefault(); setError('');
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password'));
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Kata sandi minimal 8 karakter, mengandung huruf dan angka.'); return;
    }
    if (password !== form.get('confirm')) { setError('Konfirmasi kata sandi tidak cocok.'); return; }
    setBusy(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (authError) { setError(authError.message); return; }
    await supabase.auth.signOut();
    window.location.hash = 'login';
  };
  return (
    <main className="user-reset-page user-new-password-page">
      <header className="user-reset-header">
        <a className="user-reset-back" href="#verifikasi-otp-reset" aria-label="Kembali ke verifikasi OTP"><ChevronLeft /></a>
        <div className="user-reset-heading">
          <strong>UKM ESPORTS</strong>
          <span>TEL-U PURWOKERTO</span>
        </div>
        <div className="user-reset-logo"><img src={logo} alt="Tel-U Esports" /></div>
      </header>
      <section className="user-new-password-shell">
        <div className="user-reset-icon user-reset-icon--custom"><img src={resetPasswordLockIcon} alt="" /></div>
        <h1>Buat Kata Sandi Baru</h1>
        <form className="user-new-password-form" onSubmit={savePassword}>
          <div className="user-new-password-group">
            <label htmlFor="new-password">KATA SANDI BARU</label>
            <div className="user-new-password-input-wrap">
              <LockKeyhole />
              <input id="new-password" name="password" required minLength={8} type={showPassword ? 'text' : 'password'} placeholder="••••••••••••" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff /> : <Eye />}</button>
            </div>
          </div>
          <div className="user-new-password-group">
            <label htmlFor="confirm-new-password">KONFIRMASI KATA SANDI BARU</label>
            <div className="user-new-password-input-wrap">
              <ShieldCheck />
              <input id="confirm-new-password" name="confirm" required type={showConfirm ? 'text' : 'password'} placeholder="••••••••••••" autoComplete="new-password" />
              <button type="button" onClick={() => setShowConfirm((value) => !value)} aria-label={showConfirm ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}>{showConfirm ? <EyeOff /> : <Eye />}</button>
            </div>
          </div>
          <div className="user-new-password-rules">
            <span>KETENTUAN KEAMANAN</span>
            <p>○ Minimal 8 karakter</p><p>○ Kombinasi huruf &amp; angka</p><p>○ Kedua kata sandi cocok</p>
          </div>
          {error && <p role="alert" style={{ color: "#ff7777" }}>{error}</p>}
          <button className="user-reset-submit" type="submit" disabled={busy}>{busy ? "MENYIMPAN..." : "SIMPAN KATA SANDI"}</button>
        </form>
      </section>
      <p className="user-reset-copyright">© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</p>
    </main>
  );
}

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const register = async (e) => {
    e.preventDefault(); setError('');
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name')).trim();
    const email = String(form.get('email')).trim().toLowerCase();
    const password = String(form.get('password'));
    if (name.length < 2) { setError('Masukkan nama lengkap sesuai KTM.'); return; }
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Kata sandi minimal 8 karakter, mengandung huruf dan angka.'); return;
    }
    if (password !== form.get('confirm')) { setError('Konfirmasi kata sandi tidak cocok.'); return; }
    setBusy(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } },
    });
    setBusy(false);
    if (authError) { setError(authError.message); return; }
    if (!data.user) { setError('Akun belum dapat dibuat. Coba lagi.'); return; }
    sessionStorage.setItem('ridoooo_pending_signup_email', email);
    window.location.hash = 'verifikasi-otp';
  };

  return (
    <main className="user-register-page">
      <header className="user-register-header">
        <a className="user-register-back" href="#beranda" aria-label="Kembali ke beranda"><ChevronLeft /></a>
        <div className="user-register-heading">
          <strong>UKM ESPORTS</strong>
          <span>TEL-U PURWOKERTO</span>
        </div>
        <div className="user-register-logo"><img src={logo} alt="Tel-U Esports" /></div>
      </header>

      <section className="user-register-card">
        <div className="user-register-side-accent" />
        <h1>Buat Akun Baru</h1>
        <p className="user-register-subtitle">Mulai perjalanan kompetitifmu bersama kami.</p>

        <form className="user-register-form" onSubmit={register}>
          <div className="user-register-field-group">
            <div className="user-register-label-row">
              <label htmlFor="register-name">NAMA LENGKAP</label>
              <span>Sesuai KTM</span>
            </div>
            <input id="register-name" name="name" required type="text" placeholder="Masukkan nama lengkap sesuai KTM" autoComplete="name" />
          </div>

          <div className="user-register-field-group">
            <label htmlFor="register-email">EMAIL</label>
            <input id="register-email" name="email" required type="email" placeholder="Masukkan alamat email aktif" autoComplete="email" />
          </div>

          <div className="user-register-field-group">
            <label htmlFor="register-password">BUAT KATA SANDI</label>
            <div className="user-register-password-wrap">
              <input id="register-password" name="password" required minLength={8} type={showPassword ? 'text' : 'password'} placeholder="Minimal 8 karakter" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="user-register-field-group">
            <label htmlFor="register-confirm-password">KONFIRMASI KATA SANDI</label>
            <div className="user-register-password-wrap">
              <input id="register-confirm-password" name="confirm" required type={showConfirmPassword ? 'text' : 'password'} placeholder="Ulangi kata sandi" autoComplete="new-password" />
              <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}>
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && <p role="alert" style={{ color: "#ff7777" }}>{error}</p>}
          <button className="user-register-submit" type="submit" disabled={busy}>{busy ? "MEMPROSES..." : "BUAT AKUN & VERIFIKASI EMAIL"}</button>
        </form>

        <p className="user-register-login-copy">Sudah punya akun? <a href="#login">Masuk di sini</a></p>
      </section>

      <div className="user-register-divider" />
      <p className="user-register-copyright">© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</p>
    </main>
  );
}


function OtpPage() {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const email = sessionStorage.getItem('ridoooo_pending_signup_email') || '';
  const verify = async (e) => {
    e.preventDefault(); setError('');
    if (!email) { setError('Sesi pendaftaran tidak ditemukan. Silakan daftar kembali.'); return; }
    const token = otp.join('');
    if (!/^[0-9]{6}$/.test(token)) { setError('Masukkan kode OTP 6 digit.'); return; }
    setBusy(true);
    const { error: authError } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    setBusy(false);
    if (authError) { setError(authError.message); return; }
    sessionStorage.removeItem('ridoooo_pending_signup_email');
    window.location.hash = 'beranda-login';
  };

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const updateOtp = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtp((items) => items.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const resend = async () => {
    if (seconds > 0 || busy || !email) return;
    setBusy(true); setError('');
    const { error: authError } = await supabase.auth.resend({ type: 'signup', email });
    setBusy(false);
    if (authError) { setError(authError.message); return; }
    setSeconds(60);
    setOtp(Array(6).fill(''));
    requestAnimationFrame(() => document.getElementById('otp-0')?.focus());
  };

  return (
    <main className="user-otp-page">
      <header className="user-otp-header">
        <a className="user-otp-back" href="#daftar" aria-label="Kembali ke daftar akun"><ChevronLeft /></a>
        <div className="user-otp-heading">
          <strong>UKM ESPORTS</strong>
          <span>TEL-U PURWOKERTO</span>
        </div>
        <div className="user-otp-logo"><img src={logo} alt="Tel-U Esports" /></div>
      </header>

      <section className="user-otp-card">
        <div className="user-otp-lock"><img src={otpLockIcon} alt="" /></div>
        <h1>Verifikasi OTP</h1>
        <p className="user-otp-subtitle">Kode telah dikirim ke <strong>{email || "email pendaftaran"}</strong></p>

        <form className="user-otp-form" onSubmit={verify}>
          <div className="user-otp-inputs" aria-label="Masukkan kode OTP 6 digit">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength="1"
                value={digit}
                onChange={(e) => updateOtp(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button className="user-otp-resend" type="button" onClick={resend} disabled={seconds > 0}>
            Kirim ulang kode {seconds > 0 && <span>(00:{String(seconds).padStart(2, '0')})</span>}
          </button>

          {error && <p role="alert" style={{ color: "#ff7777" }}>{error}</p>}
          <button className="user-otp-submit" type="submit" disabled={busy}>{busy ? "Memproses..." : "Verifikasi"}</button>
        </form>
      </section>

      <div className="user-otp-divider" />
      <p className="user-otp-copyright">© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</p>
    </main>
  );
}

export default function App() {
  const parseRoute = () => {
    const raw = window.location.hash?.replace('#', '') || 'beranda';
    if (raw === 'login') return { page: 'login-form', section: 'login' };
    if (raw === 'daftar') return { page: 'register-form', section: 'daftar' };
    if (raw === 'verifikasi-otp') return { page: 'otp-form', section: 'otp' };
    if (raw === 'lupa-sandi') return { page: 'reset-password-form', section: 'reset-password' };
    if (raw === 'verifikasi-otp-reset') return { page: 'reset-otp-form', section: 'reset-otp' };
    if (raw === 'kata-sandi-baru') return { page: 'new-password-form', section: 'new-password' };
    if (raw === 'informasi-personal') return { page: 'personal-info-form', section: 'personal-info' };
    if (raw === 'unggah-dokumen') return { page: 'upload-documents-form', section: 'upload-documents' };
    if (raw === 'pendaftaran-berhasil') return { page: 'registration-success', section: 'registration-success' };
    if (raw === 'profil') return { page: 'user-profile', section: 'profile' };
    if (raw === 'beranda-login' || raw.startsWith('beranda-login/')) {
      const section = raw.split('/')[1] || 'beranda';
      return { page: 'login', section };
    }
    return { page: 'general', section: ['beranda', 'tentang', 'game', 'event'].includes(raw) ? raw : 'beranda' };
  };

  const [route, setRoute] = useState(parseRoute);
  const [applicationDraft, setApplicationDraft] = useState(null);
  const [preferredDivision, setPreferredDivision] = useState(null);
  const [lastApplication, setLastApplication] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [events, setEvents] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  const [homeContent, setHomeContent] = useState(() => ({
    hero: DEFAULT_HERO, stats: DEFAULT_STATS,
    advantages: DEFAULT_ADVANTAGES, games: DEFAULT_HOME_GAMES,
  }));
  useEffect(() => {
    let mounted = true;
    let catalogRequest = 0;
    const refresh = () => {
      fetchHomeContent().then((data) => {
        if (mounted) setHomeContent(data);
      }).catch(() => { /* Keep existing content when Supabase is unavailable. */ });
      const request = ++catalogRequest;
      fetchGameDivisions().then((data) => {
        if (mounted && request === catalogRequest) {
          setDivisions(data);
          setCatalogError('');
        }
      }).catch(() => {
        if (mounted && request === catalogRequest) {
          setDivisions([]);
          setCatalogError('Gagal memuat daftar game terbaru. Periksa koneksi lalu refresh halaman.');
        }
      });
      fetchPublicEvents().then((items) => {
        if (mounted) setEvents(items);
      }).catch(() => {
        if (mounted) setEvents([]);
      });
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('hashchange', refresh);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mounted = false;
      window.removeEventListener('focus', refresh);
      window.removeEventListener('hashchange', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user ?? null);
      setAuthReady(true);
    }).catch(() => setAuthReady(true));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (route.page !== 'registration-success' || !authUser?.id || lastApplication) return;
    let active = true;
    supabase.from('ridoooo_applications')
      .select('id,full_name,study_program,entry_year,division_code,game_nickname,created_at,status')
      .eq('user_id', authUser.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (active && !error && data) setLastApplication(data);
      });
    return () => { active = false; };
  }, [route.page, authUser?.id, lastApplication]);

  const protectedPages = ['login', 'personal-info-form', 'upload-documents-form', 'registration-success', 'user-profile'];
  useEffect(() => {
    if (authReady && !authUser && protectedPages.includes(route.page)) {
      window.location.hash = 'login';
    }
  }, [authReady, authUser, route.page]);
  const loggedIn = Boolean(authUser) && route.page === 'login';
  const activeSection = route.section;
  const navHref = (section) => loggedIn
    ? (section === 'beranda' ? '#beranda-login' : `#beranda-login/${section}`)
    : `#${section}`;

  const handleHomeLogoClick = (event) => {
    event.preventDefault();
    const homeHash = navHref('beranda');
    if (window.location.hash === homeHash) {
      // Klik logo tetap berfungsi meskipun URL sudah berada di Beranda.
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      // Hashchange memindahkan halaman ke Beranda dan scroll ke atas.
      window.location.hash = homeHash;
    }
  };

  useEffect(() => {
    const syncHash = () => {
      const nextRoute = parseRoute();
      setRoute(nextRoute);
      requestAnimationFrame(() => {
        const isHomePage = nextRoute.page === 'general' || nextRoute.page === 'login';

        // Every standalone page (auth, registration flow, profile, etc.)
        // must always open from the very top, including Back navigation.
        if (!isHomePage) {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          return;
        }

        // Home pages keep section navigation behavior.
        if (nextRoute.section === 'beranda') {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          return;
        }

        const mobile = window.innerWidth <= 700;
        const targetId = mobile
          ? ({ tentang: 'm-tentang', game: 'm-game', event: 'm-event' }[nextRoute.section])
          : nextRoute.section;
        if (targetId) document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };

    window.history.scrollRestoration = 'manual';
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  if (!authReady) return <main style={{ padding: '3rem', textAlign: 'center' }}>Memeriksa sesi...</main>;
  if (protectedPages.includes(route.page) && !authUser) return null;
  if (route.page === 'login-form' && authUser) {
    window.location.hash = 'beranda-login';
    return null;
  }
  if (route.page === 'login-form') return <LoginPage />;
  if (route.page === 'register-form') return <RegisterPage />;
  if (route.page === 'otp-form') return <OtpPage />;
  if (route.page === 'reset-password-form') return <ResetPasswordPage />;
  if (route.page === 'reset-otp-form') return <ResetOtpPage />;
  if (route.page === 'new-password-form') return <NewPasswordPage />;
  if (route.page === 'personal-info-form') return <PersonalInfoPage authUser={authUser} onDraft={setApplicationDraft} preferredDivision={preferredDivision} divisions={divisions} catalogError={catalogError} />;
  if (route.page === 'upload-documents-form') return <UploadDocumentsPage authUser={authUser} draft={applicationDraft} onSubmitted={setLastApplication} />;
  if (route.page === 'registration-success') return <RegistrationSuccessPage application={lastApplication} divisions={divisions} />;
  if (route.page === 'user-profile') return <UserProfilePage authUser={authUser} onReapply={setPreferredDivision} divisions={divisions} />;

  const desktopGames = [
    { dbCode: 'MLBB', code: 'MOBILE LEGENDS', className: 'desktop-game-banner--mlbb', mark: 'MOBILE LEGENDS', icon: gameMlbbIcon },
    { dbCode: 'PUBG', code: 'PUBG MOBILE', className: 'desktop-game-banner--pubg', mark: 'PUBG MOBILE', icon: gamePubgIcon },
    { dbCode: 'VLRN', code: 'VALORANT', className: 'desktop-game-banner--valorant', mark: 'VALORANT', icon: gameValorantIcon },
    { dbCode: 'EFB', code: 'E-FOOTBALL', className: 'desktop-game-banner--efootball', mark: 'eFOOTBALL', icon: gameEfootballIcon },
  ];

  const visibleDesktopGames = homeVisibleDivisions(divisions, homeContent.games).map((division) => {
    const known = desktopGames.find((item) => item.dbCode === division.short);
    return {
      ...known,
      id: division.code,
      code: known && division.name === DEFAULT_GAME_DIVISIONS.find((row) => row.code === division.code)?.name
        ? known.code : division.name.toUpperCase(),
      mark: known && division.name === DEFAULT_GAME_DIVISIONS.find((row) => row.code === division.code)?.name
        ? known.mark : division.name,
      icon: division.logo_url || known?.icon || null,
      customLogo: Boolean(division.logo_url),
      banner_url: division.banner_url || null,
      is_active: division.is_active,
      className: known?.className || '',
    };
  });

  return (
    <>
      <MobileHome loggedIn={loggedIn} navHref={navHref} onHomeLogoClick={handleHomeLogoClick} homeContent={homeContent} divisions={divisions} events={events} />
      <main className="site-shell desktop-site-shell">
        <header className="topbar">
          <a className="brand" href={navHref('beranda')} onClick={handleHomeLogoClick} aria-label="Kembali ke atas Beranda Tel-U Esports Purwokerto">
            <img src={logo} alt="" />
            <div>
              <strong>TEL-U ESPORTS</strong>
              <span>PURWOKERTO</span>
            </div>
          </a>

          <nav className="main-nav" aria-label="Navigasi utama">
            <a className={activeSection === 'beranda' ? 'is-active' : ''} href={navHref('beranda')}>Beranda</a>
            <a className={activeSection === 'tentang' ? 'is-active' : ''} href={navHref('tentang')}>Tentang Kami</a>
            <a className={activeSection === 'game' ? 'is-active' : ''} href={navHref('game')}>Kategori Game</a>
            <a className={activeSection === 'event' ? 'is-active' : ''} href={navHref('event')}>Event</a>
          </nav>

          {loggedIn ? (
            <a className="desktop-account-button" href="#profil" aria-label="Akun pengguna"><img src={userIcon} alt="" /></a>
          ) : (
            <div className="top-actions">
              <button className="button button--ghost" type="button" onClick={() => { window.location.hash = 'login'; }}>Masuk</button>
              <a className="button button--primary" href="#daftar">Daftar</a>
            </div>
          )}
        </header>

        {homeContent.hero.visible !== false && <section className="hero desktop-reference-hero" id="beranda" style={homeContent.hero.banner_url ? { backgroundImage: 'linear-gradient(rgba(7,13,24,.66),rgba(7,13,24,.83)), url(' + JSON.stringify(homeContent.hero.banner_url) + ')' } : undefined}>
          <div className="hero__glow hero__glow--one" />
          <div className="hero__grid" />
          <div className="hero__content">
            <span className="eyebrow"><i /> {homeContent.hero.badge}</span>
            <h1>{homeContent.hero.title === DEFAULT_HERO.title ? <>Bergabunglah dengan Komunitas <em>Esports</em> Universitas Telkom Purwokerto</> : homeContent.hero.title}</h1>
            <p>{homeContent.hero.description}</p>
            <div className="hero__actions">
              <a className="button button--primary button--large" href={loggedIn ? "#informasi-personal" : "#daftar"}>{loggedIn ? 'JOIN KOMUNITAS' : homeContent.hero.cta}</a>
            </div>
          </div>
        </section>}

        {homeContent.stats.visible !== false && <section className="stats" aria-label="Statistik komunitas">
          <article><strong>{homeContent.stats.students}</strong><span>MAHASISWA</span></article>
          <article><strong>{homeContent.stats.divisions}</strong><span>DIVISI GAME</span></article>
          <article><strong>{homeContent.stats.champions}</strong><span>JUARA NASIONAL</span></article>
        </section>}

        <section className="section advantages desktop-reference-why" id="tentang">
          <div className="section-heading section-heading--center">
            <h2>KENAPA DAFTAR DI SINI?</h2>
            <i className="desktop-title-line" />
          </div>
          <div className="advantage-grid">
            {homeContent.advantages.filter((item) => item.active !== false).map((item, index) => {
              const icon = advantageImageById[item.iconId] || advantageDocumentIcon;
              const variant = item.iconId === 'progress' ? ' feature-icon--cyan' : item.iconId === 'certificate' ? ' feature-icon--gold' : '';
              return (
                <article key={item.id || index}>
                  <div className={'feature-icon' + variant}><img src={icon} alt="" /></div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section games-section desktop-reference-games" id="game">
          <div className="section-heading">
            <h2>PILIH ARENA KAMU</h2>
            <p>Eksplorasi kategori game resmi UKM dan temukan posisi terbaik sesuai peran dan spesialisasi bermainmu.</p>
          </div>
          <div className="desktop-game-grid">
            {visibleDesktopGames.map((game) => (
              <article className="desktop-game-card" key={game.id}>
                <div className={`desktop-game-banner ${game.className}`} style={game.banner_url ? { backgroundImage: 'url(' + JSON.stringify(game.banner_url) + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} aria-label={'Banner ' + game.code} />
                <div className="desktop-game-body">
                  <div className="desktop-game-name"><span className={'desktop-game-dot' + (game.customLogo ? ' desktop-game-dot--custom' : '')}>{game.icon ? <img src={game.icon} alt="" /> : game.code.slice(0, 2)}</span>{game.code}</div>
                  {game.is_active ? <a className="desktop-join-squad" href={loggedIn ? "#informasi-personal" : "#daftar"}>JOIN SQUAD <ChevronRight size={14} /></a> : <span className="desktop-join-squad">DITUTUP</span>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section desktop-event-list" id="event">
          {events.map((event) => (
            <article className="desktop-event-card" key={event.id}
              style={event.banner_url ? { backgroundImage: 'linear-gradient(115deg,rgba(17,20,33,.95),rgba(17,20,33,.76)),url(' + JSON.stringify(event.banner_url) + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              {event.category?.trim() || event.end_date || event.start_date ? (
                <div className="desktop-event-top">
                  {event.category?.trim() ? <span>{event.category}</span> : null}
                  {event.end_date || event.start_date ? <time>{formatEventDate(event.end_date || event.start_date, { month: 'short' })}</time> : null}
                </div>
              ) : null}
              <h3>{event.name}</h3>
              {event.description?.trim() ? <p>{event.description}</p> : null}
              {event.benefit?.trim() ? <div className="desktop-event-benefit"><strong>Benefit:</strong> {event.benefit}</div> : null}
              {event.slots != null || event.prize_pool?.trim() || event.regulation_url ? (
                <div className="desktop-event-bottom">
                  {event.slots != null || event.prize_pool?.trim()
                    ? <strong>{[event.slots != null ? event.slots + ' Slot' : '', event.prize_pool?.trim()].filter(Boolean).join(' · ')}</strong>
                    : null}
                  {event.regulation_url ? <a href={event.regulation_url} target="_blank" rel="noopener noreferrer">Lihat Jadwal & Regulasi <ChevronRight size={13} /></a> : null}
                </div>
              ) : null}
            </article>
          ))}
          {!events.length ? <p className="desktop-event-empty">Belum ada event yang dipublikasikan.</p> : null}
        </section>

        <footer className="desktop-reference-footer">
          <div className="desktop-footer-main">
            <div>
              <div className="desktop-footer-brand"><img src={logo} alt="" /><strong>TELKOM ESPORTS</strong></div>
              <p>Unit Kegiatan Mahasiswa Esports Universitas Telkom Purwokerto. Mewadahi minat dan bakat mahasiswa dalam bidang gim dan esports kompetitif di lingkungan kampus.</p>
              <div className="desktop-socials"><span><img src={discordIcon} alt="Discord" /></span><span><img src={instagramIcon} alt="Instagram" /></span><span><img src={youtubeIcon} alt="YouTube" /></span></div>
            </div>
            <div className="desktop-footer-links">
              <div><strong>MENU</strong><a href={navHref('beranda')}>Beranda</a><a href={navHref('tentang')}>Tentang Kami</a><a href={navHref('game')}>Kategori Game</a><a href={navHref('event')}>Event</a></div>
              <div><strong>RESOURCES</strong><a href="#beranda">Cara Daftar</a><a href="#beranda">Peraturan UKM</a><a href="#beranda">FAQ Seleksi</a><a href="#beranda">Privacy Policy</a></div>
            </div>
          </div>
          <small>© 2026 UKM Esports Universitas Telkom Purwokerto. Hak cipta dilindungi.</small>
        </footer>
      </main>
    </>
  );
}
