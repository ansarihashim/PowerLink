import { useEffect, useRef, useState } from 'react';

// Generic themed select (accessible) similar to SortSelect but suited for form fields
// Props: value, onChange(e.target.value), options [{value,label}], placeholder, disabled
export default function Select({ value, onChange, options = [], placeholder = 'Select', disabled = false, className = '' }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    function onDoc(e){
      if(!ref.current) return;
      if(!ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e){
      if(!open) return;
      if(['ArrowDown','ArrowUp','Enter','Escape','Home','End'].includes(e.key)) e.preventDefault();
      const len = options.length;
      if(e.key==='Escape'){ setOpen(false); return; }
      if(e.key==='ArrowDown') setHighlight(h => (h+1)%len);
      else if(e.key==='ArrowUp') setHighlight(h => (h-1+len)%len);
      else if(e.key==='Home') setHighlight(0);
      else if(e.key==='End') setHighlight(len-1);
      else if(e.key==='Enter') { const opt = options[highlight]; if(opt){ onChange?.({target:{value:opt.value}}); setOpen(false);} }
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return ()=> { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open, options, highlight, onChange]);

  useEffect(()=> {
    if(!open) return;
    const idx = Math.max(0, options.findIndex(o => o.value === value));
    setHighlight(idx);
    // scroll to item
    if(listRef.current){
      const el = listRef.current.querySelector(`[data-idx="${idx}"]`);
      if(el) el.scrollIntoView({ block:'nearest' });
    }
  }, [open, value, options]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" disabled={disabled} onClick={()=> setOpen(o=>!o)} className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 ${open ? 'ring-2 ring-teal-400 border-transparent' : ''}`}
        aria-haspopup="listbox" aria-expanded={open}>
        <span className={`${!selected ? 'text-slate-400' : 'text-slate-700'}`}>{selected ? (selected.label ?? selected.value) : placeholder}</span>
        <svg className={`h-4 w-4 transition-transform text-slate-500 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-teal-100 bg-white shadow-lg shadow-teal-200/40">
          <ul ref={listRef} role="listbox" className="max-h-60 overflow-auto py-1 text-sm">
            {options.length === 0 && <li className="px-3 py-2 text-slate-400">No options</li>}
            {options.map((opt, idx) => {
              const active = opt.value === value;
              const hl = idx === highlight;
              return (
                <li key={opt.value} data-idx={idx} role="option" aria-selected={active}>
                  <button type="button" onClick={()=> { onChange?.({target:{value:opt.value}}); setOpen(false); }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left transition-colors ${active ? 'bg-teal-100 text-teal-800' : hl ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700'}`}> 
                    <span>{opt.label ?? opt.value}</span>
                    {active && <svg className="h-4 w-4 text-teal-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.01 7.01a1 1 0 01-1.415 0L3.296 8.72A1 1 0 114.71 7.304l3.282 3.282 6.303-6.303a1 1 0 011.409 0z" clipRule="evenodd"/></svg>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
