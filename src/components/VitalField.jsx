import { evaluateVital, formatRange, isBlocking } from '../utils/vitals';
import { IconAlert, IconCheck, IconCircle } from './icons';

const ICON = {
  normal: IconCheck,
  empty: IconCircle,
  review: IconAlert,
  required: IconAlert,
  invalid: IconAlert,
};

/** Satu kolom tanda vital: label, satuan, input, rentang normal, dan status (ikon + teks). */
export default function VitalField({ def, value, submitted, onChange }) {
  const id = `v-${def.key}`;
  const result = evaluateVital(def, value, submitted);
  const Icon = ICON[result.level];
  const blocking = isBlocking(result.level);

  return (
    <div className="vital">
      <label htmlFor={id}>{def.label}</label>
      <span className="vital-unit" id={`${id}-unit`}>{def.unit}</span>
      <input
        id={id}
        type="number"
        step="any"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={blocking}
        aria-describedby={`${id}-unit ${id}-range ${id}-status`}
        className={blocking ? 'is-error' : ''}
      />
      <span className="vital-range" id={`${id}-range`}>Normal: {formatRange(def.normal)}</span>
      <p className={`chip chip-${result.level}`} id={`${id}-status`}>
        <Icon size={16} /> {result.text}
      </p>
    </div>
  );
}
