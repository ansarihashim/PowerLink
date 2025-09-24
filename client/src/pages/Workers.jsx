import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SortSelect from "../components/ui/SortSelect.jsx";
import DatePicker from "../components/ui/DatePicker.jsx";
import DateRangePicker from "../components/ui/DateRangePicker.jsx";
// Seed import removed; now data comes from API
import { api } from "../api/http.js";
import { formatDMY } from "../utils/date.js";
import { downloadCSV } from "../utils/export.js";

export default function Workers() {
  const [searchParams] = useSearchParams();
  const initialFrom = searchParams.get('from') || "";
  const initialTo = searchParams.get('to') || "";
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [q, setQ] = useState("");
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true); setError("");
    const params = { page, pageSize, q, from, to, sortBy: sortKey, sortDir };
    api.workers.list(params)
      .then(r => {
        if (!alive) return;
        const data = r.data || [];
        setRows(data.map(w => ({
          ...w,
          id: w._id,
          totalLoan: w.totalLoan ?? 0,
          remainingLoan: w.remainingLoan ?? 0,
        })));
        const total = r.meta?.total || data.length;
        setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
      })
      .catch(e => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [page, q, from, to, sortKey, sortDir]);

  // Client-side sorting removed (handled by API). rows already represent current page.

  const exportCSV = () => {
    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'phone', header: 'Phone' },
      { key: 'address', header: 'Address' },
      { key: 'joiningDate', header: 'Joining Date' },
      { key: 'totalLoan', header: 'Loan Taken' },
      { key: 'remainingLoan', header: 'Remaining Loan Amount' },
    ];
    // For CSV export fetch a larger page to include more rows (simple approach)
    const rowsToExport = rows.map(w => ({
      ...w,
      joiningDate: formatDMY(w.joiningDate),
    }));
    downloadCSV({ filename: 'workers.csv', columns, rows: rowsToExport });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
  <span className="h-6 w-1.5 rounded bg-teal-500" />
        <h2 className="text-xl font-semibold text-slate-900">Workers</h2>
      </div>
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <input value={q} onChange={(e)=>setQ(e.target.value)} className="rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all duration-200" placeholder="Search by name" />
          <DateRangePicker start={from} end={to} onChange={({ start, end }) => { setFrom(start || ""); setTo(end || ""); }} className="md:col-span-2" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <span>Sort by:</span>
          <SortSelect
            value={sortKey}
            onChange={(e)=>setSortKey(e.target.value)}
            options={[
              { value: 'name', label: 'Name' },
              { value: 'joiningDate', label: 'Joining Date' },
              { value: 'totalLoan', label: 'Loan' },
              { value: 'remainingLoan', label: 'Remaining' },
            ]}
          />
          <Button variant="outline" className="px-2 py-1" onClick={()=>setSortDir(d=> d==='asc'?'desc':'asc')}>
            {sortDir === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </div>
      </Card>
      {/* Table */}
      <Card className="overflow-x-auto">
        <div className="flex items-center justify-end p-3">
          <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
        </div>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-700 text-white">
            <tr className="text-white">
              {['ID','Name','Phone Number','Address','Joining Date','Loan Taken','Remaining Loan Amount'].map(h=> (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-rose-600">{error}</td></tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No workers found</td></tr>
            )}
            {!loading && !error && rows.map((w, idx) => (
              <tr
                key={w.id}
                className={`cursor-pointer transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                onClick={() => window.location.href = `/workers/${w.id}`}
              >
                <td className="px-4 py-3">{w.id}</td>
                <td className="px-4 py-3">{w.name}</td>
                <td className="px-4 py-3">{w.phone}</td>
                <td className="px-4 py-3">{w.address}</td>
                <td className="px-4 py-3">{w.joiningDate ? formatDMY(w.joiningDate) : ''}</td>
                <td className="px-4 py-3">{Number(w.totalLoan||0).toLocaleString()}</td>
                <td className="px-4 py-3">{Number(w.remainingLoan||0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {/* Pagination placeholder */}
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
