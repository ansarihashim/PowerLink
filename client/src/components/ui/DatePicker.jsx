import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toYMD as fmtYMD } from "../../utils/date.js";

// Helper utilities
function pad(n){ return n < 10 ? `0${n}` : `${n}`; }
function toYMD(d){ return fmtYMD(d); }
function fromYMD(str){
  if(!str) return null;
  const [y,m,d] = str.split('-').map(Number);
  if(!y || !m || !d) return null;
  return new Date(y, m-1, d);
}
function toDMY(d){ return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }

export default function DatePicker({ value, onChange, min, max, name, placeholder = "Select date", className = "", inline = false, fallbackViewDate, allowManual = true }) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const selectedDate = fromYMD(value);
  const initialView = selectedDate || fromYMD(fallbackViewDate) || new Date();
  const [view, setView] = useState(initialView);
  const [focusDate, setFocusDate] = useState(initialView);
  const ref = useRef(null);
  const calendarIdealHeight = 340; // baseline design height
  const [calendarMaxHeight, setCalendarMaxHeight] = useState(calendarIdealHeight);

  // Sync when external value changes
  useEffect(()=> {
    const d = selectedDate || fromYMD(fallbackViewDate) || new Date();
    setView(new Date(d.getFullYear(), d.getMonth(), 1));
    setFocusDate(d);
  }, [value, fallbackViewDate]);

  // Outside click / Esc
  useEffect(()=> {
    if(inline || !open) return;
    const close = () => { setShow(false); setTimeout(()=> setOpen(false), 160); };
    const onDown = (e)=> { if(ref.current && !ref.current.contains(e.target)) close(); };
    const onKey = (e)=> { if(e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return ()=> { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open, inline]);

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

  const displayDMY = selectedDate ? toDMY(selectedDate) : "";
  const [manualText, setManualText] = useState(displayDMY);
  const pendingCommitRef = useRef(null); // holds a ymd string just emitted but not yet reflected in props
  useEffect(()=> {
    // If we have a pending commit and the selectedDate now matches it, clear the pending flag.
    const currentYMD = selectedDate ? toYMD(selectedDate) : '';
    if(pendingCommitRef.current && pendingCommitRef.current === currentYMD){
      pendingCommitRef.current = null;
    }
    // Only sync manual text if NOT waiting for a parent commit we already displayed.
    if(!pendingCommitRef.current){
      setManualText(displayDMY);
    }
  }, [displayDMY, selectedDate]);

  const parseManual = (txt) => {
    if(!txt) return '';
    const s = txt.trim();
    // dd/mm/yyyy
    if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)){
      const [dd,mm,yyyy] = s.split('/').map(Number);
      const d = new Date(yyyy, mm-1, dd);
      if(d.getFullYear()===yyyy && d.getMonth()===mm-1 && d.getDate()===dd) return toYMD(d);
      return '';
    }
    // yyyy-mm-dd
    if(/^\d{4}-\d{2}-\d{2}$/.test(s)){
      const [y,m,d] = s.split('-').map(Number);
      const dt = new Date(y, m-1, d);
      if(dt.getFullYear()===y && dt.getMonth()===m-1 && dt.getDate()===d) return toYMD(dt);
      return '';
    }
    return '';
  };

  const isDisabled = (d) => {
    if(min){ const md = fromYMD(min); if(md && d < md) return true; }
    if(max){ const mx = fromYMD(max); if(mx && d > mx) return true; }
    return false;
  };

  const emitChange = (ymd) => {
    const evt = { type:'change', target:{ value: ymd, name }, currentTarget:{ value: ymd, name }, preventDefault:()=>{}, stopPropagation:()=>{} };
    onChange?.(evt);
  };

  const pick = (d) => {
    if(isDisabled(d)) return;
    const ymd = toYMD(d);
    emitChange(ymd);
    pendingCommitRef.current = ymd; // mark that we're awaiting parent prop update
    setManualText(toDMY(d));
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
    <div
      className={`${inline ? '' : 'mt-1'} w-72 rounded-lg border border-teal-100 bg-white p-2 shadow-lg shadow-teal-200/40 flex flex-col`}
      style={{ maxHeight: calendarMaxHeight, overscrollBehavior: 'contain' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
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
      <div className="mt-1 grid grid-cols-7 gap-1 px-1 pb-1 flex-shrink overflow-y-auto">
        {days.map(({ d, other }) => {
          const ymd = toYMD(d);
          const isSel = selectedDate && toYMD(selectedDate) === ymd;
          const disabled = isDisabled(d);
          const isFocus = focusDate && toYMD(focusDate) === ymd;
          return (
            <button
              key={ymd}
              type="button"
              onMouseDown={(e)=> { e.preventDefault(); e.stopPropagation(); pick(d); }}
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
          <button type="button" className="text-teal-700 hover:underline" onMouseDown={(e)=> { e.preventDefault(); e.stopPropagation(); emitChange(''); setManualText(''); setShow(false); setTimeout(()=> setOpen(false), 160); }}>Clear</button>
          <button type="button" className="text-teal-700 hover:underline" onMouseDown={(e)=> { e.preventDefault(); e.stopPropagation(); const now=new Date(); emitChange(toYMD(now)); setManualText(toDMY(now)); setShow(false); setTimeout(()=> setOpen(false), 160); }}>Today</button>
        </div>
      )}
    </div>
  );

  if(inline) return <div className={`rounded-lg border border-teal-100 bg-white p-2 ${className}`}>{Calendar}</div>;

  // Portal positioning
  const [portalStyle, setPortalStyle] = useState({ top:0, left:0, dropUp:false, width:288 });
  useEffect(()=> {
    if(!open || inline) return;
    const place = () => {
      const trigger = ref.current; if(!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = 288;
      let left = rect.left;
      if(left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - 8 - width);
      if(left < 8) left = 8;
      const availHeight = window.innerHeight - 16; // viewport minus margins
      const calHeight = Math.min(calendarIdealHeight, availHeight);
      setCalendarMaxHeight(calHeight);
      const spaceBelow = window.innerHeight - rect.bottom - 8; // margin below
      let top; let dropUp=false;
      if(spaceBelow >= calHeight || rect.top < calHeight){
        // Prefer below if enough space OR not enough space above either
        top = Math.min(rect.bottom + 6, window.innerHeight - 8 - calHeight);
      } else {
        // Drop up
        dropUp = true;
        top = Math.max(8, rect.top - 6 - calHeight);
      }
      if(top < 8) top = 8;
      if(top + calHeight > window.innerHeight - 8) top = window.innerHeight - 8 - calHeight;
      setPortalStyle({ top:Math.round(top), left:Math.round(left), dropUp, width });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open, inline]);

  const triggerClasses = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-all duration-200";

  return (
    <div ref={ref} className={`relative inline-block text-left ${className}`}>
      {allowManual ? (
        <div className="relative">
          <input
            type="text"
            value={manualText}
            placeholder={placeholder}
            onChange={(e)=> {
              const txt = e.target.value;
              setManualText(txt);
              if(!txt){ emitChange(''); pendingCommitRef.current=''; return; }
              const ymd = parseManual(txt);
              if(ymd && ymd !== value){ emitChange(ymd); pendingCommitRef.current = ymd; }
            }}
            onBlur={()=> {
              if(!manualText){ emitChange(''); return; }
              const ymd = parseManual(manualText);
              if(ymd && ymd !== value){ emitChange(ymd); pendingCommitRef.current = ymd; }
              if(!ymd){ // revert to last valid
                if(value) setManualText(displayDMY); else setManualText('');
              }
            }}
            className={`${triggerClasses} pr-10 ${selectedDate ? 'text-slate-800' : 'text-slate-400'}`}
          />
          <button
            type="button"
            aria-label="Open calendar"
            onClick={()=> { if(!open){ setOpen(true); setShow(false); requestAnimationFrame(()=> setShow(true)); } else { setShow(false); setTimeout(()=> setOpen(false), 160); } }}
            className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 hover:text-teal-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM7 11a1 1 0 011-1h.01a1 1 0 110 2H8a1 1 0 01-1-1zm4 0a1 1 0 011-1h.01a1 1 0 110 2H12a1 1 0 01-1-1zm4 0a1 1 0 011-1h.01a1 1 0 110 2H16a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={()=> { if(!open){ setOpen(true); setShow(false); requestAnimationFrame(()=> setShow(true)); } else { setShow(false); setTimeout(()=> setOpen(false), 160); } }}
          className={`${triggerClasses} text-left`}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className={selectedDate ? 'text-slate-800' : 'text-slate-400'}>{displayDMY || placeholder}</span>
        </button>
      )}
      {open && !inline && createPortal(
        <div className={`z-[9999] fixed transform transition-all duration-150 ${portalStyle.dropUp ? 'origin-bottom-left' : 'origin-top-left'} ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ top: portalStyle.top, left: portalStyle.left, width: portalStyle.width, maxWidth: 'calc(100vw - 16px)' }}>
          {Calendar}
        </div>, document.body)
      }
    </div>
  );
}
