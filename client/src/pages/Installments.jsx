import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/http.js";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDMY } from "../utils/date.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SortSelect from "../components/ui/SortSelect.jsx";
import DatePicker from "../components/ui/DatePicker.jsx";
import DateRangePicker from "../components/ui/DateRangePicker.jsx";
import { downloadCSV } from "../utils/export.js";

export default function Installments() {
  const [searchParams] = useSearchParams();
  const initialFrom = searchParams.get('from') || "";
  const initialTo = searchParams.get('to') || "";
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['installments', { page, pageSize, from, to, sortKey, sortDir }],
    queryFn: () => api.installments.list({ page, pageSize, from, to, sortBy: sortKey, sortDir })
  });
  const rows = (data?.data || []).map(i => ({ ...i, id: i._id }));
  const totalPages = Math.max(1, Math.ceil(((data?.meta?.total) || rows.length) / pageSize));

  const deleteMutation = useMutation({
    mutationFn: (id) => api.installments.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['installments'] });
      const prev = queryClient.getQueriesData({ queryKey: ['installments'] });
      queryClient.setQueryData(['installments', { page, pageSize, from, to, sortKey, sortDir }], (old) => {
        if (!old) return old;
        return { ...old, data: (old.data||[]).filter(i => i._id !== id) };
      });
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([k,v]) => queryClient.setQueryData(k, v));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['installments'] })
  });

  // API handles sorting/paging.

  const exportCSV = () => {
    const columns = [
      { key: 'loanId', header: 'Loan ID' },
      { key: 'worker', header: 'Worker' },
      { key: 'amount', header: 'Installment Amount' },
      { key: 'date', header: 'Date Paid' },
    ];
    const rowsToExport = rows.map(i => ({
      ...i,
      date: formatDMY(i.date),
    }));
    downloadCSV({ filename: 'installments.csv', columns, rows: rowsToExport });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
  <span className="h-6 w-1.5 rounded bg-teal-500" />
        <h2 className="text-xl font-semibold text-slate-900">Installments</h2>
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
              { value: 'amount', label: 'Amount' },
              { value: 'loanId', label: 'Loan ID' },
              { value: 'worker', label: 'Worker' },
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
              {['Loan','Worker','Amount','Date Paid','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>}
            {error && !isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-rose-600">{error.message}</td></tr>}
            {!isLoading && !error && rows.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No installments</td></tr>}
            {!loading && !error && rows.map((i, idx) => (
              <InstallmentRow key={i.id} inst={i} idx={idx} />
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


function InstallmentRow({ inst, idx }) {
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => api.installments.remove(inst.id),
    onMutate: async () => {
      if (!confirm('Delete this installment?')) return Promise.reject('cancel');
      await queryClient.cancelQueries({ queryKey: ['installments'] });
      const prev = queryClient.getQueriesData({ queryKey: ['installments'] });
      prev.forEach(([key, val]) => {
        if (val?.data) queryClient.setQueryData(key, { ...val, data: val.data.filter(i => i._id !== inst.id) });
      });
      return { prev };
    },
    onError: (_e,_v,ctx) => ctx?.prev?.forEach(([k,v]) => queryClient.setQueryData(k, v)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['installments'] })
  });
  const deleting = mutation.isPending;
  const onDelete = () => mutation.mutate();
  return (
    <tr className={`transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
      <td className="px-4 py-3">{inst.loanId}</td>
      <td className="px-4 py-3">{inst.workerName || inst.workerId || ''}</td>
      <td className="px-4 py-3">{Number(inst.amount||0).toLocaleString()}</td>
      <td className="px-4 py-3">{inst.date ? formatDMY(inst.date) : ''}</td>
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
