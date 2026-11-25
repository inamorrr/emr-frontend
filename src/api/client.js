import axios from 'axios';
import { mockAdapter } from './mockAdapter';
import { sanitizeObject } from '../utils/sanitize';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  // Tanpa VITE_API_URL -> pakai mock in-memory
  ...(import.meta.env.VITE_API_URL ? {} : { adapter: mockAdapter }),
});

// Token otentikasi (isi sesuai backend Anda)
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('emr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Defense in depth: sanitasi juga semua data yang DITERIMA dari server
api.interceptors.response.use(
  (res) => {
    res.data = sanitizeObject(res.data);
    return res;
  },
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Terjadi kesalahan jaringan';
    return Promise.reject(new Error(message));
  }
);

/** GET daftar pasien */
export const fetchPatients = () => api.get('/patients').then((r) => r.data);

/** GET data satu pasien */
export const fetchPatient = (id) => api.get(`/patients/${id}`).then((r) => r.data);

/** PATCH data pasien (nama, tgl lahir, jenis kelamin, alergi) */
export const updatePatient = (id, profile) =>
  api.patch(`/patients/${id}`, sanitizeObject(profile)).then((r) => r.data);

/** POST tanda vital (angka, sudah divalidasi di form) */
export const postVitals = (id, vitals) =>
  api.post(`/patients/${id}/vitals`, vitals).then((r) => r.data);

/** POST catatan SOAP baru -> semua teks disanitasi sebelum dikirim */
export const postSoapNote = (id, note) =>
  api.post(`/patients/${id}/soap`, sanitizeObject(note)).then((r) => r.data);
