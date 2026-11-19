import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Hanya dipakai di halaman admin yang sudah melewati pemeriksaan akses.
// URL bertanda tangan berlaku sementara; bucket Supabase tetap privat.
export default function PrivateDocumentPreview({ path, label }) {
  const [preview, setPreview] = useState({ url: '', state: 'loading' });

  useEffect(() => {
    let active = true;
    if (!path) {
      setPreview({ url: '', state: 'missing' });
      return () => { active = false; };
    }
    setPreview({ url: '', state: 'loading' });
    supabase.storage
      .from('ridoooo-application-documents')
      .createSignedUrl(path, 300)
      .then(({ data, error }) => {
        if (!active) return;
        setPreview(error || !data?.signedUrl
          ? { url: '', state: 'error' }
          : { url: data.signedUrl, state: 'ready' });
      })
      .catch(() => {
        if (active) setPreview({ url: '', state: 'error' });
      });

    return () => { active = false; };
  }, [path]);

  if (preview.state !== 'ready') {
    const message = {
      loading: 'Memuat pratinjau dokumen...',
      missing: 'Berkas belum tersedia.',
      error: 'Pratinjau tidak tersedia. Gunakan tombol Lihat Penuh.'
    }[preview.state];
    return <span className="private-document-preview__message">{message}</span>;
  }

  if (/\.pdf$/i.test(path)) {
    return <iframe
      className="private-document-preview__file"
      title={'Pratinjau ' + label}
      src={preview.url + '#toolbar=0&navpanes=0'}
      referrerPolicy="no-referrer"
    />;
  }

  return <img
    className="private-document-preview__file"
    src={preview.url}
    alt={'Pratinjau ' + label}
    referrerPolicy="no-referrer"
    onError={() => setPreview({ url: '', state: 'error' })}
  />;
}
