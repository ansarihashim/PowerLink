import { useState } from "react";
import { api } from '../api/http.js';
import SortSelect from "../components/ui/SortSelect.jsx";
import DatePicker from "../components/ui/DatePicker.jsx";

export default function AddExpense() {
  const [form, setForm] = useState({ category: "tea", amount: "", date: "" });
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
    if (!form.category) e.category = "Required";
    if (form.amount === "" || isNaN(Number(form.amount))) e.amount = "Required";
    if (!form.date) e.date = "Required";
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccess(""); setError("");
    const eMap = validate(); setErrors(eMap); if (Object.keys(eMap).length) return;
    setSubmitting(true);
    try {
      await api.expenses.create({ category: form.category, amount: Number(form.amount), date: form.date });
      setSuccess('Expense saved');
      setForm({ category: 'tea', amount: '', date: '' });
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const onCancel = () => {
    setForm({ category: "tea", amount: "", date: "" });
    setErrors({});
  setSuccess(""); setError("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Add Expense</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    {success && <div className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{success}</div>}
    {error && <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div>
            <SortSelect
              value={form.category}
              onChange={(e)=> setForm(f=> ({...f, category: e.target.value}))}
              options={[
                { value: "tea", label: "tea" },
                { value: "workshop", label: "workshop" },
                { value: "mistary", label: "mistary" },
                { value: "mukadam", label: "mukadam" },
                { value: "maintenance", label: "maintenance" },
                { value: "other", label: "other" },
              ]}
              className="px-3 py-2"
            />
            {errors.category && <div className="mt-1 text-xs text-rose-600">{errors.category}</div>}
          </div>
          <div>
            <input name="amount" value={form.amount} onChange={onChange} type="number" min={0} placeholder="Amount" className={`w-full rounded-md border px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200 ${errors.amount ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`} />
            {errors.amount && <div className="mt-1 text-xs text-rose-600">{errors.amount}</div>}
          </div>
          <div>
            <DatePicker value={form.date} onChange={(e)=> setForm(f=> ({...f, date: e.target.value}))} />
            {errors.date && <div className="mt-1 text-xs text-rose-600">{errors.date}</div>}
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
