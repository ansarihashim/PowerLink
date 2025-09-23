import { useEffect, useRef, useState } from "react";

export default function SortSelect({ value, onChange, options, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    const onDown = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (!ref.current) return;
      const inside = ref.current.contains(e.target);
      if (e.key === "Escape") setOpen(false);
      if (!open || !inside) return;
      const len = options.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => (h + 1) % len);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => (h - 1 + len) % len);
      } else if (e.key === "Home") {
        e.preventDefault();
        setHighlight(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setHighlight(len - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = options[highlight];
        if (opt) {
          onChange?.({ target: { value: opt.value } });
          setOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const selected = options.find((o) => o.value === value) || options[0];
  useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, options.findIndex((o) => o.value === value));
    setHighlight(idx);
  }, [open, value, options]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`rounded-md border border-gray-200 px-2 py-1 text-sm bg-white hover:border-teal-300 hover:shadow-sm hover:shadow-teal-200/50 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-all duration-200 inline-flex items-center gap-1 ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected?.label ?? selected?.value}
        <svg className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-1 w-40 z-50 rounded-lg border border-teal-100 bg-white shadow-lg shadow-teal-200/40">
          <ul role="listbox" className="py-1 max-h-60 overflow-auto">
            {options.map((opt, idx) => {
              const active = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => { onChange?.({ target: { value: opt.value } }); setOpen(false); }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-700 ${active ? 'bg-teal-100 text-teal-800' : ''} ${idx === highlight && !active ? 'bg-teal-50' : ''}`}
                  >
                    <span>{opt.label ?? opt.value}</span>
                    {active && (
                      <svg className="h-4 w-4 text-teal-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.01 7.01a1 1 0 01-1.415 0L3.296 8.72A1 1 0 114.71 7.304l3.282 3.282 6.303-6.303a1 1 0 011.409 0z" clipRule="evenodd"/></svg>
                    )}
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
