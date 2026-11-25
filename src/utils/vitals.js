// Definisi tanda vital. Rentang normal mengikuti desain Figma (dewasa).
// `valid` = batas masuk akal secara fisiologis; di luar itu dianggap salah ketik.
export const VITALS = [
  { key: 'sys', label: 'Sistolik', unit: 'mmHg', normal: [90, 120], valid: [40, 300] },
  { key: 'dia', label: 'Diastolik', unit: 'mmHg', normal: [60, 80], valid: [20, 200] },
  { key: 'hr', label: 'Denyut nadi', unit: 'x/menit', normal: [60, 100], valid: [20, 250] },
  { key: 'rr', label: 'Laju napas', unit: 'x/menit', normal: [12, 20], valid: [4, 80] },
  { key: 'temp', label: 'Suhu', unit: '°C', normal: [36.1, 37.2], valid: [30, 45] },
  { key: 'spo2', label: 'SpO2', unit: '%', normal: [95, 100], valid: [50, 100] },
];

export const EMPTY_VITALS = Object.fromEntries(VITALS.map((v) => [v.key, '']));

/** '' -> null, '36,7' -> 36.7, 'abc' -> NaN */
export function parseNumber(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

const fmt = (n) => String(n).replace('.', ',');
export const formatRange = ([lo, hi]) => `${fmt(lo)}–${fmt(hi)}`;

/**
 * level: empty | required | invalid | normal | review
 * `submitted` = pengguna sudah menekan simpan (baru saat itu kosong dianggap error).
 */
export function evaluateVital(def, raw, submitted = false) {
  const n = parseNumber(raw);
  if (n === null) {
    return submitted
      ? { level: 'required', text: 'Wajib diisi' }
      : { level: 'empty', text: 'Belum dinilai' };
  }
  if (Number.isNaN(n) || n < def.valid[0] || n > def.valid[1]) {
    return { level: 'invalid', text: `Nilai tidak valid (${formatRange(def.valid)})` };
  }
  const [lo, hi] = def.normal;
  return n >= lo && n <= hi
    ? { level: 'normal', text: 'Normal' }
    : { level: 'review', text: 'Perlu tinjauan' };
}

export const isBlocking = (level) => level === 'required' || level === 'invalid';
