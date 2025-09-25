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
  const [activeTab, setActiveTab] = useState('loans');

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
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 flex-1">
                <div className="h-20 w-20 sm:h-24 sm:w-24 mx-auto sm:mx-0 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center text-4xl font-semibold shadow-md ring-4 ring-teal-500/10 overflow-hidden">
                  {data.photo ? <img src={data.photo} alt="avatar" className="h-full w-full object-cover" /> : (data.name?.[0]||'W').toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 leading-tight tracking-tight text-center sm:text-left">{data.name}</h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] justify-center sm:justify-start">
                    <MetaPill label="Phone" value={data.phone} />
                    <MetaPill label="Aadhaar" value={data.aadhaarNumber} />
                    <MetaPill label="Joined" value={data.joiningDate ? formatDMY(data.joiningDate) : ''} />
                    <MetaPill label="ID" value={data._id.slice(0,8)+'…'} />
                    {data.address && <MetaPill label="Address" value={data.address} wide />}
                  </div>
                </div>
              </div>
              <div className="flex flex-col xs:flex-row md:flex-row gap-2 w-full md:w-auto md:self-start">
                <Button className="flex-1 md:flex-none" onClick={() => setEdit(true)}>Edit</Button>
                <Button className="flex-1 md:flex-none" variant="outline" onClick={() => navigate(-1)}>Back</Button>
                <Button className="flex-1 md:flex-none" variant="danger" onClick={onDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</Button>
              </div>
            </div>
            {/* Summary Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <SummaryStat label="Total Loan" value={(data.totalLoan ?? 0).toLocaleString()} tone="teal" />
              <SummaryStat label="Remaining Loan" value={(data.remainingLoan ?? 0).toLocaleString()} tone="rose" />
              <SummaryStat label="Loans" value={(data.loans?.length||0).toLocaleString()} tone="indigo" />
              <SummaryStat label="Installments" value={(data.installments?.length||0).toLocaleString()} tone="emerald" />
            </div>
            {/* Tabs */}
            <div>
              <div className="flex gap-6 border-b border-slate-200 text-sm">
                {['loans','installments'].map(tab => (
                  <button key={tab} onClick={()=> setActiveTab(tab)} className={`relative py-2 font-medium transition-colors ${activeTab===tab ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}>
                    {tab === 'loans' ? 'Loans' : 'Installments'}
                    {activeTab===tab && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full" />}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                {activeTab==='loans' && (
                  <TableWrapper headers={['Amount','Loan Date','Paid','Remaining']} empty="No loans" rows={data.loans} renderRow={(l)=> (
                    <tr key={l._id} className="bg-white hover:bg-teal-50">
                      <td className="px-3 py-2">{(l.amount||0).toLocaleString()}</td>
                      <td className="px-3 py-2">{l.loanDate ? formatDMY(l.loanDate) : ''}</td>
                      <td className="px-3 py-2">{(l.paid||0).toLocaleString()}</td>
                      <td className="px-3 py-2">{(l.remaining||Math.max(0,(l.amount||0)-(l.paid||0))).toLocaleString()}</td>
                    </tr>
                  )} />
                )}
                {activeTab==='installments' && (
                  <TableWrapper headers={['Amount','Date']} empty="No installments" rows={data.installments} renderRow={(i)=> (
                    <tr key={i._id} className="bg-white hover:bg-teal-50">
                      <td className="px-3 py-2">{(i.amount||0).toLocaleString()}</td>
                      <td className="px-3 py-2">{i.date ? formatDMY(i.date) : ''}</td>
                    </tr>
                  )} />
                )}
              </div>
            </div>
          </div>
        )}
        {!loading && !error && data && edit && (
          <form onSubmit={onSave} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name" name="name" value={form.name} onChange={onChange} />
              <Input label="Phone" name="phone" value={form.phone} maxLength={10} onChange={(e)=> setForm(f=>({...f, phone: e.target.value.replace(/[^0-9]/g,'')}))} helper={form.phone && form.phone.length!==10 ? 'Must be 10 digits' : ''} />
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

function MetaPill({ label, value, wide }) {
  return (
    <div
      tabIndex={0}
      className={`group relative inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm border border-teal-100 px-3 py-1.5 text-[11px] text-slate-600 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-teal-200/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 hover:-translate-y-0.5 ${wide ? 'max-w-xs md:max-w-sm' : ''}`}
      title={value}
    >
      <span className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-teal-50 to-cyan-50 transition-opacity" />
      <span className="relative z-10 font-medium text-slate-500">{label}:</span>
      <span className={`relative z-10 font-semibold text-slate-800 tracking-wide truncate ${wide ? 'max-w-[9rem] md:max-w-[14rem]' : ''}`}>{value || '—'}</span>
    </div>
  );
}

function SummaryStat({ label, value, tone }) {
  const palette = {
    teal: { bgFrom:'from-white', bgTo:'to-teal-50', ring:'border-teal-100', iconBg:'bg-teal-100 text-teal-600' },
    rose: { bgFrom:'from-white', bgTo:'to-rose-50', ring:'border-rose-100', iconBg:'bg-rose-100 text-rose-600' },
    indigo: { bgFrom:'from-white', bgTo:'to-indigo-50', ring:'border-indigo-100', iconBg:'bg-indigo-100 text-indigo-600' },
    emerald: { bgFrom:'from-white', bgTo:'to-emerald-50', ring:'border-emerald-100', iconBg:'bg-emerald-100 text-emerald-600' }
  }[tone] || {};
  function iconFor(){
    if(label.toLowerCase().includes('total')) return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M6 10h12M9 14h6M10 18h4" strokeWidth="1.5"/></svg>
    );
    if(label.toLowerCase().includes('remaining')) return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth="1.5"/><path d="M12 7v5l3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    );
    if(label.toLowerCase().includes('loan')) return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 8c-1.657 0-3 1.343-3 3h6c0-1.657-1.343-3-3-3z" strokeWidth="1.5"/><path d="M5 12h14v7a1 1 0 01-1 1H6a1 1 0 01-1-1v-7z" strokeWidth="1.5"/></svg>
    );
    if(label.toLowerCase().includes('install')) return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h10" strokeWidth="1.5"/></svg>
    );
    return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14m7-7H5" strokeWidth="1.5"/></svg>;
  }
  return (
    <div className={`group relative overflow-hidden rounded-xl border ${palette.ring||'border-slate-200'} bg-gradient-to-br ${palette.bgFrom||'from-white'} ${palette.bgTo||'to-slate-50'} p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-teal-200/40 hover:scale-[1.015]`}> 
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_30%_20%,rgba(0,153,153,0.15),rgba(0,0,0,0)_60%)]" />
      <div className="relative flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">{label}</div>
        <div className={`h-6 w-6 rounded-md grid place-items-center ${palette.iconBg||'bg-slate-100 text-slate-500'} shadow-inner`}>{iconFor()}</div>
      </div>
      <div className="relative mt-2 text-xl font-semibold text-slate-900 tabular-nums tracking-tight">{value}</div>
    </div>
  );
}

function TableWrapper({ headers, rows, renderRow, empty }) {
  if(!rows || rows.length===0) return <div className="text-xs text-slate-500">{empty}</div>;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="min-w-full text-xs">
        <thead className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-600 text-white">
          <tr>{headers.map(h=> <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(r => renderRow(r))}
        </tbody>
      </table>
    </div>
  );
}

function Input({ label, helper='', className = '', ...rest }) {
  const invalid = !!helper;
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-wide text-slate-500 mb-1 block">{label}</span>
      <input {...rest} className={`w-full rounded-md border px-3 py-2 text-sm transition-all hover:border-teal-300 focus:ring-2 ${invalid ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200' : 'border-gray-200 focus:border-teal-400 focus:ring-teal-200'}`} />
      {invalid && <span className="mt-1 block text-[11px] font-medium text-rose-600">{helper}</span>}
    </label>
  );
}
