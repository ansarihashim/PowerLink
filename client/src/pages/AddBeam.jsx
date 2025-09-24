import { useState } from 'react';
import DatePicker from '../components/ui/DatePicker.jsx';
import { api } from '../api/http.js';

export default function AddBeam() {
  const [form, setForm] = useState({ date: '', bunches: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (form.bunches === '' || isNaN(Number(form.bunches))) e.bunches = 'Required';
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault(); setSuccess(''); setError('');
    const eMap = validate(); setErrors(eMap); if (Object.keys(eMap).length) return;
    setSubmitting(true);
    try { await api.beam.create({ date: form.date, bunches: Number(form.bunches) }); setSuccess('Beam record saved'); setForm({ date:'', bunches:'' }); }
    catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const onCancel = () => { setForm({ date:'', bunches:'' }); setErrors({}); setSuccess(''); setError(''); };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Add Beam</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {success && <div className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{success}</div>}
        {error && <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <DatePicker value={form.date} onChange={(e)=> setForm(f=> ({...f, date: e.target.value}))} />
            {errors.date && <div className="mt-1 text-xs text-rose-600">{errors.date}</div>}
          </div>
            <div>
              <input type="number" min={0} value={form.bunches} onChange={(e)=> setForm(f=> ({...f, bunches: e.target.value}))} placeholder="Bunches" className={`w-full rounded-md border px-3 py-2 text-sm ${errors.bunches ? 'border-rose-300 bg-rose-50':'border-gray-200'} hover:border-teal-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all`} />
              {errors.bunches && <div className="mt-1 text-xs text-rose-600">{errors.bunches}</div>}
            </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 text-sm disabled:opacity-60">{submitting ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={onCancel} className="rounded-md bg-teal-600 text-white px-4 py-2 text-sm hover:bg-teal-700">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
