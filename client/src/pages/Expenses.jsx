import { useEffect, useMemo, useState } from "react";
import { expenses as seed } from "../data/expenses.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function Expenses() {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [category, setCategory] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtered, setFiltered] = useState(seed);

  useEffect(() => {
    const fromD = from ? new Date(from) : null;
    const toD = to ? new Date(to) : null;
    const rows = seed.filter((e) => {
      const catOk = category === 'all' ? true : e.category === category;
      const d = new Date(e.date);
      const fromOk = fromD ? d >= fromD : true;
      const toOk = toD ? d <= toD : true;
      return catOk && fromOk && toOk;
    });
    setFiltered(rows);
    setPage(1);
  }, [category, from, to]);

  const { rows, totalPages, total } = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    const start = (page - 1) * pageSize;
    const pageRows = sorted.slice(start, start + pageSize);
    const total = filtered.reduce((s, e) => s + e.amount, 0);
    return { rows: pageRows, totalPages: Math.ceil(sorted.length / pageSize), total };
  }, [filtered, sortKey, sortDir, page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
  <span className="h-6 w-1.5 rounded bg-teal-500" />
        <h2 className="text-xl font-semibold text-slate-900">Expenses</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <input value={from} onChange={(e)=>setFrom(e.target.value)} type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200" />
              <input value={to} onChange={(e)=>setTo(e.target.value)} type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200" />
              <select value={category} onChange={(e)=>setCategory(e.target.value)} className="rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200">
                <option value="all">All categories</option>
                <option value="tea">tea</option>
                <option value="workshop">workshop</option>
                <option value="mistary">mistary</option>
                <option value="mukadam">mukadam</option>
                <option value="maintenance">maintenance</option>
                <option value="other">other</option>
              </select>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <span>Sort by:</span>
              <select className="rounded-md border border-gray-200 px-2 py-1 hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200" value={sortKey} onChange={(e)=>setSortKey(e.target.value)}>
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
              </select>
              <Button variant="outline" className="px-2 py-1" onClick={()=>setSortDir(d=> d==='asc'?'desc':'asc')}>
                {sortDir === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </div>
          </Card>
          {/* Table */}
          <Card className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-700 text-white">
                <tr className="text-white">
                  {['Category','Amount','Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((e, idx) => (
                  <tr key={e.id} className={`transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <td className="px-4 py-3">{e.category}</td>
                    <td className="px-4 py-3">{e.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{e.date}</td>
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
        <aside>
          <Card className="border-teal-200 bg-teal-50 p-4">
          <h3 className="text-base font-semibold text-teal-800">Summary</h3>
          <div className="mt-3 rounded-lg border border-teal-200 bg-teal-100 p-4 text-sm text-teal-800">
            Total Expenses (all): <span className="font-semibold">{total.toLocaleString()}</span>
          </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
