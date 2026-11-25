import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { makeStore } from './store';
import App from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const wait = (ms = 400) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

function setValue(el, value) {
  const proto =
    el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype
    : el.tagName === 'SELECT' ? HTMLSelectElement.prototype
    : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
}

let root;
let host;
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
});

async function mount() {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  const store = makeStore();
  await act(async () => {
    root.render(<Provider store={store}><App /></Provider>);
  });
  await wait();
  return store;
}

const q = (sel) => document.querySelector(sel);
const byText = (tag, text) => [...document.querySelectorAll(tag)].find((e) => e.textContent.includes(text));
const click = (el) => act(async () => { el.click(); });

describe('alur UI lengkap', () => {
  it('daftar -> rekam -> validasi -> simpan -> SOAP', async () => {
    await mount();

    // Daftar pasien: 6 baris, filter bekerja
    expect(document.querySelectorAll('tbody tr')).toHaveLength(6);
    await act(async () => setValue(q('#q'), 'siti'));
    expect(document.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(q('nav[aria-label="Ruang kerja"] button:disabled')).not.toBeNull(); // rekam/SOAP terkunci

    // Buka rekam Siti
    await click(q('button[aria-label="Buka rekam Siti Aminah"]'));
    await wait();
    expect(q('h1').textContent).toBe('Rekam Pasien');
    expect(q('#f-name').value).toBe('Siti Aminah');

    // Simpan kosong -> error "Wajib diisi" + notifikasi error
    await click(byText('button', 'Simpan rekam'));
    expect(document.body.textContent).toContain('Wajib diisi');
    expect(q('[role="alert"]').textContent).toContain('Periksa kembali data yang wajib diisi.');

    // Isi tanda vital: 165 -> Perlu tinjauan, 110 -> Normal
    await act(async () => setValue(q('#v-sys'), '165'));
    expect(q('#v-sys-status').textContent).toContain('Perlu tinjauan');
    await act(async () => setValue(q('#v-sys'), '110'));
    expect(q('#v-sys-status').textContent).toContain('Normal');
    for (const [id, v] of [['dia', '70'], ['hr', '80'], ['rr', '18'], ['temp', '36.7'], ['spo2', '98']]) {
      await act(async () => setValue(q(`#v-${id}`), v));
    }
    await click(byText('button', 'Simpan rekam'));
    await wait(900); // 2 request berurutan: PATCH profil lalu POST tanda vital
    expect(document.body.textContent).toContain('Data berhasil disimpan.');
    expect(document.body.textContent).toContain('Terakhir disimpan');

    // Lanjut ke SOAP, kirim tanpa isi -> error; isi dengan skrip -> tersanitasi
    await click(byText('button', 'Lanjut ke Catatan SOAP'));
    expect(q('h1').textContent).toBe('Catatan SOAP');
    expect(document.body.textContent).toContain('Pasien menyampaikan keluhan pusing.'); // riwayat contoh

    await click(byText('button', 'Kirim catatan SOAP'));
    expect(document.body.textContent).toContain('Bagian catatan wajib diisi.');

    await act(async () => setValue(q('#soap-subjective'), 'Nyeri dada<img src=x onerror=alert(1)>'));
    await act(async () => setValue(q('#soap-objective'), '<script>alert(1)</script>')); // hanya skrip -> kosong
    await act(async () => setValue(q('#soap-assessment'), 'Observasi'));
    await act(async () => setValue(q('#soap-plan'), 'EKG'));
    await click(byText('button', 'Kirim catatan SOAP'));
    expect(document.body.textContent).toContain('Bagian catatan wajib diisi.'); // objective masih kosong

    await act(async () => setValue(q('#soap-objective'), 'TD 110/70'));
    await click(byText('button', 'Kirim catatan SOAP'));
    await wait();
    expect(document.body.textContent).toContain('Catatan SOAP berhasil dikirim.');
    expect(document.body.textContent).toContain('Nyeri dada');
    expect(document.body.innerHTML).not.toContain('onerror');
    expect(document.querySelector('img')).toBeNull();

    // Akhiri sesi -> kembali ke daftar
    await click(byText('button', 'Akhiri sesi'));
    expect(q('h1').textContent).toBe('Daftar Pasien');
  });
});
