import { useState } from "react";
import SortSelect from "../components/ui/SortSelect.jsx";
import { loans } from "../data/loans.js";

export default function PayInstallment() {
  const [form, setForm] = useState({ loanId: "", amount: "", date: "" });
  const [errors, setErrors] = useState({});
  const [added, setAdded] = useState([]);
  const [success, setSuccess] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.loanId) e.loanId = "Required";
    if (form.amount === "" || isNaN(Number(form.amount))) e.amount = "Required";
    if (!form.date) e.date = "Required";
    return e;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    const eMap = validate();
    setErrors(eMap);
    if (Object.keys(eMap).length) return;
    const item = {
      id: `I-${Math.floor(Math.random()*1000)}`,
      loanId: form.loanId,
      amount: Number(form.amount),
      date: form.date,
    };
    setAdded((arr) => [item, ...arr]);
    setSuccess("Installment recorded locally (not saved)");
    setForm({ loanId: "", amount: "", date: "" });
  };

  const onCancel = () => {
    setForm({ loanId: "", amount: "", date: "" });
    setErrors({});
    setSuccess("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Pay Installment</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  {success && <div className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{success}</div>}
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div>
            <SortSelect
              value={form.loanId}
              onChange={(e)=> setForm(f=> ({...f, loanId: e.target.value}))}
              options={[
                { value: "", label: "Select Loan" },
                ...loans.map((l)=> ({ value: l.id, label: `${l.id} — ${l.workerId}` }))
              ]}
              className="px-3 py-2"
            />
            {errors.loanId && <div className="mt-1 text-xs text-rose-600">{errors.loanId}</div>}
          </div>
          <div>
            <input name="amount" value={form.amount} onChange={onChange} type="number" min={0} placeholder="Amount" className={`w-full rounded-md border px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200 ${errors.amount ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`} />
            {errors.amount && <div className="mt-1 text-xs text-rose-600">{errors.amount}</div>}
          </div>
          <div>
            <input name="date" value={form.date} onChange={onChange} type="date" className={`w-full rounded-md border px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200 ${errors.date ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`} />
            {errors.date && <div className="mt-1 text-xs text-rose-600">{errors.date}</div>}
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 text-sm">Save</button>
            <button type="button" onClick={onCancel} className="rounded-md bg-teal-600 text-white px-4 py-2 text-sm hover:bg-teal-700">Cancel</button>
          </div>
        </form>
      </div>

      {added.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-2">Locally Recorded Installments</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            {added.map((i) => (
              <li key={i.id} className="flex items-center justify-between">
                <span>{i.id} — {i.loanId}</span>
                <span className="text-slate-500">Amount: {i.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
