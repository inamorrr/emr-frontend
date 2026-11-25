import { describe, it, expect } from 'vitest';
import { VITALS, evaluateVital, parseNumber, formatRange } from './vitals';

const sys = VITALS.find((v) => v.key === 'sys');
const temp = VITALS.find((v) => v.key === 'temp');

describe('parseNumber', () => {
  it('menerima koma desimal', () => expect(parseNumber('36,7')).toBe(36.7));
  it('kosong -> null', () => expect(parseNumber('')).toBeNull());
  it('bukan angka -> NaN', () => expect(parseNumber('abc')).toBeNaN());
});

describe('evaluateVital', () => {
  it('kosong sebelum simpan = Belum dinilai', () =>
    expect(evaluateVital(sys, '', false).level).toBe('empty'));
  it('kosong setelah simpan = Wajib diisi', () =>
    expect(evaluateVital(sys, '', true)).toEqual({ level: 'required', text: 'Wajib diisi' }));
  it('dalam rentang normal', () => expect(evaluateVital(sys, '110').level).toBe('normal'));
  it('batas atas & bawah termasuk normal', () => {
    expect(evaluateVital(sys, '90').level).toBe('normal');
    expect(evaluateVital(sys, '120').level).toBe('normal');
  });
  it('di luar normal tapi masuk akal = Perlu tinjauan', () => {
    expect(evaluateVital(sys, '165').level).toBe('review');
    expect(evaluateVital(sys, '80').level).toBe('review');
  });
  it('mustahil secara fisiologis = tidak valid', () => {
    expect(evaluateVital(sys, '900').level).toBe('invalid');
    expect(evaluateVital(temp, '3').level).toBe('invalid');
  });
  it('suhu desimal dengan koma', () => expect(evaluateVital(temp, '36,7').level).toBe('normal'));
});

describe('formatRange', () => {
  it('memakai koma desimal', () => expect(formatRange(temp.normal)).toBe('36,1–37,2'));
});
