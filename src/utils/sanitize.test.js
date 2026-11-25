import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeObject } from './sanitize';

describe('sanitizeText', () => {
  it('menghapus tag script', () => {
    expect(sanitizeText('Nyeri dada<script>alert(1)</script>')).toBe('Nyeri dada');
  });
  it('menghapus event handler pada tag', () => {
    expect(sanitizeText('<img src=x onerror=alert(1)>Batuk')).toBe('Batuk');
  });
  it('menghapus tag tapi menjaga isi teks', () => {
    expect(sanitizeText('<b>Demam</b> 3 hari')).toBe('Demam 3 hari');
  });
  it('menjaga tanda < > yang bukan HTML (mis. nilai klinis)', () => {
    expect(sanitizeText('TD > 140/90 & nadi < 60')).toBe('TD > 140/90 & nadi < 60');
  });
  it('menangani null/undefined', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });
});

describe('sanitizeObject', () => {
  it('membersihkan string bersarang tanpa mengubah angka', () => {
    const out = sanitizeObject({ a: '<i>x</i>', n: 5, arr: ['<script>1</script>y'] });
    expect(out).toEqual({ a: 'x', n: 5, arr: ['y'] });
  });
});
