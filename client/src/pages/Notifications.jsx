import { useMemo, useState } from "react";
import { workers } from "../data/workers.js";
import { loans } from "../data/loans.js";
import { installments } from "../data/installments.js";
import { expenses } from "../data/expenses.js";
import { baana } from "../data/baana.js";
import { beam } from "../data/beam.js";
import Card from "../components/ui/Card.jsx";
import SortSelect from "../components/ui/SortSelect.jsx";

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
        <div className="flex items-center gap-3">
          <span className="h-6 w-1.5 rounded bg-teal-500" />
          <h2 className="text-xl font-semibold text-slate-900">All Notifications</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-slate-600">Type</label>
          <SortSelect
            value={type}
            onChange={(e)=>setType(e.target.value)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'worker', label: 'Workers' },
              { value: 'loan', label: 'Loans' },
              { value: 'installment', label: 'Installments' },
              { value: 'expense', label: 'Expenses' },
              { value: 'baana', label: 'Baana' },
              { value: 'beam', label: 'Beam' },
            ]}
            className="px-2 py-1"
          />
        </div>
      </div>
      <Card className="p-4">
        <ul className="divide-y divide-gray-100">
          {filtered.map((n, i) => (
            <li key={`${n.text}-${n.date}-${i}`} className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
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
      </Card>
    </div>
  );
}
