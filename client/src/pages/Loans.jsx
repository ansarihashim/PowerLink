import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SortSelect from "../components/ui/SortSelect.jsx";
import DatePicker from "../components/ui/DatePicker.jsx";
import DateRangePicker from "../components/ui/DateRangePicker.jsx";
import { api } from "../api/http.js";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDMY } from "../utils/date.js";
import { downloadCSV } from "../utils/export.js";

export default function Loans() {
  const [searchParams] = useSearchParams();
  const initialFrom = searchParams.get('from') || "";
  const initialTo = searchParams.get('to') || "";
  const [sortKey, setSortKey] = useState("loanDate");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['loans', { page, pageSize, from, to, sortKey, sortDir }],
    queryFn: () => api.loans.list({ page, pageSize, from, to, sortBy: sortKey, sortDir })
  });
  const rows = (data?.data || []).map(l => ({ ...l, id: l._id }));
  // Group loans by worker to display all loans per worker row
  const grouped = rows.reduce((acc, loan) => {
    const key = loan.workerId || loan.workerName || 'unknown';
    if(!acc[key]) acc[key] = { workerId: loan.workerId, workerName: loan.workerName, loans: [] };
    acc[key].loans.push(loan);
    return acc;
  }, {});
  const groupedList = Object.values(grouped);
  const totalPages = Math.max(1, Math.ceil(((data?.meta?.total) || rows.length) / pageSize));

  const deleteMutation = useMutation({
    mutationFn: (id) => api.loans.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['loans'] });
      const prev = queryClient.getQueriesData({ queryKey: ['loans'] });
      queryClient.setQueriesData({ queryKey: ['loans'] }, (oldArr) => {
        if (!oldArr) return oldArr;
        if (Array.isArray(oldArr)) return oldArr; // unexpected shape
        // For each cached variant update
        return oldArr;
      });
      // simpler: directly update specific key
      queryClient.setQueryData(['loans', { page, pageSize, from, to, sortKey, sortDir }], (old) => {
        if (!old) return old;
        return { ...old, data: (old.data||[]).filter(l => l._id !== id) };
      });
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([key, val]) => queryClient.setQueryData(key, val));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    }
  });

  // Sorting handled by API

  const exportCSV = () => {
    const columns = [
      { key: 'workerId', header: 'Worker ID' },
      { key: 'amount', header: 'Loan Amount' },
      { key: 'loanDate', header: 'Loan Date' },
      { key: 'remaining', header: 'Remaining Loan' },
      { key: 'reason', header: 'Reason' },
    ];
    const rowsToExport = rows.map(l => ({
      ...l,
      loanDate: formatDMY(l.loanDate),
    }));
    downloadCSV({ filename: 'loans.csv', columns, rows: rowsToExport });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
  <span className="h-6 w-1.5 rounded bg-teal-500" />
        <h2 className="text-xl font-semibold text-slate-900">Loans</h2>
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2">
          <DateRangePicker
            start={from}
            end={to}
            onChange={({ start, end }) => { setFrom(start || ""); setTo(end || ""); }}
            className="sm:col-span-2 md:col-span-2"
          />
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
        <div className="flex items-center justify-end p-3">
          <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
        </div>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-700 text-white">
            <tr className="text-white">
              <th className="px-4 py-3 text-left font-medium">Worker</th>
              <th className="px-4 py-3 text-left font-medium">Loans (All)</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>}
            {error && !isLoading && <tr><td colSpan={3} className="px-4 py-6 text-center text-rose-600">{error.message}</td></tr>}
            {!isLoading && !error && groupedList.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No loans</td></tr>}
            {!isLoading && !error && groupedList.map((g, idx) => (
              <GroupedLoanRow key={g.workerId || idx} group={g} idx={idx} />
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


function GroupedLoanRow({ group, idx }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <tr className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
      <td className="px-4 py-3 align-top">
        <div className="flex items-start gap-2">
          <button onClick={()=> setExpanded(e=>!e)} className="mt-0.5 rounded border border-teal-300 px-2 py-0.5 text-xs text-teal-700 hover:bg-teal-50">{expanded ? '-' : '+'}</button>
          <div>
            <div className="font-medium">{group.workerName || group.workerId}</div>
            <div className="text-[11px] text-slate-500">{group.loans.length} loan{group.loans.length!==1 && 's'}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {!expanded && (
          <div className="text-xs text-slate-600">Expand to view all loans</div>
        )}
        {expanded && (
          <div className="space-y-2">
            {group.loans.map(l => (
              <div key={l.id} className="rounded border border-teal-100 bg-teal-50 px-3 py-2">
                <div className="flex flex-wrap gap-4 text-[11px] text-teal-800">
                  <span><strong>Amount:</strong> {Number(l.amount||0).toLocaleString()}</span>
                  <span><strong>Date:</strong> {l.loanDate ? formatDMY(l.loanDate) : ''}</span>
                  <span><strong>Remaining:</strong> {Number(l.remaining||0).toLocaleString()}</span>
                  {l.notes && <span><strong>Notes:</strong> {l.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-xs align-top">
        <div className="flex gap-2">
          <button className="rounded border px-2 py-1 hover:bg-teal-50 border-teal-200 text-teal-700" onClick={()=> alert('Edit worker loans TBD')}>Edit</button>
          <button className="rounded border px-2 py-1 hover:bg-rose-50 border-rose-200 text-rose-600" onClick={()=> alert('Bulk delete TBD')}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

// helper to avoid TS complaints (placeholder) - runtime no-op
function expectKeyShape() { return {}; }
