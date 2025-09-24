import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/http.js";
import { formatDMY } from "../utils/date.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SortSelect from "../components/ui/SortSelect.jsx";
import DatePicker from "../components/ui/DatePicker.jsx";
import DateRangePicker from "../components/ui/DateRangePicker.jsx";
import { downloadCSV } from "../utils/export.js";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Expenses() {
  const [searchParams] = useSearchParams();
  const initialFrom = searchParams.get('from') || "";
  const initialTo = searchParams.get('to') || "";
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [category, setCategory] = useState("all");
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', { page, pageSize, from, to, sortKey, sortDir, category }],
    queryFn: () => {
      const params = { page, pageSize, from, to, sortBy: sortKey, sortDir };
      if (category !== 'all') params.category = category;
      return api.expenses.list(params);
    }
  });
  const rows = (data?.data || []).map(e => ({ ...e, id: e._id }));
  const totalPages = Math.max(1, Math.ceil(((data?.meta?.total) || rows.length) / pageSize));
  const deleteMutation = useMutation({
    mutationFn: (id) => api.expenses.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['expenses'] });
      const prev = queryClient.getQueriesData({ queryKey: ['expenses'] });
      queryClient.setQueryData(['expenses', { page, pageSize, from, to, sortKey, sortDir, category }], (old) => {
        if (!old) return old;
        return { ...old, data: (old.data||[]).filter(e => e._id !== id) };
      });
      return { prev };
    },
    onError: (_e,_id,ctx) => ctx?.prev?.forEach(([k,v]) => queryClient.setQueryData(k, v)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  });

  const total = rows.reduce((s, e) => s + (e.amount||0), 0);

  const exportCSV = () => {
    const columns = [
      { key: 'category', header: 'Category' },
      { key: 'amount', header: 'Amount' },
      { key: 'date', header: 'Date' },
    ];
    const rowsToExport = rows.map(e => ({
      ...e,
      date: formatDMY(e.date),
    }));
    downloadCSV({ filename: 'expenses.csv', columns, rows: rowsToExport });
  };

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
              <DateRangePicker start={from} end={to} onChange={({ start, end }) => { setFrom(start || ""); setTo(end || ""); }} className="md:col-span-2" />
              <SortSelect
                value={category}
                onChange={(e)=>setCategory(e.target.value)}
                options={[
                  { value: 'all', label: 'All categories' },
                  { value: 'tea', label: 'tea' },
                  { value: 'workshop', label: 'workshop' },
                  { value: 'mistary', label: 'mistary' },
                  { value: 'mukadam', label: 'mukadam' },
                  { value: 'maintenance', label: 'maintenance' },
                  { value: 'other', label: 'other' },
                ]}
                className="px-3 py-2"
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <span>Sort by:</span>
              <SortSelect
                value={sortKey}
                onChange={(e)=>setSortKey(e.target.value)}
                options={[
                  { value: 'date', label: 'Date' },
                  { value: 'amount', label: 'Amount' },
                  { value: 'category', label: 'Category' },
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
                  {['Category','Amount','Date','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>}
                {error && !isLoading && <tr><td colSpan={3} className="px-4 py-6 text-center text-rose-600">{error.message}</td></tr>}
                {!isLoading && !error && rows.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No expenses</td></tr>}
                {!isLoading && !error && rows.map((e, idx) => (
                  <ExpenseRow key={e.id} expense={e} idx={idx} />
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


function ExpenseRow({ expense, idx }) {
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => api.expenses.remove(expense.id),
    onMutate: async () => {
      if (!confirm('Delete this expense?')) return Promise.reject('cancel');
      await queryClient.cancelQueries({ queryKey: ['expenses'] });
      const prev = queryClient.getQueriesData({ queryKey: ['expenses'] });
      prev.forEach(([key, val]) => {
        if (val?.data) queryClient.setQueryData(key, { ...val, data: val.data.filter(e => e._id !== expense.id) });
      });
      return { prev };
    },
    onError: (_e,_v,ctx) => ctx?.prev?.forEach(([k,v]) => queryClient.setQueryData(k, v)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  });
  const deleting = mutation.isPending;
  const onDelete = () => mutation.mutate();
  return (
    <tr className={`transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
      <td className="px-4 py-3">{expense.category}</td>
      <td className="px-4 py-3">{Number(expense.amount||0).toLocaleString()}</td>
      <td className="px-4 py-3">{expense.date ? formatDMY(expense.date) : ''}</td>
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
