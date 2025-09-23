import { useEffect, useMemo, useState } from "react";
import { beam as seed } from "../data/beam.js";
import { formatDMY } from "../utils/date.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SortSelect from "../components/ui/SortSelect.jsx";
import DatePicker from "../components/ui/DatePicker.jsx";
import DateRangePicker from "../components/ui/DateRangePicker.jsx";
import { downloadCSV } from "../utils/export.js";

export default function Beam() {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtered, setFiltered] = useState(seed);

  // Filter by date range
  useEffect(() => {
    const fromD = from ? new Date(from) : null;
    const toD = to ? new Date(to) : null;
    const rows = seed.filter((r) => {
      const d = new Date(r.date);
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

  const exportCSV = () => {
    const columns = [
      { key: 'date', header: 'Date' },
      { key: 'bunches', header: 'Bunches' },
    ];
    const rowsToExport = filtered.map((r) => ({
      ...r,
      date: formatDMY(r.date),
    }));
    downloadCSV({ filename: 'beam.csv', columns, rows: rowsToExport });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
  <span className="h-6 w-1.5 rounded bg-teal-500" />
        <h2 className="text-xl font-semibold text-slate-900">Beam</h2>
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
              { value: 'bunches', label: 'Bunches' },
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
              {['Date','Number of Bunches'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((b, idx) => (
              <tr key={b.id} className={`transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <td className="px-4 py-3">{formatDMY(b.date)}</td>
                <td className="px-4 py-3">{b.bunches}</td>
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
