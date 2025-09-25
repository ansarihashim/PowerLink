import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import ThemedCalendarInput from '../components/ui/ThemedCalendarInput.jsx';
import Button from '../components/ui/Button.jsx';
import { formatDMY } from '../utils/date.js';
import { api } from '../api/http.js';

export default function WorkerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', joiningDate: '', aadhaarNumber:'', photo:'' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    api.workers.get(id)
  .then(r => { if (!alive) return; setData(r.worker); setForm({ name: r.worker.name||'', phone: r.worker.phone||'', address: r.worker.address||'', joiningDate: r.worker.joiningDate?.slice(0,10)||'', aadhaarNumber: r.worker.aadhaarNumber || '', photo: r.worker.photo || '' }); })
      .catch(e => { if (!alive) return; setError(e.message); })
      .finally(()=> alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target; setForm(f => ({ ...f, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const updated = await api.workers.update(id, form);
      setData(updated.worker || updated.item || updated);
      setEdit(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const onDelete = async () => {
  if (!confirm('Delete this worker? This cannot be undone.')) return; // TODO: could use themed dialog
    setDeleting(true);
    try { await api.workers.remove(id); navigate('/workers'); }
    catch (err) { setError(err.message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="h-6 w-1.5 rounded bg-teal-500" />
        <h2 className="text-xl font-semibold text-slate-900">Worker Detail</h2>
      </div>
      <Card className="p-6">
        {loading && <div className="text-sm text-slate-500">Loading...</div>}
        {error && <div className="mb-3 rounded border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        {!loading && !error && data && !edit && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Field label="ID" value={data._id} />
              <Field label="Name" value={data.name} />
              <Field label="Phone" value={data.phone} />
              <Field label="Address" value={data.address} />
              <Field label="Joining Date" value={data.joiningDate ? formatDMY(data.joiningDate) : ''} />
              <Field label="Aadhaar" value={data.aadhaarNumber} />
              {data.photo && (
                <div className="sm:col-span-2">
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-0.5">Photo</div>
                  <img src={data.photo} alt="worker" className="h-28 w-28 object-cover rounded border border-teal-200" />
                </div>
              )}
              <Field label="Total Loan" value={(data.totalLoan ?? 0).toLocaleString()} />
              <Field label="Remaining Loan" value={(data.remainingLoan ?? 0).toLocaleString()} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setEdit(true)}>Edit</Button>
              <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
              <Button variant="danger" onClick={onDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
            </div>
            {/* Loans List */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Loans</h3>
              {(!data.loans || data.loans.length===0) && <div className="text-xs text-slate-500">No loans</div>}
              {data.loans && data.loans.length>0 && (
                <div className="overflow-x-auto rounded border border-slate-200">
                  <table className="min-w-full text-xs">
                    <thead className="bg-teal-600 text-white">
                      <tr>
                        <th className="px-3 py-2 text-left">Amount</th>
                        <th className="px-3 py-2 text-left">Loan Date</th>
                        <th className="px-3 py-2 text-left">Paid</th>
                        <th className="px-3 py-2 text-left">Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.loans.map(l => (
                        <tr key={l._id} className="bg-white hover:bg-teal-50">
                          <td className="px-3 py-2">{(l.amount||0).toLocaleString()}</td>
                          <td className="px-3 py-2">{l.loanDate ? formatDMY(l.loanDate) : ''}</td>
                          <td className="px-3 py-2">{(l.paid||0).toLocaleString()}</td>
                          <td className="px-3 py-2">{(l.remaining||Math.max(0,(l.amount||0)-(l.paid||0))).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Installments */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Installments</h3>
              {(!data.installments || data.installments.length===0) && <div className="text-xs text-slate-500">No installments</div>}
              {data.installments && data.installments.length>0 && (
                <div className="overflow-x-auto rounded border border-slate-200">
                  <table className="min-w-full text-xs">
                    <thead className="bg-teal-600 text-white">
                      <tr>
                        <th className="px-3 py-2 text-left">Amount</th>
                        <th className="px-3 py-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.installments.map(i => (
                        <tr key={i._id} className="bg-white hover:bg-teal-50">
                          <td className="px-3 py-2">{(i.amount||0).toLocaleString()}</td>
                          <td className="px-3 py-2">{i.date ? formatDMY(i.date) : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {!loading && !error && data && edit && (
          <form onSubmit={onSave} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name" name="name" value={form.name} onChange={onChange} />
              <Input label="Phone" name="phone" value={form.phone} onChange={onChange} />
              <Input label="Address" name="address" value={form.address} onChange={onChange} className="sm:col-span-2" />
              <ThemedCalendarInput label="Joining Date" name="joiningDate" value={form.joiningDate} onChange={onChange} />
              <Input label="Aadhaar Number *" name="aadhaarNumber" value={form.aadhaarNumber} onChange={(e)=> setForm(f=>({...f, aadhaarNumber: e.target.value.trim()}))} />
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Photo</div>
                {form.photo && <img src={form.photo} alt="preview" className="h-24 w-24 object-cover rounded-lg border border-teal-200 shadow-sm mb-2" />}
                <button type="button" onClick={()=> document.getElementById('wd-photo')?.click()} className="inline-flex items-center gap-1 rounded-md bg-teal-600 text-white px-3 py-1.5 text-xs font-medium shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M12 5v14m7-7H5" /></svg>
                  {form.photo ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input id="wd-photo" hidden type="file" accept="image/*" onChange={(e)=> { const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=ev=> setForm(f=>({...f, photo: ev.target.result})); reader.readAsDataURL(file); }} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline" type="button" onClick={() => { setEdit(false); setForm({ name: data.name, phone: data.phone, address: data.address, joiningDate: data.joiningDate?.slice(0,10)||'', aadhaarNumber: data.aadhaarNumber||'', photo: data.photo||'' }); }}>Cancel</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-0.5">{label}</div>
      <div className="font-medium text-slate-800 break-all">{value || <span className="text-slate-400">—</span>}</div>
    </div>
  );
}

function Input({ label, className = '', ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-wide text-slate-500 mb-1 block">{label}</span>
      <input {...rest} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-teal-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition-all" />
    </label>
  );
}
