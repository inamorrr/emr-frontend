const TZ = 'Asia/Jakarta';

/** '1985-04-12' -> '12 Apr 1985' (tanpa pergeseran zona waktu) */
export function formatDate(iso) {
  if (!iso) return null;
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** ISO timestamp -> '24 Nov 2026 · 08.15 WIB' */
export function formatDateTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: TZ,
  });
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
  return `${date} · ${time} WIB`;
}

export const sexLabel = (s) => (s === 'L' ? 'Laki-laki' : s === 'P' ? 'Perempuan' : '');
