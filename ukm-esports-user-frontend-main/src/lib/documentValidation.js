// Read file signatures instead of trusting MIME metadata from mobile file pickers.
const MAX_BYTES = 2 * 1024 * 1024;
const SIGNATURES = [
  {
    mime: 'image/jpeg',
    extension: 'jpg',
    matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: 'image/png',
    extension: 'png',
    matches: (b) => [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v),
  },
  {
    mime: 'application/pdf',
    extension: 'pdf',
    matches: (b) => [37, 80, 68, 70, 45].every((v, i) => b[i] === v),
  },
];

export async function prepareDocumentFile(file, { isInstagram = false } = {}) {
  const label = isInstagram ? 'Bukti Instagram' : 'KTM';
  if (!file || typeof file.size !== 'number') return { error: label + ' belum dipilih.' };
  if (file.size === 0) return { error: label + ' tidak boleh berupa file kosong.' };
  if (file.size > MAX_BYTES) return { error: label + ' maksimal 2 MB.' };

  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const detected = SIGNATURES.find((rule) => rule.matches(bytes));
    if (!detected || (isInstagram && detected.mime === 'application/pdf')) {
      return {
        error: label + (isInstagram
          ? ' hanya menerima gambar JPG/PNG yang valid. Jika dari iPhone (HEIC), ubah ke JPG dulu.'
          : ' hanya menerima JPG/PNG/PDF yang valid. Jika dari iPhone (HEIC), ubah ke JPG dulu.'),
      };
    }

    // Mobile galleries sometimes omit MIME type or supply generic/renamed filenames.
    // Normalize both before uploading so Supabase validates the actual file format.
    const baseName = (file.name || label).replace(/\.[^.]+$/, '') || label;
    const normalizedFile = new File([file], baseName + '.' + detected.extension, {
      type: detected.mime,
      lastModified: file.lastModified || Date.now(),
    });
    return { file: normalizedFile };
  } catch {
    return { error: label + ' gagal dibaca. Coba pilih dari File Manager atau gunakan JPG/PNG.' };
  }
}

export async function validateDocumentFile(file, options = {}) {
  const result = await prepareDocumentFile(file, options);
  return result.error || null;
}
