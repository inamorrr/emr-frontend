# Catatan desain → kode (Step 1)

Desain Figma ("Sistem komponen klinis" + 3 halaman) sudah diterjemahkan 1:1 ke kode.

| Desain Figma | Kode |
|---|---|
| Halaman Daftar Pasien (tabel, cari, filter jenis kelamin) | `src/components/PatientListPage.jsx` |
| Halaman Rekam Pasien (Data Pasien + Tanda Vital) | `src/components/PatientRecordPage.jsx`, `VitalField.jsx` |
| Halaman Catatan SOAP + Riwayat | `src/components/SoapPage.jsx` |
| Header, sidebar "Ruang kerja", footer | `src/components/AppShell.jsx` |
| Breadcrumb, "Sesi aktif", "Akhiri sesi" | `src/components/SessionBar.jsx` |
| Pemberitahuan (ikon + teks) | `src/components/Notice.jsx` |
| Token warna, tombol, input, status | `src/styles/app.css` |

## Keputusan
- **Data Daftar Pasien** memakai versi lengkap (ada filter jenis kelamin). Siti Aminah: lahir 12 Apr 1985.
- Tanggal lahir "Belum tersedia" dan alergi "Belum tersedia" ditampilkan apa adanya; alergi `null` ≠ "tidak ada alergi" (`-`).
- Rentang normal tanda vital mengikuti desain: Sistolik 90–120, Diastolik 60–80, Nadi 60–100, Napas 12–20, Suhu 36,1–37,2, SpO2 95–100.
- Nilai mustahil (mis. sistolik 900) ditandai "Nilai tidak valid", bukan hanya "Perlu tinjauan".

## Kontras warna (WCAG 2.1 AA) — dihitung dengan skrip
| Pasangan | Rasio | Syarat |
|---|---|---|
| Teks utama / putih | 17,74 | ≥ 4,5 ✔ |
| Teks sekunder / putih | 7,56 | ≥ 4,5 ✔ |
| Teks sekunder / bg halaman | 7,05 | ≥ 4,5 ✔ |
| Placeholder / putih | 4,83 | ≥ 4,5 ✔ |
| Putih / biru #0B5CAD (header, tombol) | 6,67 | ≥ 4,5 ✔ |
| Biru / biru muda (menu aktif) | 5,87 | ≥ 4,5 ✔ |
| Error #9B1C1C / putih | 8,15 | ≥ 4,5 ✔ |
| Hijau #14602F / hijau muda | 6,82 | ≥ 4,5 ✔ |
| Border input #64748B / putih | 4,76 | ≥ 3 ✔ |
| **Kuning fokus saja / putih** | **1,79** | ≥ 3 ✘ |
| **Cincin gelap + kuning (dipakai)** | 17,74 / 9,92 | ≥ 3 ✔ |

> Temuan: cincin fokus kuning polos tidak lolos WCAG 1.4.11 di atas latar putih.
> Perbaikan di kode: kuning 3px **ditambah** cincin gelap 2px di sisi dalam. Di Figma, lakukan hal yang sama
> (tambah stroke kedua warna #111827 di dalam stroke kuning) atau gelapkan kuningnya.

## Aksesibilitas yang sudah diterapkan
- Semua input punya `<label>` terhubung; tanda wajib `*` + pesan error teks (bukan hanya warna).
- Status tanda vital: ikon + teks (Normal / Perlu tinjauan / Belum dinilai / Wajib diisi).
- Target sentuh ≥ 44px, fokus terlihat, urutan tab logis, tautan "Lewati ke konten utama".
- Fokus pindah ke judul halaman saat berpindah halaman; error pertama otomatis difokuskan saat simpan gagal.
- `aria-live` untuk notifikasi; `aria-current="page"` pada menu aktif; tabel memakai `<th scope>`.
- Mendukung `prefers-reduced-motion`; responsif sampai ponsel (sidebar jadi menu horizontal).
