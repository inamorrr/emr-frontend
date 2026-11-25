# Lab Practicum: Build the EMR Frontend

React SPA + Redux Toolkit + Axios + DOMPurify. Tampilan mengikuti desain Figma
(Daftar Pasien → Rekam Pasien → Catatan SOAP).

## Menjalankan

```bash
npm install
npm run dev      # buka http://localhost:5173
npm test         # 27 test (sanitasi, vital, state, alur UI penuh)
npm run build    # build produksi
```

Tanpa backend, aplikasi memakai **mock API in-memory** (`src/api/mockAdapter.js`).
Untuk backend asli, buat `.env`:

```
VITE_API_URL=https://emr.example.com/api
```

| Method | URL | Fungsi |
|---|---|---|
| GET | `/patients` | daftar pasien |
| GET | `/patients/:id` | data satu pasien |
| PATCH | `/patients/:id` | simpan data pasien (nama, tgl lahir, jenis kelamin, alergi) |
| POST | `/patients/:id/vitals` | simpan tanda vital |
| POST | `/patients/:id/soap` | kirim catatan SOAP |

## Pemetaan ke langkah praktikum

| Langkah | Lokasi |
|---|---|
| 1. Prototype (Figma), WCAG, minim klik | `docs/DESIGN-NOTES.md`, `src/styles/app.css`, `src/components/*Page.jsx` |
| 2. Scaffold & State (React + Redux) | `src/store/patientSlice.js`, `src/App.jsx` |
| 3. Integrate & Secure (Axios + sanitasi) | `src/api/client.js`, `src/utils/sanitize.js` |

## State (Step 2)
Satu slice Redux (`patient`) menyimpan:
- `list`: daftar pasien (GET).
- `session`: **active patient session**, yaitu pasien yang sedang dibuka + waktu mulai.
- `view`: halaman aktif (`list` / `record` / `soap`). Rekam & SOAP terkunci bila belum ada sesi.
- `draft`: isian form (profil, tanda vital, SOAP) supaya tidak hilang saat pindah halaman.
- `notice`: pemberitahuan sukses / error.

## Keamanan (Step 3)
- **Input**: semua teks (nama, alergi, SOAP) disanitasi DOMPurify (tanpa tag apa pun) sebelum divalidasi dan dikirim.
  Isian yang hanya berisi skrip dianggap kosong.
- **Output**: respons server disanitasi lagi di interceptor Axios (defense in depth).
- **Render**: selalu sebagai text node React, tidak pernah `dangerouslySetInnerHTML`.
- Token disimpan di `sessionStorage` dan dikirim lewat header `Authorization`.
- Sanitasi di klien **bukan pengganti** validasi & sanitasi di server.

## Catatan klinis
Rentang normal tanda vital (dewasa) hanya penanda visual, bukan keputusan klinis. Data pasien adalah data fiktif.
