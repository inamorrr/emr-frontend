import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadPatients, openPatient } from '../store/patientSlice';
import { formatDate } from '../utils/format';
import { IconAlert, IconArrowRight, IconSearch } from './icons';
import { usePageFocus } from './usePageFocus';

const SEX = { L: 'Laki-laki (L)', P: 'Perempuan (P)' };

function AllergyCell({ allergies }) {
  if (allergies === null) return <span className="muted">Belum tersedia</span>;
  if (allergies.length === 0) return <span aria-label="Tidak ada alergi">-</span>;
  return (
    <span className="allergy">
      <IconAlert size={16} />
      <span className="sr-only">Alergi: </span>
      {allergies.join(', ')}
    </span>
  );
}

export default function PatientListPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.patient.list);
  const opening = useSelector((s) => s.patient.session.status === 'loading');
  const [query, setQuery] = useState('');
  const [sex, setSex] = useState('');
  const titleRef = usePageFocus();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (p) =>
        (!sex || p.sex === sex) &&
        (!q || p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q))
    );
  }, [items, query, sex]);

  return (
    <>
      <h1 ref={titleRef} tabIndex={-1} className="page-title">Daftar Pasien</h1>
      <p className="page-sub">Temukan pasien dan mulai dokumentasi perawatan.</p>

      <section className="card" aria-labelledby="reg-title">
        <div className="card-head">
          <h2 id="reg-title">Pasien terdaftar</h2>
          <span className="count" aria-live="polite">{items.length} pasien</span>
        </div>

        <div className="filters">
          <div className="field grow">
            <label htmlFor="q">Cari pasien</label>
            <div className="input-icon">
              <IconSearch size={20} />
              <input
                id="q"
                type="search"
                autoComplete="off"
                placeholder="Cari nama atau No. RM"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="field sex-filter">
            <label htmlFor="sex">Jenis kelamin</label>
            <select id="sex" value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="">Semua jenis kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
        </div>

        {status === 'loading' && <p role="status" className="state-msg">Memuat data pasien…</p>}
        {status === 'failed' && (
          <p role="alert" className="state-msg text-error">
            <IconAlert size={16} /> Gagal memuat pasien: {error}{' '}
            <button type="button" className="link" onClick={() => dispatch(loadPatients())}>
              Coba lagi
            </button>
          </p>
        )}

        {status === 'ready' && (
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Daftar pasien terdaftar</caption>
              <thead>
                <tr>
                  <th scope="col">No. RM</th>
                  <th scope="col">Nama</th>
                  <th scope="col">Tanggal lahir</th>
                  <th scope="col">Jenis kelamin</th>
                  <th scope="col">Alergi</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-row">Tidak ada pasien yang cocok.</td>
                  </tr>
                )}
                {shown.map((p) => (
                  <tr key={p.id}>
                    <td className="mrn">{p.mrn}</td>
                    <th scope="row" className="name">{p.name}</th>
                    <td>{formatDate(p.birthDate) || <span className="muted">Belum tersedia</span>}</td>
                    <td>{SEX[p.sex] || '-'}</td>
                    <td><AllergyCell allergies={p.allergies} /></td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={opening}
                        aria-label={`Buka rekam ${p.name}`}
                        onClick={() => dispatch(openPatient(p.id))}
                      >
                        Buka rekam
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card-foot">
          <span>Menampilkan {shown.length} dari {items.length} pasien</span>
          <span>
            <IconAlert size={14} /> Alergi tercatat · “-” sesuai data sumber
          </span>
        </div>
      </section>

      <ol className="stepper" aria-label="Alur kerja">
        <li><b>01</b> Pilih pasien <IconArrowRight size={16} /></li>
        <li><b>02</b> Periksa rekam &amp; tanda vital <IconArrowRight size={16} /></li>
        <li><b>03</b> Tulis catatan SOAP</li>
      </ol>
    </>
  );
}
