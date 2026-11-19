import { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function AdminConfirmDialog({
  open, tone = 'success', title, description, detail, confirmLabel,
  busy = false, onCancel, onConfirm,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel?.();
      if (event.key !== 'Tab') return;
      const dialog = cancelRef.current?.closest('[role="dialog"]');
      const controls = [...(dialog?.querySelectorAll('button:not([disabled])') || [])];
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  const danger = tone === 'danger';
  return (
    <div className="admin-confirm-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel?.();
    }}>
      <section className={'admin-confirm-dialog' + (danger ? ' admin-confirm-dialog--danger' : '')}
        role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-description">
        <div className="admin-confirm-top">
          <span className="admin-confirm-icon" aria-hidden="true">
            {danger ? <AlertTriangle size={25} /> : <CheckCircle2 size={25} />}
          </span>
          <button type="button" className="admin-confirm-close" aria-label="Tutup konfirmasi"
            disabled={busy} onClick={onCancel}><X size={19} /></button>
        </div>
        <h2 id="admin-confirm-title">{title}</h2>
        <p id="admin-confirm-description">{description}</p>
        {detail && <div className="admin-confirm-detail">{detail}</div>}
        <div className="admin-confirm-actions">
          <button type="button" className="admin-confirm-cancel" ref={cancelRef}
            disabled={busy} onClick={onCancel}>Batal</button>
          <button type="button" className="admin-confirm-submit"
            disabled={busy} onClick={onConfirm}>
            {busy ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
