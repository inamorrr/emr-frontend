import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadPatients } from './store/patientSlice';
import AppShell from './components/AppShell';
import PatientListPage from './components/PatientListPage';
import PatientRecordPage from './components/PatientRecordPage';
import SoapPage from './components/SoapPage';

const TITLES = {
  list: 'Daftar Pasien',
  record: 'Rekam Pasien',
  soap: 'Catatan SOAP',
};

export default function App() {
  const dispatch = useDispatch();
  const view = useSelector((s) => s.patient.view);

  useEffect(() => {
    dispatch(loadPatients());
  }, [dispatch]);

  useEffect(() => {
    document.title = `${TITLES[view]} – EMR`;
  }, [view]);

  return (
    <AppShell>
      {view === 'list' && <PatientListPage />}
      {view === 'record' && <PatientRecordPage />}
      {view === 'soap' && <SoapPage />}
    </AppShell>
  );
}
