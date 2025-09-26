import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "./DatePicker.jsx";
import { dmyToYMD, formatDMY, isValidDMY } from "../../utils/date.js";

export default function DateRangePicker({ start, end, onChange, className = "" }) {
  const [open, setOpen] = useState(false); // portal mounted
  const [show, setShow] = useState(false); // animation visibility
  const [tmpStart, setTmpStart] = useState(start || "");
  const [tmpEnd, setTmpEnd] = useState(end || "");
  const [tmpStartText, setTmpStartText] = useState(start ? formatDMY(start) : "");
  const [tmpEndText, setTmpEndText] = useState(end ? formatDMY(end) : "");
  const ref = useRef(null);
  const [portalStyle, setPortalStyle] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => { setTmpStart(start || ""); setTmpStartText(start ? formatDMY(start) : ""); }, [start]);
  useEffect(() => { setTmpEnd(end || ""); setTmpEndText(end ? formatDMY(end) : ""); }, [end]);

  useEffect(() => {
    const closeAnimated = () => { setShow(false); setTimeout(()=> setOpen(false), 160); };
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) { if(open) closeAnimated(); } };
    const onKey = (e) => { if (e.key === 'Escape' && open) closeAnimated(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const trigger = ref.current; if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const desiredWidth = Math.max(320, rect.width);
      // Horizontal: clamp within viewport with 8px padding
      let left = rect.left;
      if (left + desiredWidth > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - 8 - desiredWidth);
      }
      if (left < 8) left = 8;
      // Vertical: decide drop direction
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedHeight = 420; // approximate range picker height
      let top = rect.bottom + 6;
      let dropUp = false;
      if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
        // open upwards
        top = rect.top - 6 - estimatedHeight;
        dropUp = true;
      }
      setPortalStyle({ top: Math.round(top), left: Math.round(left), width: Math.round(rect.width), dropUp });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open]);

  const label = tmpStart && tmpEnd ? `${formatDMY(tmpStart)} → ${formatDMY(tmpEnd)}` : (tmpStart ? `${formatDMY(tmpStart)} → …` : (tmpEnd ? `… → ${formatDMY(tmpEnd)}` : "Select date range"));
  const appliedLabel = start && end ? `${formatDMY(start)} → ${formatDMY(end)}` : (start ? `${formatDMY(start)} → …` : (end ? `… → ${formatDMY(end)}` : ""));

  const apply = () => {
    let s = tmpStart || ""; let e = tmpEnd || "";
    // If only one side selected treat as single-day range for consistent filtering
    if (s && !e) e = s; else if (!s && e) s = e;
    // Normalize ordering
    if (s && e && s > e) { const t = s; s = e; e = t; }
    onChange?.({ start: s, end: e });
    setShow(false); setTimeout(()=> setOpen(false), 160);
  };
  const clear = () => { setTmpStart(""); setTmpEnd(""); };

  return (
    <div ref={ref} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => {
          if(!open){ setOpen(true); setShow(false); requestAnimationFrame(()=> setShow(true)); }
          else { setShow(false); setTimeout(()=> setOpen(false), 160); }
        }}
        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-all duration-200"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={(tmpStart || tmpEnd) ? "text-slate-800" : "text-slate-400"}>{label}</span>
      </button>
      {!open && appliedLabel && (
        <div className="mt-1 text-xs text-slate-500">Filtered by: {appliedLabel}</div>
      )}
      {open && createPortal(
        <div
          className={`z-[9999] rounded-lg border border-teal-100 bg-white p-3 shadow-lg shadow-teal-200/40 transform transition-all duration-150 ease-out ${portalStyle.dropUp ? 'origin-bottom-left' : 'origin-top-left'} ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ position: 'fixed', top: portalStyle.top, left: portalStyle.left, minWidth: Math.max(320, portalStyle.width), maxWidth: 'calc(100vw - 16px)' }}
        >
          <div className="mb-2 grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
            <div className="text-left">Start</div>
            <div className="text-left">End</div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-teal-100 p-1">
              <DatePicker
                value={tmpStart}
                onChange={(e)=> { setTmpStart(e.target.value); setTmpStartText(formatDMY(e.target.value)); }}
                inline
                max={tmpEnd || undefined}
              />
            </div>
            <div className="rounded-lg border border-teal-100 p-1">
              <DatePicker
                value={tmpEnd}
                onChange={(e)=> { setTmpEnd(e.target.value); setTmpEndText(formatDMY(e.target.value)); }}
                inline
                min={tmpStart || undefined}
                fallbackViewDate={( ()=> {
                  if (tmpEnd) return tmpEnd;
                  if (tmpStart) { const d = new Date(tmpStart); return `${d.getFullYear()}-${String(d.getMonth()+2).padStart(2,'0')}-01`; }
                  return undefined;
                })()}
              />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              value={tmpStartText}
              onChange={(e)=> { const v=e.target.value; setTmpStartText(v); if(!v){ setTmpStart(""); return;} const ymd=dmyToYMD(v); if(ymd) setTmpStart(ymd); }}
              onKeyDown={(e)=> { if (e.key === 'Enter') apply(); }}
              placeholder="dd/MM/yyyy"
              className={`rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 ${tmpStartText && !isValidDMY(tmpStartText) ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`}
            />
            <input
              value={tmpEndText}
              onChange={(e)=> { const v=e.target.value; setTmpEndText(v); if(!v){ setTmpEnd(""); return;} const ymd=dmyToYMD(v); if(ymd) setTmpEnd(ymd); }}
              onKeyDown={(e)=> { if (e.key === 'Enter') apply(); }}
              placeholder="dd/MM/yyyy"
              className={`rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 ${tmpEndText && !isValidDMY(tmpEndText) ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <button type="button" className="rounded border border-gray-200 px-2 py-1 hover:bg-slate-50" onClick={()=> { const t=new Date(); const to=t; const from=new Date(t); from.setDate(t.getDate()-6); const fmt=(d)=> `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`; const s=fmt(from); const e=fmt(to); setTmpStart(s); setTmpEnd(e); setTmpStartText(formatDMY(s)); setTmpEndText(formatDMY(e)); }}>Last 7 days</button>
            <button type="button" className="rounded border border-gray-200 px-2 py-1 hover:bg-slate-50" onClick={()=> { const t=new Date(); const to=t; const from=new Date(t); from.setDate(t.getDate()-29); const fmt=(d)=> `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`; const s=fmt(from); const e=fmt(to); setTmpStart(s); setTmpEnd(e); setTmpStartText(formatDMY(s)); setTmpEndText(formatDMY(e)); }}>Last 30 days</button>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <div className="flex gap-2">
              <button type="button" className="rounded border border-teal-200 bg-teal-50 px-2 py-1 text-teal-800 hover:bg-teal-100" onClick={()=> { const t=new Date(); const y=t.getFullYear(); const m=t.getMonth()+1; const d=t.getDate(); const s=`${y}-${m<10?`0${m}`:m}-${d<10?`0${d}`:d}`; setTmpStart(s); setTmpEnd(s); setTmpStartText(formatDMY(s)); setTmpEndText(formatDMY(s)); }}>Today</button>
              <button type="button" className="rounded border border-gray-200 px-2 py-1 hover:bg-slate-50" onClick={()=> { clear(); setTmpStartText(""); setTmpEndText(""); }}>Clear</button>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded border border-gray-200 px-3 py-1 hover:bg-slate-50" onClick={()=> { setShow(false); setTimeout(()=> setOpen(false), 160); }}>Cancel</button>
              <button type="button" className="rounded bg-gradient-to-r from-teal-500 to-cyan-600 px-3 py-1 text-white" onClick={apply}>Apply</button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
