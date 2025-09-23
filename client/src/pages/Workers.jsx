import { useEffect, useMemo, useState } from "react";
import { workers as seed } from "../data/workers.js";

export default function Workers() {
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtered, setFiltered] = useState(seed);

  useEffect(() => {
    const fromD = from ? new Date(from) : null;
    const toD = to ? new Date(to) : null;
    const rows = seed.filter((w) => {
      const nameOk = q ? w.name.toLowerCase().includes(q.toLowerCase()) : true;
      const d = new Date(w.joiningDate);
      const fromOk = fromD ? d >= fromD : true;
      const toOk = toD ? d <= toD : true;
      return nameOk && fromOk && toOk;
    });
    setFiltered(rows);
    setPage(1);
  }, [q, from, to]);

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
      <h2 className="text-xl font-semibold text-gray-900">Workers</h2>
      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <input value={q} onChange={(e)=>setQ(e.target.value)} className="rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Search by name" />
          <input value={from} onChange={(e)=>setFrom(e.target.value)} type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
          <input value={to} onChange={(e)=>setTo(e.target.value)} type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <span>Sort by:</span>
          <select className="rounded-md border border-gray-200 px-2 py-1" value={sortKey} onChange={(e)=>setSortKey(e.target.value)}>
            <option value="name">Name</option>
            <option value="joiningDate">Joining Date</option>
            <option value="totalLoan">Loan</option>
            <option value="remainingLoan">Remaining</option>
          </select>
          <button className="rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-50" onClick={()=>setSortDir(d=> d==='asc'?'desc':'asc')}>
            {sortDir === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-600">
              {['ID','Name','Phone Number','Address','Joining Date','Loan Taken','Remaining Loan Amount'].map(h=> (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((w) => (
              <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">{w.id}</td>
                <td className="px-4 py-3">{w.name}</td>
                <td className="px-4 py-3">{w.phone}</td>
                <td className="px-4 py-3">{w.address}</td>
                <td className="px-4 py-3">{w.joiningDate}</td>
                <td className="px-4 py-3">{w.totalLoan.toLocaleString()}</td>
                <td className="px-4 py-3">{w.remainingLoan.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination placeholder */}
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
