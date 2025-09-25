import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/http.js';
import Card from '../ui/Card.jsx';
import SortSelect from '../ui/SortSelect.jsx';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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
  // Last 12 complete months including current up to today
  const [monthsBack, setMonthsBack] = useState(12);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack-1), 1);
      const from = start.toISOString().slice(0,10);
      const to = now.toISOString().slice(0,10);
      // Group by month
      const res = await api.expenses.aggregate({ from, to, group: 'month' });
      const rows = (res.data||[]).sort((a,b)=> (a._id.y - b._id.y) || (a._id.m - b._id.m));
      const ds = rows.map(r => ({
        period: `${r._id.y}-${String(r._id.m).padStart(2,'0')}`,
        Month: r.total || 0
      }));
      setData(ds);
    } catch(e){ setError(e.message || 'Failed to load chart'); }
    finally { setLoading(false); }
  }, [monthsBack]);

  useEffect(()=> { fetchData(); }, [fetchData]);
  useEffect(()=> {
    const handler = ()=> fetchData();
    window.addEventListener('expenses:changed', handler);
    return ()=> window.removeEventListener('expenses:changed', handler);
  }, [fetchData]);

  return (
    <Card className="p-4 mt-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
            <h3 className="text-base font-semibold text-slate-800">Monthly Expenses</h3>
            <p className="text-xs text-slate-500">Aggregated expense totals per month.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600">Months:</span>
          <SortSelect
            value={String(monthsBack)}
            onChange={(e)=> setMonthsBack(Number(e.target.value))}
            options={[
              { value: '6', label: 'Last 6' },
              { value: '12', label: 'Last 12' },
              { value: '18', label: 'Last 18' },
              { value: '24', label: 'Last 24' },
            ]}
            className="min-w-[90px]"
          />
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
                <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis
                dataKey="period"
                tickFormatter={(v)=> {
                  const [y,m] = v.split('-');
                  return new Date(Number(y), Number(m)-1, 1).toLocaleString(undefined,{ month:'short', year: monthsBack>12 ? '2-digit':'numeric' });
                }}
                tick={{ fontSize:11 }} stroke="#64748b" interval={0}
              />
              <YAxis tick={{ fontSize:11 }} stroke="#64748b" />
              <Tooltip
                contentStyle={{ fontSize:'12px', borderRadius:'6px' }}
                formatter={(val)=> [Number(val).toLocaleString(), 'Total']}
                labelFormatter={(v)=> {
                  const [y,m] = v.split('-');
                  return new Date(Number(y), Number(m)-1, 1).toLocaleString(undefined,{ month:'long', year:'numeric' });
                }}
              />
              <Area type="monotone" dataKey="Month" stroke="#0d9488" fill="url(#colorMonth)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
