import DatePicker from './DatePicker.jsx';
import { useId } from 'react';

// Wrapper to mimic a native <input type="date"> signature but use themed DatePicker
export default function ThemedCalendarInput({ value, onChange, label, className = '', min, max, required, name, placeholder }) {
  const id = useId();
  // DatePicker already emits e.target.value (YYYY-MM-DD). We forward along with name for form parity.
  const handleChange = (e) => {
    if(!e || !e.target) return;
    const val = e.target.value;
    // Build a synthetic event closely resembling a native input change event
    const evt = {
      type: 'change',
      target: { name, value: val },
      currentTarget: { name, value: val },
      preventDefault: ()=>{},
      stopPropagation: ()=>{}
    };
    onChange?.(evt);
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}{required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <DatePicker
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        name={name}
        placeholder={placeholder || 'Select date'}
      />
    </div>
  );
}