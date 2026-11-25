import { describe, it, expect } from 'vitest';
import { makeStore } from './index';
import {
  loadPatients,
  openPatient,
  saveRecord,
  saveSoapNote,
  endSession,
  setView,
  setVitalField,
} from './patientSlice';

describe('daftar pasien', () => {
  it('GET 6 pasien', async () => {
    const store = makeStore();
    await store.dispatch(loadPatients());
    const { items, status } = store.getState().patient.list;
    expect(status).toBe('ready');
    expect(items).toHaveLength(6);
    expect(items.find((p) => p.mrn === 'RM-0004').allergies).toBeNull();
  });
});

describe('active patient session & navigasi', () => {
  it('membuka pasien -> sesi aktif, pindah ke halaman rekam, draft terisi', async () => {
    const store = makeStore();
    await store.dispatch(openPatient('p-001'));
    const s = store.getState().patient;
    expect(s.session.status).toBe('ready');
    expect(s.session.patient.name).toBe('Siti Aminah');
    expect(s.view).toBe('record');
    expect(s.draft.profile.allergies).toBe('Penisilin');
  });

  it('halaman rekam/SOAP ditolak tanpa sesi', () => {
    const store = makeStore();
    store.dispatch(setView('soap'));
    expect(store.getState().patient.view).toBe('list');
  });

  it('draft tanda vital bertahan saat pindah halaman', async () => {
    const store = makeStore();
    await store.dispatch(openPatient('p-002'));
    store.dispatch(setVitalField({ field: 'sys', value: '118' }));
    store.dispatch(setView('soap'));
    store.dispatch(setView('record'));
    expect(store.getState().patient.draft.vitals.sys).toBe('118');
  });

  it('endSession mengosongkan sesi & kembali ke daftar', async () => {
    const store = makeStore();
    await store.dispatch(openPatient('p-001'));
    store.dispatch(endSession());
    const s = store.getState().patient;
    expect(s.session.patient).toBeNull();
    expect(s.view).toBe('list');
  });

  it('pasien tidak ditemukan -> sesi gagal & notifikasi error', async () => {
    const store = makeStore();
    await store.dispatch(openPatient('nope'));
    const s = store.getState().patient;
    expect(s.session.status).toBe('failed');
    expect(s.notice.type).toBe('error');
  });
});

describe('simpan data (Axios PATCH + POST)', () => {
  it('saveRecord memperbarui profil, menambah vital, dan menyegarkan daftar', async () => {
    const store = makeStore();
    await store.dispatch(loadPatients());
    await store.dispatch(openPatient('p-004'));
    await store.dispatch(
      saveRecord({
        id: 'p-004',
        profile: { name: 'Agus Wijaya', birthDate: '1990-01-02', sex: 'L', allergies: null },
        vitals: { sys: 120, dia: 80, hr: 78, rr: 18, temp: 36.7, spo2: 98 },
      })
    );
    const s = store.getState().patient;
    expect(s.session.patient.birthDate).toBe('1990-01-02');
    expect(s.session.patient.vitals[0].sys).toBe(120);
    expect(s.list.items.find((p) => p.id === 'p-004').birthDate).toBe('1990-01-02');
    expect(s.session.patient.allergies).toBeNull(); // tetap "belum tersedia"
    expect(s.notice).toEqual({ type: 'success', text: 'Data berhasil disimpan.' });
  });

  it('server menolak data wajib kosong -> notifikasi error', async () => {
    const store = makeStore();
    await store.dispatch(openPatient('p-003'));
    await store.dispatch(
      saveRecord({
        id: 'p-003',
        profile: { name: '', birthDate: '', sex: 'P', allergies: [] },
        vitals: { sys: 120 },
      })
    );
    expect(store.getState().patient.notice.type).toBe('error');
  });

  it('SOAP tersanitasi ikut tersimpan di riwayat & draft dikosongkan', async () => {
    const store = makeStore();
    await store.dispatch(openPatient('p-002'));
    await store.dispatch(
      saveSoapNote({
        id: 'p-002',
        note: {
          subjective: 'Sesak<script>alert(1)</script>',
          objective: 'a',
          assessment: 'b',
          plan: 'c',
        },
      })
    );
    const s = store.getState().patient;
    expect(s.session.patient.notes[0].subjective).toBe('Sesak');
    expect(s.session.patient.notes[0].author).toBe('Perawat Jaga');
    expect(s.draft.soap.subjective).toBe('');
  });
});
