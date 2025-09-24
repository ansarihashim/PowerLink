import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/http.js';
import Card from '../ui/Card.jsx';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

// Helper to parse dd/mm/yyyy to ISO yyyy-mm-dd
function parseDMY(dStr){
  if(!dStr) return null; // allow blank
  const [dd,mm,yyyy] = dStr.split(/[\/\-]/);
  if(!(dd&&mm&&yyyy)) return null;
  return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
}

function formatLabel(range){
  return range.label || '';
}

export default function ExpenseComparisonChart(){
  const [thisRange, setThisRange] = useState(()=>{
    const now = new Date();
    const ym = `${String(now.getMonth()+1).padStart(2,'0')}`;
    const start = new Date(now.getFullYear(), now.getMonth(),1);
    const prevStart = new Date(now.getFullYear(), now.getMonth()-1,1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(),0);
    return { start, end: now, prevStart, prevEnd };
  });

  const [customA, setCustomA] = useState({ from:'', to:'' });
  const [customB, setCustomB] = useState({ from:'', to:'' });
  const [useCustom, setUseCustom] = useState(false);
  const [data, setData] = useState([]); // merged dataset for recharts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buildDataset = useCallback((aRows, bRows, labelA, labelB) => {
    // Convert aggregation rows -> map key
    const normalize = (rows) => rows.reduce((acc,r)=>{
      const {_id, total} = r; // _id has y,m,(d)
      const key = _id.d ? `${_id.y}-${String(_id.m).padStart(2,'0')}-${String(_id.d).padStart(2,'0')}` : `${_id.y}-${String(_id.m).padStart(2,'0')}`;
      acc[key]= total; return acc;
    },{});
    const aMap = normalize(aRows); const bMap = normalize(bRows);
    const keys = Array.from(new Set([...Object.keys(aMap), ...Object.keys(bMap)])).sort();
    return keys.map(k=> ({ period:k, [labelA]: aMap[k]||0, [labelB]: bMap[k]||0 }));
  },[]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let from1, to1, from2, to2, group='day';
      if(useCustom){
        from1 = parseDMY(customA.from); to1 = parseDMY(customA.to);
        from2 = parseDMY(customB.from); to2 = parseDMY(customB.to);
        if(!from1||!to1||!from2||!to2) throw new Error('Enter both date ranges (dd/mm/yyyy)');
        // Determine grouping: if range > 62 days group by month else day
        const d1 = (new Date(to1)-new Date(from1))/(1000*60*60*24);
        group = d1>62? 'month':'day';
      } else {
        from1 = thisRange.start.toISOString().slice(0,10);
        to1 = thisRange.end.toISOString().slice(0,10);
        from2 = thisRange.prevStart.toISOString().slice(0,10);
        to2 = thisRange.prevEnd.toISOString().slice(0,10);
        group = 'day';
      }
      const [r1, r2] = await Promise.all([
        api.expenses.aggregate({ from: from1, to: to1, group }),
        api.expenses.aggregate({ from: from2, to: to2, group })
      ]);
      const labelA = useCustom? 'Range A':'This Period';
      const labelB = useCustom? 'Range B':'Previous Period';
      const ds = buildDataset(r1.data||[], r2.data||[], labelA, labelB);
      setData(ds);
    } catch(e){ setError(e.message || 'Failed to load chart'); }
    finally { setLoading(false); }
  },[buildDataset, customA.from, customA.to, customB.from, customB.to, thisRange, useCustom]);

  useEffect(()=>{ fetchData(); }, [fetchData]);

  // Update automatically when expense list changes? We can listen via a simple interval or exported event bus.
  // For now rely on explicit invocation after create/update by exposing window.dispatchEvent(new Event('expenses:changed'))
  useEffect(()=> {
    const handler = ()=> fetchData();
    window.addEventListener('expenses:changed', handler);
    return ()=> window.removeEventListener('expenses:changed', handler);
  }, [fetchData]);

  const onRangeChange = (setter) => (e)=> setter(v=> ({ ...v, [e.target.name]: e.target.value }));

  return (
    <Card className="p-4 mt-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Expense Comparison</h3>
          <p className="text-xs text-slate-500">Compare current vs previous period or choose custom ranges.</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input type="checkbox" className="accent-teal-600" checked={useCustom} onChange={e=> setUseCustom(e.target.checked)} />
              <span>Custom Ranges</span>
            </label>
          </div>
          {useCustom && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-1">Range A From (dd/mm/yyyy)</label>
                <input name="from" value={customA.from} onChange={onRangeChange(setCustomA)} placeholder="01/01/2025" className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-1">Range A To</label>
                <input name="to" value={customA.to} onChange={onRangeChange(setCustomA)} placeholder="31/01/2025" className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-1">Range B From</label>
                <input name="from" value={customB.from} onChange={onRangeChange(setCustomB)} placeholder="01/02/2025" className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-1">Range B To</label>
                <input name="to" value={customB.to} onChange={onRangeChange(setCustomB)} placeholder="28/02/2025" className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              </div>
              <button onClick={fetchData} className="col-span-full mt-1 inline-flex items-center justify-center rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700">Update</button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        {loading && <div className="text-sm text-slate-500">Loading chart...</div>}
        {error && !loading && <div className="text-sm text-rose-600">{error}</div>}
        {!loading && !error && data.length === 0 && <div className="text-sm text-slate-500">No data</div>}
        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top:10, right:20, bottom:0, left:0 }}>
              <defs>
                <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis dataKey="period" tick={{ fontSize:11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize:11 }} stroke="#64748b" />
              <Tooltip contentStyle={{ fontSize:'12px', borderRadius:'6px' }} />
              <Legend wrapperStyle={{ fontSize:'12px' }} />
              <Area type="monotone" dataKey={useCustom? 'Range A':'This Period'} stroke="#0d9488" fill="url(#colorA)" strokeWidth={2} />
              <Area type="monotone" dataKey={useCustom? 'Range B':'Previous Period'} stroke="#0891b2" fill="url(#colorB)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
