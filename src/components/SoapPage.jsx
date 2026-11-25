import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveSoapNote, setSoapField, setView, showNotice } from '../store/patientSlice';
import { sanitizeText } from '../utils/sanitize';
import { formatDateTime } from '../utils/format';
import { IconAlert, IconArrowLeft } from './icons';
import SessionBar from './SessionBar';
import { usePageFocus } from './usePageFocus';

const SECTIONS = [
  { key: 'subjective', letter: 'S', label: 'Subjektif (Subjective)' },
  { key: 'objective', letter: 'O', label: 'Objektif (Objective)' },
  { key: 'assessment', letter: 'A', label: 'Asesmen (Assessment)' },
  { key: 'plan', letter: 'P', label: 'Rencana (Plan)' },
];

export default function SoapPage() {
  const dispatch = useDispatch();
  const patient = useSelector((s) => s.patient.session.patient);
  const soap = useSelector((s) => s.patient.draft.soap);
  const saving = useSelector((s) => s.patient.saving.soap);
  const [submitted, setSubmitted] = useState(false);
  const titleRef = usePageFocus();

  if (!patient) return null;

  // Teks dibersihkan dulu: isi yang hanya berupa tag/skrip dianggap kosong
  const clean = Object.fromEntries(SECTIONS.map((s) => [s.key, sanitizeText(soap[s.key])]));
  const missing = SECTIONS.filter((s) => !clean[s.key]);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (missing.length > 0) {
      dispatch(showNotice({ type: 'error', text: 'Periksa kembali data yang wajib diisi.' }));
      document.getElementById(`soap-${missing[0].key}`)?.focus();
      return;
    }
    dispatch(saveSoapNote({ id: patient.id, note: clean }));
    setSubmitted(false);
  };

  return (
    <>
      <SessionBar patient={patient} current="soap" />

      <h1 ref={titleRef} tabIndex={-1} className="page-title">Catatan SOAP</h1>
      <p className="page-meta">
        <span className="mrn">{patient.mrn}</span>
        <span aria-hidden="true">•</span> {patient.name}
        <span aria-hidden="true">•</span> Seluruh bagian wajib diisi
      </p>

      <section className="card" aria-labelledby="new-note">
        <h2 id="new-note">Catatan perawatan baru</h2>
        <form onSubmit={onSubmit} noValidate>
          <div className="soap-grid">
            {SECTIONS.map((s) => {
              const bad = submitted && !clean[s.key];
              const id = `soap-${s.key}`;
              return (
                <div className="field" key={s.key}>
                  <label htmlFor={id}>
                    {s.letter} — {s.label} <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id={id}
                    rows={4}
                    maxLength={4000}
                    placeholder={`Tulis catatan ${s.letter}…`}
                    value={soap[s.key]}
                    aria-required="true"
                    aria-invalid={bad}
                    aria-describedby={bad ? `${id}-err` : undefined}
                    className={bad ? 'is-error' : ''}
                    onChange={(e) =>
                      dispatch(setSoapField({ field: s.key, value: e.target.value }))
                    }
                  />
                  {bad && (
                    <p id={`${id}-err`} className="msg msg-error">
                      <IconAlert size={16} /> Bagian catatan wajib diisi.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="actions">
            <button type="button" className="btn btn-outline" onClick={() => dispatch(setView('record'))}>
              <IconArrowLeft size={18} /> Kembali ke Rekam Pasien
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Mengirim…' : 'Kirim catatan SOAP'}
            </button>
          </div>
        </form>
      </section>

      <section className="card" aria-labelledby="hist-title">
        <h2 id="hist-title">Riwayat</h2>
        {patient.notes.length === 0 ? (
          <p className="hint">Belum ada catatan untuk pasien ini.</p>
        ) : (
          <ul className="history">
            {patient.notes.map((n) => (
              <li key={n.id} className="note">
                <time dateTime={n.createdAt} className="note-time">
                  {formatDateTime(n.createdAt)}
                </time>
                {n.author && <p className="note-author">{n.author}</p>}
                {/* Dirender sebagai text node (bukan innerHTML) -> aman dari XSS */}
                <dl>
                  {SECTIONS.map((s) => (
                    <div key={s.key} className="note-row">
                      <dt>{s.letter}</dt>
                      <dd>{n[s.key] || '–'}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
