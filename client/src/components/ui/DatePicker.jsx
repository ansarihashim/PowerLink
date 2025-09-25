import { useEffect, useMemo, useRef, useState } from "react";
import { toYMD as fmtYMD } from "../../utils/date.js";

// Helpers
function pad(n){ return n < 10 ? `0${n}` : `${n}`; }
function toYMD(d){ return fmtYMD(d); }
function fromYMD(str){
  if(!str) return null;
  const [y,m,d] = str.split('-').map(Number);
  if(!y || !m || !d) return null;
  return new Date(y, m-1, d);
}
function toDMY(d){ return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }

export default function DatePicker({ value, onChange, min, max, placeholder = "Select date", className = "", inline = false, fallbackViewDate }){
  const [open, setOpen] = useState(false);      // mounted (popover mode)
  const [show, setShow] = useState(false);      // animation state
  const selectedDate = fromYMD(value);
  const initialView = selectedDate || fromYMD(fallbackViewDate) || new Date();
  const [view, setView] = useState(initialView);
  const [focusDate, setFocusDate] = useState(initialView);
  const ref = useRef(null);

  // Sync when value / fallbackViewDate changes
  useEffect(()=>{
    const d = selectedDate || fromYMD(fallbackViewDate) || new Date();
    setView(new Date(d.getFullYear(), d.getMonth(), 1));
    setFocusDate(d);
  }, [value, fallbackViewDate]);

  // Outside click / ESC for popover
  useEffect(()=>{
    if(inline || !open) return; // only when popover open
    const closeAnimated = () => { setShow(false); setTimeout(()=> setOpen(false), 160); };
    const onDown = (e)=> { if(ref.current && !ref.current.contains(e.target)) closeAnimated(); };
    const onKey = (e)=> { if(e.key === 'Escape') closeAnimated(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return ()=> { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [inline, open]);

  const monthStart = useMemo(()=> new Date(view.getFullYear(), view.getMonth(), 1), [view]);
  const monthEnd   = useMemo(()=> new Date(view.getFullYear(), view.getMonth()+1, 0), [view]);
  const days = useMemo(()=> {
    const startDay = monthStart.getDay();
    const totalDays = monthEnd.getDate();
    const prevMonthEnd = new Date(view.getFullYear(), view.getMonth(), 0).getDate();
    const cells = [];
    for(let i=0;i<startDay;i++){
      const day = prevMonthEnd - startDay + 1 + i;
      cells.push({ d: new Date(view.getFullYear(), view.getMonth()-1, day), other:true });
    }
    for(let i=1;i<=totalDays;i++) cells.push({ d: new Date(view.getFullYear(), view.getMonth(), i), other:false });
    while(cells.length % 7 !== 0 || cells.length < 42){
      const idx = cells.length - (startDay + totalDays);
      cells.push({ d: new Date(view.getFullYear(), view.getMonth()+1, idx+1), other:true });
    }
    return cells;
  }, [monthStart, monthEnd, view]);

  const displayLabel = selectedDate ? toDMY(selectedDate) : placeholder;

  const isDisabled = (d) => {
    if(min){ const md = fromYMD(min); if(md && d < md) return true; }
    if(max){ const mx = fromYMD(max); if(mx && d > mx) return true; }
    return false;
  };

  const pick = (d) => {
    if(isDisabled(d)) return;
    const ymd = toYMD(d);
    onChange?.({ target: { value: ymd } });
    if(!inline){ setShow(false); setTimeout(()=> setOpen(false), 160); }
  };

  const ensureViewVisible = (d) => {
    if(!d) return;
    if(d.getFullYear() !== view.getFullYear() || d.getMonth() !== view.getMonth()){
      setView(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  const handleKeyDown = (e) => {
    let d = new Date(focusDate);
    if(e.key === 'ArrowLeft'){ e.preventDefault(); d.setDate(d.getDate()-1); }
    else if(e.key === 'ArrowRight'){ e.preventDefault(); d.setDate(d.getDate()+1); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); d.setDate(d.getDate()-7); }
    else if(e.key === 'ArrowDown'){ e.preventDefault(); d.setDate(d.getDate()+7); }
    else if(e.key === 'PageUp'){ e.preventDefault(); d.setMonth(d.getMonth()-1); }
    else if(e.key === 'PageDown'){ e.preventDefault(); d.setMonth(d.getMonth()+1); }
    else if(e.key === 'Enter'){ e.preventDefault(); pick(d); return; }
    else { return; }
    setFocusDate(d); ensureViewVisible(d);
  };

  const Calendar = (
    <div className={`${inline ? '' : 'mt-1'} w-72 rounded-lg border border-teal-100 bg-white p-2 shadow-lg shadow-teal-200/40`} tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between px-1 py-2">
        <button type="button" className="rounded p-1 hover:bg-teal-50" onClick={()=> setView(new Date(view.getFullYear(), view.getMonth()-1, 1))} aria-label="Previous month">
          <svg className="h-4 w-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.78 15.53a.75.75 0 01-1.06 0l-5-5a.75.75 0 010-1.06l5-5a.75.75 0 111.06 1.06L8.31 10l4.47 4.47a.75.75 0 010 1.06z" clipRule="evenodd"/></svg>
        </button>
        <div className="text-sm font-medium text-slate-800">{monthStart.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
        <button type="button" className="rounded p-1 hover:bg-teal-50" onClick={()=> setView(new Date(view.getFullYear(), view.getMonth()+1, 1))} aria-label="Next month">
          <svg className="h-4 w-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.22 4.47a.75.75 0 011.06 0l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06L11.69 10 7.22 5.53a.75.75 0 010-1.06z" clipRule="evenodd"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 px-1 text-center text-[11px] text-slate-500">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 px-1 pb-1">
        {days.map(({ d, other }) => {
          const ymd = toYMD(d);
          const isSel = selectedDate && toYMD(selectedDate) === ymd;
          const disabled = isDisabled(d);
          const isFocus = focusDate && toYMD(focusDate) === ymd;
          return (
            <button
              key={ymd}
              type="button"
              onClick={()=> pick(d)}
              disabled={disabled}
              className={`rounded-md py-1.5 text-sm transition-colors hover:bg-teal-50 hover:text-teal-700 ${other ? 'text-slate-400' : 'text-slate-700'} ${isSel ? 'bg-teal-100 text-teal-800 ring-1 ring-teal-300' : ''} ${isFocus && !isSel ? 'ring-1 ring-teal-300' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      {!inline && (
        <div className="mt-1 flex items-center justify-between px-1 text-xs">
          <button type="button" className="text-teal-700 hover:underline" onClick={()=> { onChange?.({ target:{ value:'' }}); setShow(false); setTimeout(()=> setOpen(false), 160); }}>Clear</button>
          <button type="button" className="text-teal-700 hover:underline" onClick={()=> { const now=new Date(); const y=now.getFullYear(); const m=pad(now.getMonth()+1); const d=pad(now.getDate()); onChange?.({ target:{ value:`${y}-${m}-${d}` }}); setShow(false); setTimeout(()=> setOpen(false), 160); }}>Today</button>
        </div>
      )}
    </div>
  );

  if(inline) return <div className={`rounded-lg border border-teal-100 bg-white p-2 ${className}`}>{Calendar}</div>;

  // Compute dynamic alignment (left or shift to keep inside viewport)
  const popoverStyle = {};
  if (open && ref.current) {
    const rect = ref.current.getBoundingClientRect();
    const width = 288; // w-72 ~ 18rem -> 288px
    let leftOffset = 0;
    // If overflowing right, align to right edge
    if (rect.left + width > window.innerWidth - 8) {
      leftOffset = Math.min(0, window.innerWidth - 8 - (rect.left + width));
    }
    // If would overflow left (unlikely since we anchor left), safeguard
    if (rect.left + leftOffset < 8) {
      leftOffset = 8 - rect.left;
    }
    popoverStyle.left = leftOffset + 'px';
    // Vertical: if not enough space below, open upwards
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = 340; // approximate calendar height
    if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
      popoverStyle.top = 'auto';
      popoverStyle.bottom = `calc(100% + 0.25rem)`; // 4px
    }
  }

  return (
    <div ref={ref} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={()=> {
          if(!open){ setOpen(true); setShow(false); requestAnimationFrame(()=> setShow(true)); }
          else { setShow(false); setTimeout(()=> setOpen(false), 160); }
        }}
        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-all duration-200"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={selectedDate ? 'text-slate-800' : 'text-slate-400'}>{displayLabel}</span>
      </button>
      {open && (
        <div
          className={`absolute left-0 z-50 mt-1 transform transition-all duration-150 ${popoverStyle.bottom ? 'origin-bottom-left' : 'origin-top-left'} ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={popoverStyle}
        >
          {Calendar}
        </div>
      )}
    </div>
  );
}
