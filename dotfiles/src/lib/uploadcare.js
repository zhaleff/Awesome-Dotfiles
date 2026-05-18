const PUBLIC_KEY = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY;
const CDN_BASE = import.meta.env.VITE_UPLOADCARE_CDN_BASE;

function buildUrl(uuid, transformations = '-/preview/1000x1000/-/quality/smart/-/format/auto/') {
  const base = CDN_BASE
    ? CDN_BASE.replace(/\/$/, '')
    : 'https://ucarecdn.com';
  return `${base}/${uuid}/${transformations}`;
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('UPLOADCARE_PUB_KEY', PUBLIC_KEY);
  formData.append('UPLOADCARE_STORE', '1');
  formData.append('file', file);

  const res = await fetch('https://upload.uploadcare.com/base/', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Upload failed');
  }

  const data = await res.json();
  const uuid = data.file;

  if (!uuid) throw new Error('Uploadcare no devolvió un UUID válido');

  return buildUrl(uuid);
}

function extractUuid(url) {
  const match = url.match(
    /(?:ucarecdn\.com|ucarecd\.net)\/([0-9a-f-]{36})/i
  );
  return match ? match[1] : null;
}

export function getOptimizedUrl(url, transformations) {
  if (!url) return '';

  if (url.includes('cloudinary.com')) return url;

  if (url.includes('ucarecdn.com') || url.includes('ucarecd.net')) {
    const uuid = extractUuid(url);
    if (!uuid) return url;
    return buildUrl(uuid, transformations);
  }

  return url;
}
