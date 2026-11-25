import DOMPurify from 'dompurify';

/**
 * Sanitasi teks bebas (SOAP, catatan, dsb).
 * Semua tag HTML dibuang, hanya teks yang tersisa -> mencegah XSS / DOM injection.
 */
export function sanitizeText(value) {
  if (value === null || value === undefined) return '';
  const clean = DOMPurify.sanitize(String(value), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
  // DOMPurify mengembalikan entitas HTML (&amp; dsb) -> ubah kembali ke teks biasa
  const el = document.createElement('textarea');
  el.innerHTML = clean;
  return el.value.trim();
}

/** Sanitasi seluruh nilai string pada sebuah objek (rekursif, tanpa mutasi). */
export function sanitizeObject(obj) {
  if (typeof obj === 'string') return sanitizeText(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitizeObject(v)])
    );
  }
  return obj;
}
