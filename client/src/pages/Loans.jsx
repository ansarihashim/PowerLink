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
              {['Worker','Loan Amount','Loan Date','Remaining','Reason','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>}
            {error && !isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-rose-600">{error.message}</td></tr>}
            {!isLoading && !error && rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No loans</td></tr>}
            {!loading && !error && rows.map((l, idx) => (
              <LoanRow key={l.id} loan={l} idx={idx} />
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


function LoanRow({ loan, idx }) {
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => api.loans.remove(loan.id),
    onMutate: async () => {
      if (!confirm('Delete this loan?')) return Promise.reject('cancel');
      await queryClient.cancelQueries({ queryKey: ['loans'] });
      const prev = queryClient.getQueriesData({ queryKey: ['loans'] });
      queryClient.setQueryData(['loans', expectKeyShape(queryClient)], (old)=>old); // noop safety
      // optimistic removal across variants
      prev.forEach(([key, val]) => {
        if (val && val.data) {
          queryClient.setQueryData(key, { ...val, data: val.data.filter(l => l._id !== loan.id) });
        }
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([k,v]) => queryClient.setQueryData(k, v));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['loans'] })
  });
  const deleting = deleteMutation.isPending;
  const onDelete = () => deleteMutation.mutate();
  return (
    <tr className={`transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
      <td className="px-4 py-3">{loan.workerName || loan.workerId}</td>
      <td className="px-4 py-3">{Number(loan.amount||0).toLocaleString()}</td>
      <td className="px-4 py-3">{loan.loanDate ? formatDMY(loan.loanDate) : ''}</td>
      <td className="px-4 py-3">{Number(loan.remaining||0).toLocaleString()}</td>
      <td className="px-4 py-3">{loan.notes || loan.reason || ''}</td>
      <td className="px-4 py-3 text-xs">
        <div className="relative inline-block">
          <button onClick={()=> setShowMenu(s=>!s)} className="rounded border px-2 py-1 hover:bg-teal-50">⋮</button>
          {showMenu && (
            <div className="absolute right-0 z-10 mt-1 w-32 rounded-md border border-slate-200 bg-white shadow-md text-[11px]">
              <button className="w-full px-3 py-2 text-left hover:bg-teal-50" onClick={()=> alert('Edit form TBD')}>Edit</button>
              <button className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 disabled:opacity-50" onClick={onDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// helper to avoid TS complaints (placeholder) - runtime no-op
function expectKeyShape() { return {}; }
