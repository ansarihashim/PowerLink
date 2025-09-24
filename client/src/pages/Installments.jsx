import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/http.js";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";
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

  const { push } = useToast();

  const [editing, setEditing] = useState(null); // installment object or 'new'
  const [form, setForm] = useState({ loanId: '', workerName: '', amount: '', date: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // For loan dropdown we need loans list (simpler: fetch on open)
  const [loans, setLoans] = useState([]);
  useEffect(()=> {
    if(editing){
      // fetch loans list once when a modal opens
      api.loans.list({ page:1, pageSize:100, sortBy:'loanDate', sortDir:'desc' }).then(r => {
        const data = r.data||[]; setLoans(data.map(l => ({ id:l._id, workerName:l.workerName, amount:l.amount, remaining:l.remaining }))); });
    }
  }, [editing]);

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
    onError: (_e, _id, ctx) => ctx?.prev?.forEach(([k,v]) => queryClient.setQueryData(k, v)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['installments'] })
  });

  function openAdd(){ setEditing('new'); setForm({ loanId:'', workerName:'', amount:'', date:new Date().toISOString().slice(0,10) }); }
  function openEdit(inst){ setEditing(inst); setForm({ loanId: inst.loanId, workerName: inst.workerName || '', amount: inst.amount, date: inst.date?.slice(0,10) || '' }); }
  async function save(e){
    e.preventDefault(); if(!editing) return; setSaving(true);
    try {
      const payload = { loanId: form.loanId, amount: Number(form.amount), date: form.date };
      if(editing === 'new') { await api.installments.create(payload); push({ type:'success', title:'Installment Added', message:'New installment recorded.' }); }
      else { await api.installments.update(editing.id || editing._id, payload); push({ type:'success', title:'Installment Updated', message:'Changes saved.' }); }
      setEditing(null); setSaving(false);
      queryClient.invalidateQueries({ queryKey: ['installments'] });
    } catch(err){ push({ type:'error', title:'Save Failed', message: err.message }); setSaving(false); }
  }
  function startDelete(id){ setDeleteId(id); }
  function confirmDelete(){ if(!deleteId) return; deleteMutation.mutate(deleteId, { onSuccess:()=> { push({ type:'success', title:'Installment Deleted', message:'Installment removed.' }); setDeleteId(null); }, onError:(e)=> { push({ type:'error', title:'Delete Failed', message:e.message }); setDeleteId(null); } }); }
  function cancelDelete(){ setDeleteId(null); }

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
        <div className="flex items-center justify-end gap-2 p-3">
          <Button onClick={openAdd} className="bg-teal-600 text-white hover:bg-teal-700">Add Installment</Button>
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
            {!isLoading && !error && rows.map((i, idx) => (
              <InstallmentRow key={i.id} inst={i} idx={idx} onEdit={openEdit} onDelete={startDelete} />
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
      <Modal isOpen={!!editing} onClose={()=> !saving && setEditing(null)} title={editing==='new' ? 'Add Installment' : 'Edit Installment'} size="sm">
        {editing && (
          <form onSubmit={save} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Loan</label>
              <select value={form.loanId} onChange={e=>setForm(f=>({...f,loanId:e.target.value}))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="">Select loan</option>
                {loans.map(l => <option key={l.id} value={l.id}>{l.workerName || 'Worker'} — {Number(l.amount||0).toLocaleString()} (rem {Number(l.remaining||0).toLocaleString()})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
              <input type="number" min={0} value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date Paid</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=> !saving && setEditing(null)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-600 hover:bg-slate-50">Cancel</button>
              <button disabled={saving} className="rounded-md bg-teal-600 px-5 py-2 text-white text-sm font-medium shadow hover:bg-teal-700 disabled:opacity-60">{saving ? 'Saving...' : (editing==='new' ? 'Add Installment' : 'Save Changes')}</button>
            </div>
          </form>
        )}
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        title="Delete installment?"
        message="This action cannot be undone."
        tone="danger"
        confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}


function InstallmentRow({ inst, idx, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
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
              <button className="w-full px-3 py-2 text-left hover:bg-teal-50" onClick={()=> { setShowMenu(false); onEdit(inst); }}>Edit</button>
              <button className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600" onClick={()=> { setShowMenu(false); onDelete(inst.id); }}>Delete</button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
