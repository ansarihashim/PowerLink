import { useEffect, useMemo, useState } from "react";
import { api } from "../api/http.js";
import { formatDMY } from "../utils/date.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SortSelect from "../components/ui/SortSelect.jsx";
import DatePicker from "../components/ui/DatePicker.jsx";
import DateRangePicker from "../components/ui/DateRangePicker.jsx";
import { downloadCSV } from "../utils/export.js";

export default function Baana() {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter by date range
  useEffect(() => {
    let alive = true; setLoading(true); setError("");
    api.baana.list({ page, pageSize, from, to, sortBy: sortKey, sortDir })
      .then(r => { if(!alive) return; const data = r.data||[]; setRows(data.map(b => ({ ...b, id: b._id }))); const total = r.meta?.total || data.length; setTotalPages(Math.max(1, Math.ceil(total/pageSize))); })
      .catch(e => { if(alive) setError(e.message); })
      .finally(()=> alive && setLoading(false));
    return () => { alive = false; };
  }, [page, from, to, sortKey, sortDir]);

  // API handles sorting/paging.

  const exportCSV = () => {
    const columns = [
      { key: 'date', header: 'Date' },
      { key: 'sacks', header: 'Sacks' },
    ];
    const rowsToExport = rows.map((r) => ({
      ...r,
      date: formatDMY(r.date),
    }));
    downloadCSV({ filename: 'baana.csv', columns, rows: rowsToExport });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="h-6 w-1.5 rounded bg-teal-500" />
        <h2 className="text-xl font-semibold text-slate-900">Baana</h2>
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2">
          <DateRangePicker start={from} end={to} onChange={({ start, end }) => { setFrom(start || ""); setTo(end || ""); }} className="sm:col-span-2" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <span>Sort by:</span>
          <SortSelect
            value={sortKey}
            onChange={(e)=>setSortKey(e.target.value)}
            options={[
              { value: 'date', label: 'Date' },
              { value: 'sacks', label: 'Sacks' },
            ]}
          />
          <Button variant="outline" className="px-2 py-1" onClick={()=>setSortDir(d=> d==='asc'?'desc':'asc')}>
            {sortDir === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </div>
      </Card>
      <Card className="overflow-x-auto">
        <div className="flex items-center justify-end p-3">
          <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
        </div>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-700 text-white">
            <tr className="text-white">
              {['Date','Number of Sacks'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={2} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>}
            {error && !loading && <tr><td colSpan={2} className="px-4 py-6 text-center text-rose-600">{error}</td></tr>}
            {!loading && !error && rows.length === 0 && <tr><td colSpan={2} className="px-4 py-6 text-center text-slate-500">No baana records</td></tr>}
            {!loading && !error && rows.map((b, idx) => (
              <tr key={b.id} className={`transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <td className="px-4 py-3">{b.date ? formatDMY(b.date) : ''}</td>
                <td className="px-4 py-3">{b.sacks}</td>
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
