import { useState } from "react";
import { api } from '../api/http.js';
import DatePicker from "../components/ui/DatePicker.jsx";

export default function AddWorker() {
  const [form, setForm] = useState({ name: "", phone: "", address: "", joiningDate: "", aadhaarNumber: "", photo: "" });
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
    const cleanPhone = form.phone.replace(/[^0-9]/g,'');
    if (!cleanPhone) e.phone = "Required"; else if (cleanPhone.length !== 10) e.phone = "10 digits";
    if (!form.address.trim()) e.address = "Required";
    if (!form.joiningDate) e.joiningDate = "Required";
	if (!form.aadhaarNumber || form.aadhaarNumber.length !== 12) e.aadhaarNumber = "12 digits";
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
      const payload = { ...form, phone: form.phone.replace(/[^0-9]/g,'') };
      await api.workers.create(payload);
      setSuccess("Worker saved");
  setForm({ name: "", phone: "", address: "", joiningDate: "", aadhaarNumber:"", photo:"" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => {
  setForm({ name: "", phone: "", address: "", joiningDate: "", aadhaarNumber:"", photo:"" });
    setErrors({});
  setSuccess(""); setError("");
  };

  const field = (name, placeholder, props = {}) => (
    <div>
      <input
        name={name}
        value={form[name]}
        onChange={(e)=> setForm(f=> ({...f, [name]: name==='phone' ? e.target.value.replace(/[^0-9]/g,'') : e.target.value }))}
        placeholder={placeholder}
        {...props}
        maxLength={name==='phone'?10:props.maxLength}
        className={`w-full rounded-md border px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200 ${errors[name] ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`}
      />
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
          <div>
            <input name="aadhaarNumber" value={form.aadhaarNumber} onChange={onChange} placeholder="Aadhaar Number (12 digits)" className={`w-full rounded-md border px-3 py-2 text-sm font-mono tracking-wider hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200 ${errors.aadhaarNumber ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`} maxLength={12} />
            {errors.aadhaarNumber && <div className="mt-1 text-xs text-rose-600">{errors.aadhaarNumber}</div>}
          </div>
          <div className="sm:col-span-2">{field('address', 'Address')}</div>
          <DatePicker value={form.joiningDate} onChange={(e)=> setForm(f=> ({...f, joiningDate: e.target.value}))} placeholder="Joining Date" />
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-medium text-slate-600">Photo</label>
            {form.photo && <img src={form.photo} alt="preview" className="h-24 w-24 object-cover rounded-lg border border-teal-200 shadow-sm" />}
            <button type="button" onClick={()=> document.getElementById('addw-photo')?.click()} className="inline-flex items-center gap-1 rounded-md bg-teal-600 text-white px-3 py-1.5 text-xs font-medium shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M12 5v14m7-7H5" /></svg>
              {form.photo ? 'Change Photo' : 'Upload Photo'}
            </button>
            <input id="addw-photo" hidden type="file" accept="image/*" onChange={(e)=>{ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=ev=> setForm(f=>({...f, photo: ev.target.result})); reader.readAsDataURL(file); }} />
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
