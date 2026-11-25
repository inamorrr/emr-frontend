/**
 * Adapter Axios tiruan (in-memory) agar praktikum bisa berjalan tanpa backend.
 * Set VITE_API_URL di .env untuk memakai backend asli -> adapter ini tidak dipakai.
 *
 * allergies: array  = daftar alergi (kosong [] = tidak ada alergi)
 *            null   = belum tersedia / belum ditanyakan
 */
const db = {
  patients: [
    {
      id: 'p-001', mrn: 'RM-0001', name: 'Siti Aminah', birthDate: '1985-04-12', sex: 'P',
      allergies: ['Penisilin'], vitals: [],
      notes: [
        {
          id: 'n-seed-1',
          createdAt: '2026-11-24T08:15:00+07:00',
          author: 'Perawat Jaga',
          subjective: 'Pasien menyampaikan keluhan pusing.',
          objective: 'Pasien sadar dan dapat berkomunikasi.',
          assessment: 'Perlu pemantauan kondisi pasien.',
          plan: 'Observasi dan laporkan perubahan kondisi.',
        },
      ],
    },
    { id: 'p-002', mrn: 'RM-0002', name: 'Budi Santoso', birthDate: '1972-09-30', sex: 'L', allergies: [], vitals: [], notes: [] },
    { id: 'p-003', mrn: 'RM-0003', name: 'Dewi Lestari', birthDate: null, sex: 'P', allergies: ['Seafood'], vitals: [], notes: [] },
    { id: 'p-004', mrn: 'RM-0004', name: 'Agus Wijaya', birthDate: null, sex: 'L', allergies: null, vitals: [], notes: [] },
    { id: 'p-005', mrn: 'RM-0005', name: 'Rina Marlina', birthDate: null, sex: 'P', allergies: ['Sulfa'], vitals: [], notes: [] },
    { id: 'p-006', mrn: 'RM-0006', name: 'Hendra Kusuma', birthDate: null, sex: 'L', allergies: null, vitals: [], notes: [] },
  ],
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const clone = (x) => JSON.parse(JSON.stringify(x));
const summary = ({ vitals, notes, ...p }) => p;

function respond(config, status, data) {
  const response = { data, status, statusText: String(status), headers: {}, config };
  if (status >= 200 && status < 300) return Promise.resolve(response);
  const err = new Error(`Request failed with status code ${status}`);
  err.response = response;
  err.config = config;
  err.isAxiosError = true;
  return Promise.reject(err);
}

export async function mockAdapter(config) {
  await delay(250);
  const url = config.url.replace(config.baseURL || '', '');
  const method = (config.method || 'get').toLowerCase();
  const body = config.data ? JSON.parse(config.data) : {};
  const notFound = () => respond(config, 404, { message: 'Pasien tidak ditemukan' });

  if (method === 'get' && url === '/patients') {
    return respond(config, 200, clone(db.patients.map(summary)));
  }

  let m = url.match(/^\/patients\/([^/]+)$/);
  if (m) {
    const p = db.patients.find((x) => x.id === m[1]);
    if (!p) return notFound();
    if (method === 'get') return respond(config, 200, clone(p));
    if (method === 'patch') {
      if (!body.name || !body.birthDate || !body.sex) {
        return respond(config, 422, { message: 'Nama, tanggal lahir, dan jenis kelamin wajib diisi' });
      }
      Object.assign(p, {
        name: body.name,
        birthDate: body.birthDate,
        sex: body.sex,
        allergies: body.allergies ?? null,
      });
      return respond(config, 200, clone(summary(p)));
    }
  }

  m = url.match(/^\/patients\/([^/]+)\/vitals$/);
  if (method === 'post' && m) {
    const p = db.patients.find((x) => x.id === m[1]);
    if (!p) return notFound();
    const rec = { id: `v-${Date.now()}`, createdAt: new Date().toISOString(), ...body };
    p.vitals.unshift(rec);
    return respond(config, 201, rec);
  }

  m = url.match(/^\/patients\/([^/]+)\/soap$/);
  if (method === 'post' && m) {
    const p = db.patients.find((x) => x.id === m[1]);
    if (!p) return notFound();
    const rec = {
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString(),
      author: 'Perawat Jaga',
      ...body,
    };
    p.notes.unshift(rec);
    return respond(config, 201, rec);
  }

  return respond(config, 404, { message: 'Endpoint tidak ditemukan' });
}
