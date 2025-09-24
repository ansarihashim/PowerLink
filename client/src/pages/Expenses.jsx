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
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";
import Select from "../components/ui/Select.jsx";
import Spinner from "../components/ui/Spinner.jsx";

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
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['expenses', { page, pageSize, from, to, sortKey, sortDir, category }],
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    queryFn: () => {
      const params = { page, pageSize, from, to, sortBy: sortKey, sortDir };
      if (category !== 'all') params.category = category;
      return api.expenses.list(params);
    }
  });
  const rows = (data?.data || []).map(e => ({ ...e, id: e._id }));
  const totalPages = Math.max(1, Math.ceil(((data?.meta?.total) || rows.length) / pageSize));
  const { push } = useToast();

  // Add/Edit state
  const categories = ['tea','workshop','mistary','mukadam','maintenance','other'];
  const [editing, setEditing] = useState(null); // expense object or null or 'new'
  const [form, setForm] = useState({ category: 'tea', amount: '', date: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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

  function openAdd(){
    setEditing('new');
    setForm({ category: 'tea', amount: '', date: new Date().toISOString().slice(0,10) });
  }
  function openEdit(exp){
    setEditing(exp);
    setForm({ category: exp.category, amount: exp.amount, date: exp.date?.slice(0,10) || '' });
  }
  async function save(e){
    e.preventDefault(); if(!editing) return; setSaving(true);
    try {
      const payload = { category: form.category, amount: Number(form.amount), date: form.date };
      if(editing === 'new') {
        await api.expenses.create(payload);
        push({ type:'success', title:'Expense Added', message:'New expense created.' });
      } else {
        await api.expenses.update(editing.id || editing._id, payload);
        push({ type:'success', title:'Expense Updated', message:'Changes saved.' });
      }
      setEditing(null); setSaving(false);
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      window.dispatchEvent(new Event('expenses:changed'));
    } catch(err){
      push({ type:'error', title:'Save Failed', message: err.message });
      setSaving(false);
    }
  }
  function startDelete(id){ setDeleteId(id); }
  function confirmDelete(){ if(!deleteId) return; deleteMutation.mutate(deleteId, { onSuccess:()=> { push({ type:'success', title:'Expense Deleted', message:'Expense removed.' }); setDeleteId(null); window.dispatchEvent(new Event('expenses:changed')); }, onError:(e)=> { push({ type:'error', title:'Delete Failed', message:e.message }); setDeleteId(null); } }); }
  function cancelDelete(){ setDeleteId(null); }

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
            <div className="flex items-center justify-end gap-2 p-3">
              <Button onClick={openAdd} className="bg-teal-600 text-white hover:bg-teal-700">Add Expense</Button>
              <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
            </div>
            <div className="relative">
            <table className="min-w-full divide-y divide-gray-200 text-sm transition-opacity duration-200" style={{ opacity: isFetching && rows.length ? 0.55 : 1 }}>
              <thead className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-700 text-white">
                <tr className="text-white">
                  {['Category','Amount','Date','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && rows.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>}
                {error && rows.length === 0 && !isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-rose-600">{error.message}</td></tr>}
                {!isLoading && !error && rows.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No expenses</td></tr>}
                {rows.map((e, idx) => (
                  <ExpenseRow key={e.id} expense={e} idx={idx} onEdit={openEdit} onDelete={startDelete} />
                ))}
              </tbody>
            </table>
            {isFetching && rows.length > 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Spinner size={28} className="drop-shadow" />
              </div>
            )}
            </div>
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
      <Modal isOpen={!!editing} onClose={()=> !saving && setEditing(null)} title={editing==='new' ? 'Add Expense' : 'Edit Expense'} size="sm">
        {editing && (
          <form onSubmit={save} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <Select
                value={form.category}
                onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                options={categories.map(c => ({ value: c, label: c }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
              <input type="number" min={0} value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=> !saving && setEditing(null)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-600 hover:bg-slate-50">Cancel</button>
              <button disabled={saving} className="rounded-md bg-teal-600 px-5 py-2 text-white text-sm font-medium shadow hover:bg-teal-700 disabled:opacity-60">{saving ? 'Saving...' : (editing==='new' ? 'Add Expense' : 'Save Changes')}</button>
            </div>
          </form>
        )}
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        title="Delete expense?"
        message="This action cannot be undone."
        tone="danger"
        confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}


function ExpenseRow({ expense, idx, onEdit, onDelete }) {
  return (
    <tr className={`transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
      <td className="px-4 py-3">{expense.category}</td>
      <td className="px-4 py-3">{Number(expense.amount||0).toLocaleString()}</td>
      <td className="px-4 py-3">{expense.date ? formatDMY(expense.date) : ''}</td>
      <td className="px-4 py-2 text-xs">
        <div className="flex gap-2">
          <button onClick={()=>onEdit(expense)} className="rounded border px-2 py-1 hover:bg-teal-50 border-teal-200 text-teal-700">Edit</button>
          <button onClick={()=>onDelete(expense.id)} className="rounded border px-2 py-1 hover:bg-rose-50 border-rose-200 text-rose-600">Delete</button>
        </div>
      </td>
    </tr>
  );
}
