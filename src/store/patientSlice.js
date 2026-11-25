import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as client from '../api/client';
import { EMPTY_VITALS } from '../utils/vitals';

/* ---------- Thunks (semua lewat Axios) ---------- */
export const loadPatients = createAsyncThunk('patient/loadPatients', () =>
  client.fetchPatients()
);

export const openPatient = createAsyncThunk('patient/openPatient', (id) =>
  client.fetchPatient(id)
);

/** "Simpan rekam": PATCH data pasien lalu POST tanda vital */
export const saveRecord = createAsyncThunk(
  'patient/saveRecord',
  async ({ id, profile, vitals }) => {
    const patient = await client.updatePatient(id, profile);
    const vital = await client.postVitals(id, vitals);
    return { patient, vital };
  }
);

/** "Kirim catatan SOAP": POST catatan baru */
export const saveSoapNote = createAsyncThunk('patient/saveSoapNote', ({ id, note }) =>
  client.postSoapNote(id, note)
);

/* ---------- State ---------- */
export const EMPTY_SOAP = { subjective: '', objective: '', assessment: '', plan: '' };

const profileFromPatient = (p) => ({
  name: p.name || '',
  birthDate: p.birthDate || '',
  sex: p.sex || '',
  allergies: (p.allergies || []).join(', '),
});

const initialState = {
  list: { items: [], status: 'idle', error: null },
  // "Active patient session" = pasien yang sedang dibuka
  session: { patient: null, status: 'idle', startedAt: null, error: null },
  view: 'list', // list | record | soap
  // Draft form disimpan di store supaya tidak hilang saat pindah halaman
  draft: { profile: null, vitals: { ...EMPTY_VITALS }, soap: { ...EMPTY_SOAP } },
  saving: { record: false, soap: false },
  notice: null, // { type: 'success' | 'error', text }
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    setView(state, { payload }) {
      // Halaman rekam/SOAP hanya boleh dibuka bila ada sesi pasien aktif
      if (payload !== 'list' && !state.session.patient) return;
      state.view = payload;
      state.notice = null;
    },
    endSession(state) {
      state.session = initialState.session;
      state.draft = { profile: null, vitals: { ...EMPTY_VITALS }, soap: { ...EMPTY_SOAP } };
      state.view = 'list';
      state.notice = null;
    },
    setProfileField(state, { payload: { field, value } }) {
      state.draft.profile[field] = value;
    },
    setVitalField(state, { payload: { field, value } }) {
      state.draft.vitals[field] = value;
    },
    setSoapField(state, { payload: { field, value } }) {
      state.draft.soap[field] = value;
    },
    showNotice(state, { payload }) {
      state.notice = payload;
    },
    clearNotice(state) {
      state.notice = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(loadPatients.pending, (s) => {
      s.list.status = 'loading';
      s.list.error = null;
    })
      .addCase(loadPatients.fulfilled, (s, a) => {
        s.list.status = 'ready';
        s.list.items = a.payload;
      })
      .addCase(loadPatients.rejected, (s, a) => {
        s.list.status = 'failed';
        s.list.error = a.error.message;
      })

      .addCase(openPatient.pending, (s) => {
        s.session.status = 'loading';
        s.session.error = null;
      })
      .addCase(openPatient.fulfilled, (s, a) => {
        s.session = {
          patient: a.payload,
          status: 'ready',
          startedAt: new Date().toISOString(),
          error: null,
        };
        s.draft = {
          profile: profileFromPatient(a.payload),
          vitals: { ...EMPTY_VITALS },
          soap: { ...EMPTY_SOAP },
        };
        s.view = 'record';
        s.notice = null;
      })
      .addCase(openPatient.rejected, (s, a) => {
        s.session.status = s.session.patient ? 'ready' : 'failed';
        s.session.error = a.error.message;
        s.notice = { type: 'error', text: `Gagal membuka rekam: ${a.error.message}` };
      })

      .addCase(saveRecord.pending, (s) => {
        s.saving.record = true;
      })
      .addCase(saveRecord.fulfilled, (s, a) => {
        s.saving.record = false;
        const { patient, vital } = a.payload;
        s.session.patient = { ...s.session.patient, ...patient };
        s.session.patient.vitals.unshift(vital);
        s.draft.profile = profileFromPatient(s.session.patient);
        const i = s.list.items.findIndex((x) => x.id === patient.id);
        if (i >= 0) s.list.items[i] = { ...s.list.items[i], ...patient };
        s.notice = { type: 'success', text: 'Data berhasil disimpan.' };
      })
      .addCase(saveRecord.rejected, (s, a) => {
        s.saving.record = false;
        s.notice = { type: 'error', text: `Gagal menyimpan: ${a.error.message}` };
      })

      .addCase(saveSoapNote.pending, (s) => {
        s.saving.soap = true;
      })
      .addCase(saveSoapNote.fulfilled, (s, a) => {
        s.saving.soap = false;
        s.session.patient?.notes.unshift(a.payload);
        s.draft.soap = { ...EMPTY_SOAP };
        s.notice = { type: 'success', text: 'Catatan SOAP berhasil dikirim.' };
      })
      .addCase(saveSoapNote.rejected, (s, a) => {
        s.saving.soap = false;
        s.notice = { type: 'error', text: `Gagal mengirim catatan: ${a.error.message}` };
      });
  },
});

export const {
  setView,
  endSession,
  setProfileField,
  setVitalField,
  setSoapField,
  showNotice,
  clearNotice,
} = patientSlice.actions;
export default patientSlice.reducer;
