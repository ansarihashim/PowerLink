import { useMemo, useState } from "react";
import { beam as seed } from "../data/beam.js";

export default function Beam() {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { rows, totalPages } = useMemo(() => {
    const sorted = [...seed].sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    const start = (page - 1) * pageSize;
    return { rows: sorted.slice(start, start + pageSize), totalPages: Math.ceil(sorted.length / pageSize) };
  }, [sortKey, sortDir, page]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Beam</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <input value={from} onChange={(e)=>setFrom(e.target.value)} type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
          <input value={to} onChange={(e)=>setTo(e.target.value)} type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
          <input className="rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Min bunches" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <span>Sort by:</span>
          <select className="rounded-md border border-gray-200 px-2 py-1" value={sortKey} onChange={(e)=>setSortKey(e.target.value)}>
            <option value="date">Date</option>
            <option value="bunches">Bunches</option>
          </select>
          <button className="rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-50" onClick={()=>setSortDir(d=> d==='asc'?'desc':'asc')}>
            {sortDir === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-600">
              {['Date','Number of Bunches'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">{b.date}</td>
                <td className="px-4 py-3">{b.bunches}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-md border border-gray-200 px-3 py-1 hover:bg-gray-50 disabled:opacity-50">Prev</button>
          <button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="rounded-md border border-gray-200 px-3 py-1 hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
