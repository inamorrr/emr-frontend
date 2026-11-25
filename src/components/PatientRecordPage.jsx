import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  saveRecord,
  setProfileField,
  setVitalField,
  setView,
  showNotice,
} from '../store/patientSlice';
import { sanitizeText } from '../utils/sanitize';
import { formatDateTime } from '../utils/format';
import { VITALS, evaluateVital, isBlocking, parseNumber } from '../utils/vitals';
import { IconAlert, IconArrowRight } from './icons';
import SessionBar from './SessionBar';
import VitalField from './VitalField';
import { usePageFocus } from './usePageFocus';

const REQUIRED = 'Data wajib diisi.';

function FieldError({ id, children }) {
  return (
    <p id={id} className="msg msg-error">
      <IconAlert size={16} /> {children}
    </p>
  );
}

/** "Penisilin, Sulfa" -> ['Penisilin','Sulfa'] (tersanitasi) */
const parseAllergies = (text) =>
  text.split(/[,;\n]/).map((a) => sanitizeText(a)).filter(Boolean);

export default function PatientRecordPage() {
  const dispatch = useDispatch();
  const patient = useSelector((s) => s.patient.session.patient);
  const { profile, vitals } = useSelector((s) => s.patient.draft);
  const saving = useSelector((s) => s.patient.saving.record);
  const [submitted, setSubmitted] = useState(false);
  const titleRef = usePageFocus();

  if (!patient || !profile) return null;

  const profileErrors = {
    name: !sanitizeText(profile.name) ? REQUIRED : '',
    birthDate: !profile.birthDate ? REQUIRED : '',
    sex: !profile.sex ? REQUIRED : '',
  };
  const today = new Date().toISOString().slice(0, 10);
  const lastVital = patient.vitals[0];

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Urutan fokus = urutan tampilan
    const checks = [
      ['f-name', profileErrors.name],
      ['f-birth', profileErrors.birthDate],
      ['f-sex', profileErrors.sex],
      ...VITALS.map((v) => [
        `v-${v.key}`,
        isBlocking(evaluateVital(v, vitals[v.key], true).level),
      ]),
    ];
    const firstBad = checks.find(([, bad]) => bad);
    if (firstBad) {
      dispatch(showNotice({ type: 'error', text: 'Periksa kembali data yang wajib diisi.' }));
      document.getElementById(firstBad[0])?.focus();
      return;
    }

    const allergyList = parseAllergies(profile.allergies);
    dispatch(
      saveRecord({
        id: patient.id,
        profile: {
          name: sanitizeText(profile.name),
          birthDate: profile.birthDate,
          sex: profile.sex,
          // Kosong + sebelumnya "belum tersedia" -> tetap null (jangan dianggap "tidak ada alergi")
          allergies:
            allergyList.length === 0 && patient.allergies === null ? null : allergyList,
        },
        vitals: Object.fromEntries(VITALS.map((v) => [v.key, parseNumber(vitals[v.key])])),
      })
    );
  };

  const err = (key) => (submitted ? profileErrors[key] : '');

  return (
    <>
      <SessionBar patient={patient} current="record" />

      <h1 ref={titleRef} tabIndex={-1} className="page-title">Rekam Pasien</h1>
      <p className="page-meta">
        <span className="mrn">{patient.mrn}</span>
        <span aria-hidden="true">•</span> {patient.name}
        <span aria-hidden="true">•</span> Data wajib ditandai <span aria-hidden="true">*</span>
        <span className="sr-only">bintang</span>
      </p>

      <form onSubmit={onSubmit} noValidate>
        <section className="card" aria-labelledby="pd-title">
          <h2 id="pd-title">Data Pasien</h2>
          <div className="profile-grid">
            <div className="field">
              <label htmlFor="f-name">Nama <span aria-hidden="true">*</span></label>
              <input
                id="f-name"
                value={profile.name}
                autoComplete="off"
                aria-required="true"
                aria-invalid={Boolean(err('name'))}
                aria-describedby={err('name') ? 'f-name-err' : undefined}
                className={err('name') ? 'is-error' : ''}
                onChange={(e) => dispatch(setProfileField({ field: 'name', value: e.target.value }))}
              />
              {err('name') && <FieldError id="f-name-err">{err('name')}</FieldError>}
            </div>

            <div className="field">
              <label htmlFor="f-birth">Tanggal lahir <span aria-hidden="true">*</span></label>
              <input
                id="f-birth"
                type="date"
                max={today}
                value={profile.birthDate}
                aria-required="true"
                aria-invalid={Boolean(err('birthDate'))}
                aria-describedby={err('birthDate') ? 'f-birth-err' : undefined}
                className={err('birthDate') ? 'is-error' : ''}
                onChange={(e) =>
                  dispatch(setProfileField({ field: 'birthDate', value: e.target.value }))
                }
              />
              {err('birthDate') && <FieldError id="f-birth-err">{err('birthDate')}</FieldError>}
            </div>

            <div className="field">
              <label htmlFor="f-sex">Jenis kelamin <span aria-hidden="true">*</span></label>
              <select
                id="f-sex"
                value={profile.sex}
                aria-required="true"
                aria-invalid={Boolean(err('sex'))}
                aria-describedby={err('sex') ? 'f-sex-err' : undefined}
                className={err('sex') ? 'is-error' : ''}
                onChange={(e) => dispatch(setProfileField({ field: 'sex', value: e.target.value }))}
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              {err('sex') && <FieldError id="f-sex-err">{err('sex')}</FieldError>}
            </div>

            <div className="field">
              <label htmlFor="f-allergy">Alergi (opsional)</label>
              <input
                id="f-allergy"
                value={profile.allergies}
                autoComplete="off"
                aria-describedby="f-allergy-hint"
                placeholder={patient.allergies === null ? 'Belum tersedia' : 'Contoh: Penisilin, Sulfa'}
                onChange={(e) =>
                  dispatch(setProfileField({ field: 'allergies', value: e.target.value }))
                }
              />
              <p id="f-allergy-hint" className="hint">Pisahkan dengan koma.</p>
            </div>
          </div>
        </section>

        <section className="card" aria-labelledby="tv-title">
          <div className="card-head">
            <h2 id="tv-title">Tanda Vital</h2>
            <span className="hint">Status mengikuti rentang normal</span>
          </div>
          <div className="vital-grid">
            {VITALS.map((def) => (
              <VitalField
                key={def.key}
                def={def}
                value={vitals[def.key]}
                submitted={submitted}
                onChange={(value) => dispatch(setVitalField({ field: def.key, value }))}
              />
            ))}
          </div>
        </section>

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan rekam'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => dispatch(setView('soap'))}>
            Lanjut ke Catatan SOAP <IconArrowRight size={18} />
          </button>
        </div>
        {lastVital && (
          <p className="hint last-saved">
            Terakhir disimpan: {formatDateTime(lastVital.createdAt)}
          </p>
        )}
      </form>
    </>
  );
}
