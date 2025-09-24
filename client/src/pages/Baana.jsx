import { useEffect, useState } from "react";
import { api } from "../api/http.js";
import { formatDMY } from "../utils/date.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SortSelect from "../components/ui/SortSelect.jsx";
import DatePicker from "../components/ui/DatePicker.jsx";
import DateRangePicker from "../components/ui/DateRangePicker.jsx";
import { downloadCSV } from "../utils/export.js";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";

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
  const { push } = useToast();
  const [editing, setEditing] = useState(null); // record or 'new'
  const [form, setForm] = useState({ date: '', sacks: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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

  function openAdd(){ setEditing('new'); setForm({ date: new Date().toISOString().slice(0,10), sacks: '' }); }
  function openEdit(rec){ setEditing(rec); setForm({ date: rec.date?.slice(0,10) || '', sacks: rec.sacks }); }
  async function save(e){ e.preventDefault(); if(!editing) return; setSaving(true); try { const payload = { date: form.date, sacks: Number(form.sacks) }; if(editing==='new'){ await api.baana.create(payload); push({ type:'success', title:'Record Added', message:'Baana record created.' }); } else { await api.baana.update(editing.id || editing._id, payload); push({ type:'success', title:'Record Updated', message:'Changes saved.' }); } setEditing(null); setSaving(false); // refresh list
      // naive refetch reusing effect deps by toggling page or resetting
      setPage(1); // triggers effect
    } catch(err){ push({ type:'error', title:'Save Failed', message: err.message }); setSaving(false); } }
  function startDelete(id){ setDeleteId(id); }
  async function confirmDelete(){ if(!deleteId) return; try { await api.baana.remove(deleteId); push({ type:'success', title:'Record Deleted', message:'Baana record removed.' }); setDeleteId(null); setRows(r=> r.filter(x => x.id !== deleteId)); } catch(err){ push({ type:'error', title:'Delete Failed', message: err.message }); setDeleteId(null); } }
  function cancelDelete(){ setDeleteId(null); }

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
        <div className="flex items-center justify-end gap-2 p-3">
          <Button onClick={openAdd} className="bg-teal-600 text-white hover:bg-teal-700">Add Record</Button>
          <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
        </div>
  <div className="relative">
  <table className="min-w-full divide-y divide-gray-200 text-sm transition-opacity duration-200" style={{ opacity: loading && rows.length ? 0.55 : 1 }}>
          <thead className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-700 text-white">
            <tr className="text-white">
              {['Date','Number of Sacks','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && rows.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>}
            {error && rows.length === 0 && !loading && <tr><td colSpan={3} className="px-4 py-6 text-center text-rose-600">{error}</td></tr>}
            {!loading && !error && rows.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No baana records</td></tr>}
            {rows.map((b, idx) => (
              <tr key={b.id} className={`transition-colors hover:bg-teal-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <td className="px-4 py-3">{b.date ? formatDMY(b.date) : ''}</td>
                <td className="px-4 py-3">{b.sacks}</td>
                <td className="px-4 py-3 text-xs">
                  <div className="flex gap-2">
                    <button onClick={()=> openEdit(b)} className="rounded border px-2 py-1 bg-white hover:bg-teal-100 border-teal-300 text-teal-700">Edit</button>
                    <button onClick={()=> startDelete(b.id)} className="rounded border px-2 py-1 bg-white hover:bg-rose-50 border-rose-300 text-rose-600">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && rows.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
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
      <Modal isOpen={!!editing} onClose={()=> !saving && setEditing(null)} title={editing==='new' ? 'Add Baana Record' : 'Edit Baana Record'} size="sm">
        {editing && (
          <form onSubmit={save} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Number of Sacks</label>
              <input type="number" min={0} value={form.sacks} onChange={e=>setForm(f=>({...f,sacks:e.target.value}))} className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=> !saving && setEditing(null)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-600 hover:bg-slate-50">Cancel</button>
              <button disabled={saving} className="rounded-md bg-teal-600 px-5 py-2 text-white text-sm font-medium shadow hover:bg-teal-700 disabled:opacity-60">{saving ? 'Saving...' : (editing==='new' ? 'Add Record' : 'Save Changes')}</button>
            </div>
          </form>
        )}
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        title="Delete record?"
        message="This action cannot be undone."
        tone="danger"
        confirmLabel="Delete"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
