import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SortSelect from "../components/ui/SortSelect.jsx";
import DatePicker from "../components/ui/DatePicker.jsx";
import DateRangePicker from "../components/ui/DateRangePicker.jsx";
import ThemedCalendarInput from "../components/ui/ThemedCalendarInput.jsx";
import { api } from "../api/http.js";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDMY } from "../utils/date.js";
import { downloadCSV } from "../utils/export.js";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";
import Select from "../components/ui/Select.jsx";
import Spinner from "../components/ui/Spinner.jsx";

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
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['loans', { page, pageSize, from, to, sortKey, sortDir }],
    keepPreviousData: true,
    refetchOnWindowFocus: false,
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

  // Edit/Delete state
  const [editing, setEditing] = useState(null); // loan object
  const [editForm, setEditForm] = useState({ amount:'', loanDate:'', notes:'' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { push } = useToast();
  // Create modal state
  const [creating, setCreating] = useState(false);
  const today = new Date().toISOString().slice(0,10);
  const [createForm, setCreateForm] = useState({ workerId: '', amount: '', loanDate: today, notes: '' });
  const [createSaving, setCreateSaving] = useState(false);
  const [workers, setWorkers] = useState([]);

  function openEdit(loan){
    setEditing(loan);
    setEditForm({ amount: loan.amount, loanDate: loan.loanDate?.slice(0,10) || '', notes: loan.notes || '' });
  }

  function openCreate(){
    setCreating(true);
    setCreateForm({ workerId: '', amount: '', loanDate: today, notes: '' });
    // fetch workers (simple one-shot list)
    api.workers.list({ page:1, pageSize:100, sortBy:'name', sortDir:'asc' })
      .then(r => { setWorkers((r.data||[]).map(w => ({ id: w._id, name: w.name }))); })
      .catch(e => { push({ type:'error', title:'Load Workers Failed', message: e.message }); });
  }

  async function saveCreate(e){
    e.preventDefault(); if(createSaving) return;
    try {
      if(!createForm.workerId) throw new Error('Worker required');
      if(!createForm.amount) throw new Error('Amount required');
      if(!createForm.loanDate) throw new Error('Loan date required');
      setCreateSaving(true);
      const payload = { workerId: createForm.workerId, amount: Number(createForm.amount), loanDate: createForm.loanDate, notes: createForm.notes };
      await api.loans.create(payload);
      push({ type:'success', title:'Loan Added', message:'New loan created.' });
      setCreating(false); setCreateSaving(false);
      queryClient.invalidateQueries({ queryKey:['loans'] });
    } catch(err){
      push({ type:'error', title:'Create Failed', message: err.message });
      setCreateSaving(false);
    }
  }

  async function saveEdit(e){
    e.preventDefault(); if(!editing) return; setSaving(true);
    try {
      const payload = { amount: Number(editForm.amount), loanDate: editForm.loanDate, notes: editForm.notes };
      await api.loans.update(editing.id || editing._id, payload);
      push({ type:'success', title:'Loan Updated', message:'Changes saved.' });
      setEditing(null); setSaving(false);
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    } catch(err){
      push({ type:'error', title:'Update Failed', message: err.message });
      setSaving(false);
    }
  }

  async function confirmDelete(){
    if(!deleteId) return; try {
      await api.loans.remove(deleteId);
      push({ type:'success', title:'Loan Deleted', message:'Loan removed.' });
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    } catch(err){
      push({ type:'error', title:'Delete Failed', message: err.message });
      setDeleteId(null);
    }
  }
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
        <div className="flex items-center justify-end gap-2 p-3">
          <Button onClick={openCreate} className="bg-teal-600 text-white hover:bg-teal-700">Add Loan</Button>
          <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
        </div>
  <div className="relative">
  <table className="min-w-full divide-y divide-gray-200 text-sm transition-opacity duration-200" style={{ opacity: isFetching && rows.length ? 0.55 : 1 }}>
          <thead className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-700 text-white">
            <tr className="text-white">
              <th className="px-4 py-3 text-left font-medium">Worker</th>
              <th className="px-4 py-3 text-left font-medium">Loans (All)</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && groupedList.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>}
            {error && groupedList.length === 0 && !isLoading && <tr><td colSpan={3} className="px-4 py-6 text-center text-rose-600">{error.message}</td></tr>}
            {!isLoading && !error && groupedList.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No loans</td></tr>}
            {groupedList.map((g, idx) => (
              <GroupedLoanRow key={g.workerId || idx} group={g} idx={idx} onEdit={openEdit} onDelete={setDeleteId} />
            ))}
          </tbody>
        </table>
        {isFetching && groupedList.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Spinner size={28} />
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

  <Modal isOpen={!!editing} onClose={()=> !saving && setEditing(null)} title="Edit Loan" size="sm" height="tall">
        {editing && (
          <form onSubmit={saveEdit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
              <input type="number" min={0} value={editForm.amount} onChange={e=>setEditForm(f=>({...f,amount:e.target.value}))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Loan Date</label>
              <ThemedCalendarInput
                value={editForm.loanDate}
                onChange={(e)=> setEditForm(f=>({...f, loanDate:e.target.value}))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea value={editForm.notes} onChange={e=>setEditForm(f=>({...f,notes:e.target.value}))} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=> !saving && setEditing(null)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-600 hover:bg-slate-50">Cancel</button>
              <button disabled={saving} className="rounded-md bg-teal-600 px-5 py-2 text-white text-sm font-medium shadow hover:bg-teal-700 disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        )}
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        title="Delete loan?"
        message="This will also delete all installments for this loan. This action cannot be undone."
        tone="danger"
        confirmLabel="Delete"
        onCancel={()=> setDeleteId(null)}
        onConfirm={confirmDelete}
      />

  <Modal isOpen={creating} onClose={()=> !createSaving && setCreating(false)} title="Add Loan" size="sm" height="tall">
        {creating && (
          <form onSubmit={saveCreate} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Worker</label>
              <Select
                value={createForm.workerId}
                onChange={(e)=> setCreateForm(f=>({...f,workerId:e.target.value}))}
                options={workers.map(w => ({ value: w.id, label: w.name }))}
                placeholder="Select worker"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
              <input type="number" min={0} value={createForm.amount} onChange={e=>setCreateForm(f=>({...f,amount:e.target.value}))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Loan Date</label>
              <ThemedCalendarInput
                value={createForm.loanDate}
                onChange={(e)=> setCreateForm(f=>({...f, loanDate:e.target.value}))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea rows={3} value={createForm.notes} onChange={e=>setCreateForm(f=>({...f,notes:e.target.value}))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=> !createSaving && setCreating(false)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-600 hover:bg-slate-50">Cancel</button>
              <button disabled={createSaving} className="rounded-md bg-teal-600 px-5 py-2 text-white text-sm font-medium shadow hover:bg-teal-700 disabled:opacity-60">{createSaving ? 'Saving...' : 'Add Loan'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}


function GroupedLoanRow({ group, idx, onEdit, onDelete }) {
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
                  <span className="ml-auto flex gap-2">
                    <button onClick={()=> onEdit(l)} className="rounded border px-2 py-0.5 bg-white hover:bg-teal-100 border-teal-300 text-teal-700">Edit</button>
                    <button onClick={()=> onDelete(l.id)} className="rounded border px-2 py-0.5 bg-white hover:bg-rose-50 border-rose-300 text-rose-600">Delete</button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-xs align-top">
        <div className="flex gap-2">
          <button className="rounded border px-2 py-1 hover:bg-teal-50 border-teal-200 text-teal-700" onClick={()=> setExpanded(e=>!e)}>{expanded ? 'Collapse' : 'Expand'}</button>
          <button className="rounded border px-2 py-1 hover:bg-rose-50 border-rose-200 text-rose-600" onClick={()=> { if(expanded && group.loans.length===1) onDelete(group.loans[0].id); else setExpanded(true); }}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

// helper to avoid TS complaints (placeholder) - runtime no-op
function expectKeyShape() { return {}; }
