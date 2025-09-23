import { useState } from "react";
import SortSelect from "../components/ui/SortSelect.jsx";
import { workers } from "../data/workers.js";

export default function AddLoan() {
  const [form, setForm] = useState({ workerId: "", amount: "", loanDate: "", reason: "" });
  const [errors, setErrors] = useState({});
  const [added, setAdded] = useState([]);
  const [success, setSuccess] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.workerId) e.workerId = "Required";
    if (form.amount === "" || isNaN(Number(form.amount))) e.amount = "Required";
    if (!form.loanDate) e.loanDate = "Required";
    if (!form.reason.trim()) e.reason = "Required";
    return e;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    const eMap = validate();
    setErrors(eMap);
    if (Object.keys(eMap).length) return;
    const item = {
      id: `L-${Math.floor(Math.random()*1000)}`,
      workerId: form.workerId,
      amount: Number(form.amount),
      loanDate: form.loanDate,
      remaining: Number(form.amount),
      reason: form.reason,
    };
    setAdded((arr) => [item, ...arr]);
    setSuccess("Loan added locally (not saved)");
    setForm({ workerId: "", amount: "", loanDate: "", reason: "" });
  };

  const onCancel = () => {
    setForm({ workerId: "", amount: "", loanDate: "", reason: "" });
    setErrors({});
    setSuccess("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Add Loan</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  {success && <div className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{success}</div>}
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div>
            <SortSelect
              value={form.workerId}
              onChange={(e)=> setForm(f=> ({...f, workerId: e.target.value}))}
              options={[
                { value: "", label: "Select Worker ID" },
                ...workers.map((w)=> ({ value: w.id, label: `${w.id} — ${w.name}` }))
              ]}
              className="px-3 py-2"
            />
            {errors.workerId && <div className="mt-1 text-xs text-rose-600">{errors.workerId}</div>}
          </div>
          <div>
            <input name="amount" value={form.amount} onChange={onChange} type="number" min={0} placeholder="Amount" className={`w-full rounded-md border px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200 ${errors.amount ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`} />
            {errors.amount && <div className="mt-1 text-xs text-rose-600">{errors.amount}</div>}
          </div>
          <div>
            <input name="loanDate" value={form.loanDate} onChange={onChange} type="date" className={`w-full rounded-md border px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200 ${errors.loanDate ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`} />
            {errors.loanDate && <div className="mt-1 text-xs text-rose-600">{errors.loanDate}</div>}
          </div>
          <div className="sm:col-span-2">
            <input name="reason" value={form.reason} onChange={onChange} placeholder="Reason" className={`w-full rounded-md border px-3 py-2 text-sm ${errors.reason ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`} />
            {errors.reason && <div className="mt-1 text-xs text-rose-600">{errors.reason}</div>}
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 text-sm">Save</button>
            <button type="button" onClick={onCancel} className="rounded-md bg-teal-600 text-white px-4 py-2 text-sm hover:bg-teal-700">Cancel</button>
          </div>
        </form>
      </div>

      {added.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-2">Locally Added Loans</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            {added.map((l) => (
              <li key={l.id} className="flex items-center justify-between">
                <span>{l.id} — {l.workerId}</span>
                <span className="text-slate-500">Amount: {l.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
