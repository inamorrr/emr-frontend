import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearNotice } from '../store/patientSlice';
import { IconAlert, IconCheck } from './icons';

export default function Notice() {
  const dispatch = useDispatch();
  const notice = useSelector((s) => s.patient.notice);

  useEffect(() => {
    if (!notice || notice.type === 'error') return undefined;
    const t = setTimeout(() => dispatch(clearNotice()), 5000);
    return () => clearTimeout(t);
  }, [notice, dispatch]);

  // Wadah aria-live selalu ada supaya pembaca layar mengumumkan perubahan
  return (
    <div aria-live="polite" className="notice-wrap">
      {notice && (
        <p
          className={`notice notice-${notice.type}`}
          role={notice.type === 'error' ? 'alert' : 'status'}
        >
          {notice.type === 'success' ? <IconCheck size={18} /> : <IconAlert size={18} />}
          <span>{notice.text}</span>
          <button
            type="button"
            className="notice-close"
            onClick={() => dispatch(clearNotice())}
            aria-label="Tutup pesan"
          >
            ×
          </button>
        </p>
      )}
    </div>
  );
}
