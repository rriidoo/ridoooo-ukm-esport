import { useEffect, useRef, useState } from 'react';
import { supabase } from './lib/supabase';
import { toApplicant } from './lib/applications';
import { fetchGameDivisions } from './lib/gameDivisions';
import AdminLogin from './pages/AdminLogin';
import ResetSandi from './pages/ResetSandi';
import KodeOtp from './pages/KodeOtp';
import SandiBaru from './pages/SandiBaru';
import Beranda from './pages/Beranda';
import Pendaftar from './pages/Pendaftar';
import Anggota from './pages/Anggota';
import DetailPendaftar from './pages/DetailPendaftar';
import DetailAnggota from './pages/DetailAnggota';
import KontenBeranda from './pages/KontenBeranda';
import EditKontenBerandaKeunggulan from './pages/EditKontenBerandaKeunggulan';
import KontenGameDivisi from './pages/KontenGameDivisi';
import KontenEvent from './pages/KontenEvent';
import ExportData from './pages/ExportData';

const routes = new Set(['/', '/reset-sandi', '/kode-otp', '/sandi-baru', '/beranda', '/pendaftar', '/detail-pendaftar', '/anggota', '/detail-anggota', '/konten-beranda', '/edit-konten-beranda-keunggulan', '/konten-game-divisi', '/konten-event', '/export-data']);

function normalizePath(pathname) {
  return routes.has(pathname) ? pathname : '/';
}

export default function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const [resetEmail, setResetEmail] = useState('');
  const [recoveryVerified, setRecoveryVerified] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsError, setApplicationsError] = useState('');
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsRefreshedAt, setApplicationsRefreshedAt] = useState(null);
  const applicationRequestRef = useRef(0);
  const refreshApplications = async () => {
    const requestId = ++applicationRequestRef.current;
    setApplicationsLoading(true);
    try {
      const divisionsPromise = fetchGameDivisions({ includeDeleted: true }).catch(() => []);
      const rows = [];
      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await supabase.from('ridoooo_applications')
          .select('*')
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(offset, offset + pageSize - 1);
        if (requestId !== applicationRequestRef.current) return;
        if (error) throw error;
        rows.push(...(data || []));
        if (!data || data.length < pageSize) break;
      }
      const divisions = await divisionsPromise;
      if (requestId !== applicationRequestRef.current) return;
      const currentDivisionNames = Object.fromEntries(divisions.map(({ code, name }) => [code, name]));
      setApplications(rows.map((row) => toApplicant(row, currentDivisionNames)));
      setApplicationsError('');
      setApplicationsRefreshedAt(new Date());
    } catch (error) {
      if (requestId !== applicationRequestRef.current) return;
      setApplicationsError('Gagal memuat data pendaftaran: ' + (error?.message || 'Periksa koneksi Supabase.'));
    } finally {
      if (requestId === applicationRequestRef.current) setApplicationsLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!active) return;
      setUser(currentUser);
      if (currentUser) {
        const { data, error } = await supabase.from('ridoooo_admin_users')
          .select('user_id').eq('user_id', currentUser.id).maybeSingle();
        if (!active) return;
        const authorized = !error && Boolean(data);
        setIsAdmin(authorized);
        if (error) setAuthError('Gagal memeriksa hak akses Admin.');
        if (!authorized) {
          applicationRequestRef.current += 1;
          setApplications([]);
          setApplicationsError('');
          setApplicationsRefreshedAt(null);
        }
      } else {
        applicationRequestRef.current += 1;
        setApplications([]);
        setApplicationsError('');
        setApplicationsRefreshedAt(null);
        setIsAdmin(false);
      }
      setReady(true);
    };
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') check();
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!isAdmin) return;
    refreshApplications();
  }, [isAdmin, path]);

  useEffect(() => {
    if (!isAdmin || path !== '/beranda') return;
    let lastTrigger = 0;
    const reload = () => {
      if (document.hidden || Date.now() - lastTrigger < 1000) return;
      lastTrigger = Date.now();
      refreshApplications();
    };
    window.addEventListener('focus', reload);
    const onVisibility = () => { if (!document.hidden) reload(); };
    document.addEventListener('visibilitychange', onVisibility);
    const interval = window.setInterval(reload, 60000);
    return () => {
      window.removeEventListener('focus', reload);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(interval);
    };
  }, [isAdmin, path]);
  const logout = async () => {
    applicationRequestRef.current += 1;
    await supabase.auth.signOut();
    setApplications([]);
    setApplicationsError('');
    setApplicationsRefreshedAt(null);
    setApplicationsLoading(true);
    setIsAdmin(false);
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    function handlePopState() {
      setPath(normalizePath(window.location.pathname));
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextPath) {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setPath(nextPath);
  }

  async function handleResetEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
    if (error) throw new Error('Gagal mengirim kode pemulihan: ' + error.message);
    setResetEmail(normalizedEmail);
    setRecoveryVerified(false);
    navigate('/kode-otp');
  }

  async function handleResendResetOtp() {
    if (!resetEmail) throw new Error('Email pemulihan tidak ditemukan. Ulangi dari halaman Lupa Password.');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    if (error) throw new Error('Gagal mengirim ulang kode: ' + error.message);
  }

  async function handleOtpVerified(token) {
    if (!resetEmail) throw new Error('Email pemulihan tidak ditemukan. Ulangi dari halaman Lupa Password.');
    const { data, error } = await supabase.auth.verifyOtp({
      email: resetEmail, token, type: 'recovery',
    });
    if (error) throw new Error('Kode OTP tidak valid atau sudah kedaluwarsa. ' + error.message);
    if (!data?.user || !data?.session) throw new Error('Verifikasi belum berhasil. Silakan coba kembali.');

    const { data: membership, error: roleError } = await supabase
      .from('ridoooo_admin_users').select('user_id')
      .eq('user_id', data.user.id).maybeSingle();
    if (roleError || !membership) {
      await supabase.auth.signOut();
      throw new Error('Email ini tidak mempunyai hak akses Admin UKM Esports.');
    }
    setRecoveryVerified(true);
    navigate('/sandi-baru');
  }

  async function handleRecoveryCancel() {
    setRecoveryVerified(false);
    setResetEmail('');
    await logout();
  }

  async function handlePasswordUpdated(password) {
    if (!recoveryVerified || !resetEmail) {
      throw new Error('Verifikasi OTP belum dilakukan. Ulangi proses pemulihan.');
    }
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    if (userError || currentUser?.email?.toLowerCase() !== resetEmail) {
      throw new Error('Sesi pemulihan tidak cocok. Ulangi proses pemulihan.');
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error('Gagal memperbarui kata sandi: ' + error.message);
    setRecoveryVerified(false);
    setResetEmail('');
    await logout();
  }

  async function handleLogin({ email, password }) {
    setAuthError(''); setLoginBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password
    });
    if (error) { setAuthError(error.message); setLoginBusy(false); return; }
    const { data: membership, error: roleError } = await supabase
      .from('ridoooo_admin_users').select('user_id')
      .eq('user_id', data.user.id).maybeSingle();
    if (roleError || !membership) {
      await supabase.auth.signOut();
      setAuthError('Akun ini tidak memiliki hak akses Admin UKM Esports.');
      setLoginBusy(false);
      return;
    }
    setUser(data.user);
    setIsAdmin(true);
    setLoginBusy(false);
    navigate('/beranda');
  }

  if (!ready) return <main style={{ padding: 40 }}>Memeriksa akses Admin...</main>;
  const publicPaths = ['/', '/reset-sandi', '/kode-otp', '/sandi-baru'];
  if (!isAdmin && !publicPaths.includes(path)) {
    window.history.replaceState({}, '', '/');
    if (path !== '/') setPath('/');
    return <main style={{ padding: 40 }}>Halaman khusus Admin. Silakan login.</main>;
  }
  if (isAdmin && path === '/') {
    window.history.replaceState({}, '', '/beranda');
    setPath('/beranda');
    return null;
  }
  if (path === '/reset-sandi') {
    return (
      <ResetSandi
        initialEmail={resetEmail}
        onSubmitEmail={handleResetEmail}
        onBack={() => navigate('/')}
      />
    );
  }

  if (path === '/kode-otp') {
    if (!resetEmail) {
      window.history.replaceState({}, '', '/reset-sandi');
      setPath('/reset-sandi');
      return null;
    }
    return (
      <KodeOtp
        email={resetEmail}
        onVerified={handleOtpVerified}
        onResend={handleResendResetOtp}
        onBack={() => navigate('/reset-sandi')}
      />
    );
  }

  if (path === '/sandi-baru') {
    if (!recoveryVerified) {
      window.history.replaceState({}, '', '/reset-sandi');
      setPath('/reset-sandi');
      return null;
    }
    return (
      <SandiBaru
        onUpdated={handlePasswordUpdated}
        onBack={handleRecoveryCancel}
      />
    );
  }

  if (path === '/export-data') {
    return <ExportData
      adminUser={user}
      members={applications.filter(a => a.statusCode === 'accepted')}
      loadError={applicationsError}
      loading={applicationsLoading}
      dataLoaded={Boolean(applicationsRefreshedAt)}
      onRetry={refreshApplications}
      onLogout={logout}
      onNavigate={navigate}
    />;
  }

  if (path === '/konten-event') {
    return <KontenEvent adminUser={user} onLogout={logout} onNavigate={navigate} />;
  }

  if (path === '/konten-game-divisi') {
    return <KontenGameDivisi adminUser={user} onLogout={logout} onNavigate={navigate} />;
  }

  if (path === '/edit-konten-beranda-keunggulan') {
    return <EditKontenBerandaKeunggulan adminUser={user} onLogout={logout} onNavigate={navigate} />;
  }

  if (path === '/konten-beranda') {
    return <KontenBeranda adminUser={user} onLogout={logout} onNavigate={navigate} />;
  }

  if (path === '/detail-anggota') {
    return (
      <DetailAnggota
        adminUser={user}
        member={selectedMember}
        onRemoved={refreshApplications}
        onBack={() => navigate('/anggota')}
        onLogout={logout}
        onNavigate={navigate}
      />
    );
  }

  if (path === '/anggota') {
    return (
      <Anggota
        adminUser={user}
        members={applications.filter(a => a.status === 'Diterima')}
        onLogout={logout}
        onNavigate={navigate}
        onDetail={(member) => {
          setSelectedMember(member);
          navigate('/detail-anggota');
        }}
      />
    );
  }

  if (path === '/detail-pendaftar') {
    return (
      <DetailPendaftar
        adminUser={user}
        applicant={selectedApplicant}
        onBack={() => navigate('/pendaftar')}
        onLogout={logout}
        onNavigate={navigate}
        onReviewed={refreshApplications}
      />
    );
  }

  if (path === '/pendaftar') {
    return (
      <Pendaftar
        adminUser={user}
        applicants={applications.filter(a => a.statusCode !== 'removed')}
        loadError={applicationsError}
        onLogout={logout}
        onNavigate={navigate}
        onDetail={(applicant) => {
          setSelectedApplicant(applicant);
          navigate('/detail-pendaftar');
        }}
      />
    );
  }

  if (path === '/beranda') {
    return <Beranda
      adminUser={user}
      applicants={applications.filter(a => a.statusCode !== 'removed')}
      loadError={applicationsError}
      loading={applicationsLoading}
      refreshedAt={applicationsRefreshedAt}
      onRefresh={refreshApplications}
      onLogout={logout}
      onNavigate={navigate}
      onDetail={(applicant) => { setSelectedApplicant(applicant); navigate('/detail-pendaftar'); }}
    />;
  }

  return (
    <AdminLogin
      onForgotPassword={() => navigate('/reset-sandi')}
      onLogin={handleLogin}
      authError={authError}
      loginBusy={loginBusy}
    />
  );
}
