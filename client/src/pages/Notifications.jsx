import { useEffect, useMemo, useState } from "react";
import { api } from "../api/http.js";
import Card from "../components/ui/Card.jsx";
import { formatDMY } from "../utils/date.js";
import SortSelect from "../components/ui/SortSelect.jsx";

export default function Notifications() {
  const [type, setType] = useState("all");

  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(()=> {
    let alive = true;
    setLoading(true); setError("");
    Promise.all([
      api.workers.list({ page:1, pageSize:50 }),
      api.loans.list({ page:1, pageSize:50 }),
      api.installments.list({ page:1, pageSize:50 }),
      api.expenses.list({ page:1, pageSize:50 }),
      api.baana.list({ page:1, pageSize:50 }),
      api.beam.list({ page:1, pageSize:50 })
    ])
      .then(([w,l,i,e,ba,be]) => {
        if(!alive) return;
        const items = [];
        (w.data||[]).forEach(x=> items.push({ date:x.joiningDate, text:`Worker joined: ${x.name}`, type:'worker' }));
        (l.data||[]).forEach(x=> items.push({ date:x.loanDate, text:`Loan issued: ${Number(x.amount).toLocaleString()}`, type:'loan' }));
        (i.data||[]).forEach(x=> items.push({ date:x.date, text:`Installment: ${Number(x.amount).toLocaleString()}`, type:'installment' }));
        (e.data||[]).forEach(x=> items.push({ date:x.date, text:`Expense: ${Number(x.amount).toLocaleString()}`, type:'expense' }));
        (ba.data||[]).forEach(x=> items.push({ date:x.date, text:`Baana arrival: ${x.sacks} sacks`, type:'baana' }));
        (be.data||[]).forEach(x=> items.push({ date:x.date, text:`Beam arrival: ${x.bunches} bunches`, type:'beam' }));
        items.sort((a,b)=> new Date(b.date) - new Date(a.date));
        setUpdates(items);
      })
      .catch(err=> { if(alive) setError(err.message || 'Failed to load'); })
      .finally(()=> { if(alive) setLoading(false); });
    return ()=> { alive=false; };
  }, []);

  const filtered = useMemo(() => type === 'all' ? updates : updates.filter(u=>u.type===type), [type, updates]);

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
        {loading && <div className="py-6 text-center text-sm text-slate-500">Loading...</div>}
        {error && !loading && <div className="py-6 text-center text-sm text-rose-600">{error}</div>}
        {!loading && !error && (
          <ul className="divide-y divide-gray-100">
            {filtered.map((n, i) => (
              <li key={`${n.text}-${n.date}-${i}`} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                    <span className="text-sm text-slate-800">{n.text}</span>
                  </div>
                  <span className="text-xs text-slate-500">{formatDMY(n.date)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-sm text-slate-500">No notifications</div>
        )}
      </Card>
    </div>
  );
}
