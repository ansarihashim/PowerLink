import { useState } from "react";
import { api } from '../api/http.js';
import DatePicker from "../components/ui/DatePicker.jsx";

export default function AddWorker() {
  const [form, setForm] = useState({ name: "", phone: "", address: "", joiningDate: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.joiningDate) e.joiningDate = "Required";
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccess(""); setError("");
    const eMap = validate();
    setErrors(eMap);
    if (Object.keys(eMap).length) return;
    setSubmitting(true);
    try {
      await api.workers.create(form);
      setSuccess("Worker saved");
      setForm({ name: "", phone: "", address: "", joiningDate: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    setForm({ name: "", phone: "", address: "", joiningDate: "" });
    setErrors({});
  setSuccess(""); setError("");
  };

  const field = (name, placeholder, props = {}) => (
    <div>
      <input name={name} value={form[name]} onChange={onChange} placeholder={placeholder} {...props} className={`w-full rounded-md border px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200 ${errors[name] ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`} />
      {errors[name] && <div className="mt-1 text-xs text-rose-600">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Add Worker</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {success && <div className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{success}</div>}
        {error && <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          {field('name', 'Name')}
          {field('phone', 'Phone')}
          <div className="sm:col-span-2">{field('address', 'Address')}</div>
          <DatePicker value={form.joiningDate} onChange={(e)=> setForm(f=> ({...f, joiningDate: e.target.value}))} placeholder="Joining Date" />
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 text-sm disabled:opacity-60">{submitting ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={onCancel} className="rounded-md bg-teal-600 text-white px-4 py-2 text-sm hover:bg-teal-700">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
