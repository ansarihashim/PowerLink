import { useState } from "react";

export default function AddWorker() {
  const [form, setForm] = useState({ name: "", phone: "", address: "", joiningDate: "" });
  const [errors, setErrors] = useState({});
  const [added, setAdded] = useState([]);
  const [success, setSuccess] = useState("");

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

  const onSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    const eMap = validate();
    setErrors(eMap);
    if (Object.keys(eMap).length) return;
    const item = {
      id: `W-${Math.floor(Math.random()*1000)}`,
      name: form.name,
      phone: form.phone,
      address: form.address,
      joiningDate: form.joiningDate,
    };
    setAdded((arr) => [item, ...arr]);
    setSuccess("Worker added locally (not saved)");
    setForm({ name: "", phone: "", address: "", joiningDate: "" });
  };

  const onCancel = () => {
    setForm({ name: "", phone: "", address: "", joiningDate: "" });
    setErrors({});
    setSuccess("");
  };

  const field = (name, placeholder, props = {}) => (
    <div>
      <input name={name} value={form[name]} onChange={onChange} placeholder={placeholder} {...props} className={`w-full rounded-md border px-3 py-2 text-sm ${errors[name] ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`} />
      {errors[name] && <div className="mt-1 text-xs text-amber-600">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Add Worker</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  {success && <div className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{success}</div>}
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          {field('name', 'Name')}
          {field('phone', 'Phone')}
          <div className="sm:col-span-2">{field('address', 'Address')}</div>
          {field('joiningDate', 'Joining Date', { type: 'date' })}
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 text-sm">Save</button>
            <button type="button" onClick={onCancel} className="rounded-md bg-teal-600 text-white px-4 py-2 text-sm hover:bg-teal-700">Cancel</button>
          </div>
        </form>
      </div>

      {added.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-2">Locally Added Workers</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            {added.map((w) => (
              <li key={w.id} className="flex items-center justify-between">
                <span>{w.id} — {w.name}</span>
                <span className="text-slate-500">Joined: {w.joiningDate}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
