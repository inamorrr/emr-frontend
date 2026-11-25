import { useDispatch, useSelector } from 'react-redux';
import { setView } from '../store/patientSlice';
import { IconClipboard, IconDoc, IconList, IconPlus } from './icons';
import Notice from './Notice';

const NAV = [
  { id: 'list', label: 'Daftar Pasien', Icon: IconList },
  { id: 'record', label: 'Rekam Pasien', Icon: IconDoc },
  { id: 'soap', label: 'Catatan SOAP', Icon: IconClipboard },
];

export default function AppShell({ children }) {
  const dispatch = useDispatch();
  const view = useSelector((s) => s.patient.view);
  const hasSession = useSelector((s) => Boolean(s.patient.session.patient));

  return (
    <div className="shell">
      <a className="skip-link" href="#main">Lewati ke konten utama</a>

      <header className="topbar">
        <div className="brand">
          <IconPlus size={22} />
          <span>EMR - Rekam Medis Elektronik</span>
        </div>
        <span className="user-pill">Perawat Jaga</span>
      </header>

      <aside className="sidebar">
        <nav aria-label="Ruang kerja">
          <p className="side-label" id="ws-label">Ruang kerja</p>
          <ul aria-labelledby="ws-label">
            {NAV.map(({ id, label, Icon }) => {
              const disabled = id !== 'list' && !hasSession;
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`nav-item${view === id ? ' is-active' : ''}`}
                    aria-current={view === id ? 'page' : undefined}
                    disabled={disabled}
                    title={disabled ? 'Pilih pasien terlebih dahulu' : undefined}
                    onClick={() => dispatch(setView(id))}
                  >
                    <Icon />
                    <span>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="side-note">
          <p className="side-label">Prototipe klinis</p>
          <p>Data simulasi. Bukan untuk perawatan pasien sebenarnya.</p>
        </div>
      </aside>

      <main id="main" className="main">
        <Notice />
        {children}
      </main>

      <footer className="footbar">
        Kode Anda memengaruhi perawatan pasien. Bangun dengan benar.
      </footer>
    </div>
  );
}
