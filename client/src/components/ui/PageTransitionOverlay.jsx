import Spinner from './Spinner.jsx';
import { useEffect, useState } from 'react';

// Fades in a subtle overlay with a spinner when active=true.
// Includes a small entrance delay to avoid flicker on very fast queries.
export default function PageTransitionOverlay({ active, delay = 120 }) {
  const [show, setShow] = useState(false);
  useEffect(()=> {
    let t; if(active){ t = setTimeout(()=> setShow(true), delay); } else { setShow(false); }
    return ()=> { if(t) clearTimeout(t); };
  }, [active, delay]);
  if(!show) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/55 backdrop-blur-[1px] transition-opacity">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={28} className="border-teal-500/70" />
        <span className="text-xs font-medium text-teal-700 tracking-wide">Loading…</span>
      </div>
    </div>
  );
}
