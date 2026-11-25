import { useDispatch } from 'react-redux';
import { endSession, setView } from '../store/patientSlice';
import { IconCheck } from './icons';

/** Breadcrumb + status "Sesi aktif" + tombol "Akhiri sesi" (halaman rekam & SOAP) */
export default function SessionBar({ patient, current }) {
  const dispatch = useDispatch();
  return (
    <div className="session-bar">
      <nav aria-label="Jejak halaman" className="crumbs">
        <button type="button" className="link" onClick={() => dispatch(setView('list'))}>
          Daftar Pasien
        </button>
        <span aria-hidden="true">›</span>
        {current === 'record' ? (
          <span aria-current="page" className="crumb-current">{patient.name}</span>
        ) : (
          <button type="button" className="link" onClick={() => dispatch(setView('record'))}>
            {patient.name}
          </button>
        )}
      </nav>
      <div className="session-actions">
        <span className="badge-ok">
          <IconCheck size={16} /> Sesi aktif
        </span>
        <button type="button" className="btn btn-outline" onClick={() => dispatch(endSession())}>
          Akhiri sesi
        </button>
      </div>
    </div>
  );
}
