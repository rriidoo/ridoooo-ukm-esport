// Validate file content, not only the browser-supplied filename/MIME type.
// The Storage bucket independently enforces a 2 MiB limit and allowed MIME types.
const MAX_BYTES = 2 * 1024 * 1024;
const RULES = {
  'image/jpeg': { extensions: ['jpg', 'jpeg'], signature: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { extensions: ['png'], signature: (b) => [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v) },
  'application/pdf': { extensions: ['pdf'], signature: (b) => [37, 80, 68, 70, 45].every((v, i) => b[i] === v) },
};

export async function validateDocumentFile(file, { isInstagram = false } = {}) {
  const label = isInstagram ? 'Bukti Instagram' : 'KTM';
  if (!file || typeof file.size !== 'number') return label + ' belum dipilih.';
  if (file.size === 0) return label + ' tidak boleh berupa file kosong.';
  if (file.size > MAX_BYTES) return label + ' maksimal 2 MB.';
  const rule = RULES[file.type];
  const ext = (file.name || '').split('.').pop().toLowerCase();
  if (!rule || (isInstagram && file.type === 'application/pdf') || !rule.extensions.includes(ext)) {
    return label + (isInstagram ? ' hanya menerima JPG/PNG.' : ' hanya menerima JPG/PNG/PDF.');
  }
  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (!rule.signature(bytes)) return label + ' tidak sesuai format atau berkas rusak.';
  } catch {
    return label + ' gagal dibaca. Silakan pilih berkas lain.';
  }
  return null;
}
