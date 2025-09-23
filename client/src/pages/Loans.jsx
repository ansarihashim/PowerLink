import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SortSelect from "../components/ui/SortSelect.jsx";
import { loans as seed } from "../data/loans.js";

export default function Loans() {
  const [sortKey, setSortKey] = useState("loanDate");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtered, setFiltered] = useState(seed);

  useEffect(() => {
    const fromD = from ? new Date(from) : null;
    const toD = to ? new Date(to) : null;
    const rows = seed.filter((l) => {
      const d = new Date(l.loanDate);
      const fromOk = fromD ? d >= fromD : true;
      const toOk = toD ? d <= toD : true;
      return fromOk && toOk;
    });
    setFiltered(rows);
    setPage(1);
  }, [from, to]);

  const { rows, totalPages } = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    const start = (page - 1) * pageSize;
    return { rows: sorted.slice(start, start + pageSize), totalPages: Math.ceil(sorted.length / pageSize) };
  }, [filtered, sortKey, sortDir, page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
  <span className="h-6 w-1.5 rounded bg-teal-500" />
        <h2 className="text-xl font-semibold text-slate-900">Loans</h2>
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2">
          <input value={from} onChange={(e)=>setFrom(e.target.value)} type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200" />
          <input value={to} onChange={(e)=>setTo(e.target.value)} type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <span>Sort by:</span>
          <SortSelect
            value={sortKey}
            onChange={(e)=>setSortKey(e.target.value)}
            options={[
              { value: 'loanDate', label: 'Loan Date' },
              { value: 'amount', label: 'Loan Amount' },
              { value: 'remaining', label: 'Remaining' },
            ]}
          />
          <Button variant="outline" className="px-2 py-1" onClick={()=>setSortDir(d=> d==='asc'?'desc':'asc')}>
            {sortDir === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </div>
      </Card>
      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-700 text-white">
            <tr className="text-white">
              {['Worker ID','Loan Amount','Loan Date','Remaining Loan','Reason'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((l, idx) => (
              <tr key={l.id} className={`transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <td className="px-4 py-3">{l.workerId}</td>
                <td className="px-4 py-3">{l.amount.toLocaleString()}</td>
                <td className="px-4 py-3">{l.loanDate}</td>
                <td className="px-4 py-3">{l.remaining.toLocaleString()}</td>
                <td className="px-4 py-3">{l.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <Button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 disabled:opacity-50">Prev</Button>
          <Button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 disabled:opacity-50">Next</Button>
        </div>
      </div>
    </div>
  );
}
