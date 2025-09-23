import { useEffect, useRef, useState } from "react";
import DatePicker from "./DatePicker.jsx";

export default function DateRangePicker({ start, end, onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const [tmpStart, setTmpStart] = useState(start || "");
  const [tmpEnd, setTmpEnd] = useState(end || "");
  const ref = useRef(null);

  useEffect(() => { setTmpStart(start || ""); }, [start]);
  useEffect(() => { setTmpEnd(end || ""); }, [end]);

  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  const label = tmpStart && tmpEnd ? `${tmpStart} → ${tmpEnd}` : (tmpStart ? `${tmpStart} → …` : (tmpEnd ? `… → ${tmpEnd}` : "Select date range"));
  const appliedLabel = start && end ? `${start} → ${end}` : (start ? `${start} → …` : (end ? `… → ${end}` : ""));
  const isValidYMD = (s) => /^(\d{4})-(\d{2})-(\d{2})$/.test(s);

  const apply = () => {
    let s = tmpStart || ""; let e = tmpEnd || "";
    if (s && e && s > e) { const t = s; s = e; e = t; }
    onChange?.({ start: s, end: e });
    setOpen(false);
  };
  const clear = () => { setTmpStart(""); setTmpEnd(""); };

  return (
    <div ref={ref} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-all duration-200"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={(tmpStart || tmpEnd) ? "text-slate-800" : "text-slate-400"}>{label}</span>
      </button>
      {!open && appliedLabel && (
        <div className="mt-1 text-xs text-slate-500">Filtered by: {appliedLabel}</div>
      )}
      {open && (
        <div className="absolute left-0 z-50 mt-1 rounded-lg border border-teal-100 bg-white p-3 shadow-lg shadow-teal-200/40">
          <div className="mb-2 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <div>Start</div>
            <div>End</div>
          </div>
          <div className="flex gap-3">
            <DatePicker value={tmpStart} onChange={(e)=> setTmpStart(e.target.value)} inline max={tmpEnd || undefined} />
            <DatePicker value={tmpEnd} onChange={(e)=> setTmpEnd(e.target.value)} inline min={tmpStart || undefined} />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              value={tmpStart}
              onChange={(e)=> setTmpStart(e.target.value)}
              onKeyDown={(e)=> { if (e.key === 'Enter') apply(); }}
              placeholder="YYYY-MM-DD"
              className={`rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 ${tmpStart && !isValidYMD(tmpStart) ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`}
            />
            <input
              value={tmpEnd}
              onChange={(e)=> setTmpEnd(e.target.value)}
              onKeyDown={(e)=> { if (e.key === 'Enter') apply(); }}
              placeholder="YYYY-MM-DD"
              className={`rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 ${tmpEnd && !isValidYMD(tmpEnd) ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <button type="button" className="rounded border border-gray-200 px-2 py-1 hover:bg-slate-50" onClick={()=> {
              const t = new Date(); const to = t; const from = new Date(t); from.setDate(t.getDate()-6);
              const fmt = (d)=> `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
              setTmpStart(fmt(from)); setTmpEnd(fmt(to));
            }}>Last 7 days</button>
            <button type="button" className="rounded border border-gray-200 px-2 py-1 hover:bg-slate-50" onClick={()=> {
              const t = new Date(); const to = t; const from = new Date(t); from.setDate(t.getDate()-29);
              const fmt = (d)=> `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
              setTmpStart(fmt(from)); setTmpEnd(fmt(to));
            }}>Last 30 days</button>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <div className="flex gap-2">
              <button type="button" className="rounded border border-teal-200 bg-teal-50 px-2 py-1 text-teal-800 hover:bg-teal-100" onClick={()=> { const t = new Date(); const y=t.getFullYear(); const m=t.getMonth()+1; const d=t.getDate(); const s=`${y}-${m<10?`0${m}`:m}-${d<10?`0${d}`:d}`; setTmpStart(s); setTmpEnd(s); }}>Today</button>
              <button type="button" className="rounded border border-gray-200 px-2 py-1 hover:bg-slate-50" onClick={clear}>Clear</button>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded border border-gray-200 px-3 py-1 hover:bg-slate-50" onClick={()=> setOpen(false)}>Cancel</button>
              <button type="button" className="rounded bg-gradient-to-r from-teal-500 to-cyan-600 px-3 py-1 text-white" onClick={apply}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
