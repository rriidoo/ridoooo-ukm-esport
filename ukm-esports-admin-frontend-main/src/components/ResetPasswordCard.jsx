import { useState } from 'react';
import emailIcon from '../assets/icon-email.svg';
import backIcon from '../assets/icon-back.svg';

export default function ResetPasswordCard({ onBack, onSubmitEmail, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await onSubmitEmail?.(email.trim());
    } catch (err) {
      setError(err.message || 'Tidak dapat mengirim email pemulihan. Silakan coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={error ? 'reset-card reset-card--error' : 'reset-card'} aria-labelledby="reset-title">
      <div className="reset-card__heading">
        <h2 id="reset-title">Lupa Password Admin</h2>
        <p>
          Masukkan email Admin yang terdaftar untuk menerima
          <br />
          kode OTP pemulihan kata sandi (6 digit).
        </p>
      </div>

      <form className="reset-form" onSubmit={handleSubmit}>
        <div className="reset-field">
          <label htmlFor="reset-email">EMAIL ADMIN</label>
          <div className="reset-input-shell">
            <img className="reset-input-icon" src={emailIcon} alt="" aria-hidden="true" />
            <input
              id="reset-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@telkom-pwt.ac.id"
              autoComplete="email"
              required
            />
          </div>
        </div>

        {error && <p role="alert" style={{ color: '#ff7777', marginTop: 12 }}>{error}</p>}
        <button className="reset-submit" type="submit" disabled={busy}>
          {busy ? 'Mengirim kode...' : 'Kirim Kode OTP'}
        </button>

        <button className="reset-back" type="button" onClick={onBack} disabled={busy}>
          <img src={backIcon} alt="" aria-hidden="true" />
          <span>Kembali ke Login Admin</span>
        </button>
      </form>
    </section>
  );
}
