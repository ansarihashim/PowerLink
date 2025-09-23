import { useMemo, useState } from "react";
import { workers } from "../data/workers.js";
import { loans } from "../data/loans.js";
import { installments } from "../data/installments.js";
import { expenses } from "../data/expenses.js";
import { baana } from "../data/baana.js";
import { beam } from "../data/beam.js";

export default function Notifications() {
  const [type, setType] = useState("all");

  const updates = useMemo(() => {
    const items = [
      ...workers.map((w) => ({ date: w.joiningDate, text: `Worker joined: ${w.name}`, type: "worker" })),
      ...loans.map((l) => ({ date: l.loanDate, text: `Loan taken: ${l.workerId} - ${l.amount.toLocaleString()}`, type: "loan" })),
      ...installments.map((i) => ({ date: i.date, text: `Installment paid: ${i.worker} - ${i.amount.toLocaleString()}`, type: "installment" })),
      ...expenses.map((e) => ({ date: e.date, text: `Expense added: ${e.category} - ${e.amount.toLocaleString()}`, type: "expense" })),
      ...baana.map((b) => ({ date: b.date, text: `Baana arrival: ${b.sacks} sacks`, type: "baana" })),
      ...beam.map((b) => ({ date: b.date, text: `Beam arrival: ${b.bunches} bunches`, type: "beam" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    return items;
  }, []);

  const filtered = useMemo(() => {
    return type === "all" ? updates : updates.filter((u) => u.type === type);
  }, [type, updates]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">All Notifications</h2>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-slate-600">Type</label>
          <select className="rounded-md border border-slate-200 px-2 py-1" value={type} onChange={(e)=>setType(e.target.value)}>
            <option value="all">All</option>
            <option value="worker">Workers</option>
            <option value="loan">Loans</option>
            <option value="installment">Installments</option>
            <option value="expense">Expenses</option>
            <option value="baana">Baana</option>
            <option value="beam">Beam</option>
          </select>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <ul className="divide-y divide-gray-100">
          {filtered.map((n, i) => (
            <li key={`${n.text}-${n.date}-${i}`} className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-800">{n.text}</span>
                </div>
                <span className="text-xs text-slate-500">{n.date}</span>
              </div>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <div className="text-sm text-slate-500">No notifications</div>
        )}
      </div>
    </div>
  );
}
