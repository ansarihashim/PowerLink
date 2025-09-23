import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { baana } from "../data/baana.js";
import { beam } from "../data/beam.js";
import { installments } from "../data/installments.js";

function getMonthMatrix(year, month) {
  // month is 0-based
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  // Fill 6 weeks (42 cells)
  for (let i = 0; i < 42; i++) {
    const dateOffset = i - startDay + 1; // day of current month
    let d, inMonth = true;
    if (dateOffset <= 0) {
      // prev month
      d = new Date(year, month - 1, prevDays + dateOffset);
      inMonth = false;
    } else if (dateOffset > daysInMonth) {
      // next month
      d = new Date(year, month + 1, dateOffset - daysInMonth);
      inMonth = false;
    } else {
      d = new Date(year, month, dateOffset);
    }
    cells.push({ date: d, inMonth });
  }
  return cells;
}

export default function Calendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-based

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  // Build simple events from existing datasets
  const eventsByDate = useMemo(() => {
    const key = (d) => d.toISOString().slice(0,10);
    const map = {};
    const add = (dStr, label, color) => {
      const k = dStr;
      if (!map[k]) map[k] = [];
      map[k].push({ label, color });
    };
    baana.forEach(b => add(b.date, `${b.sacks} sacks (Baana)`, 'bg-teal-100 text-teal-700'));
    beam.forEach(b => add(b.date, `${b.bunches} bunches (Beam)`, 'bg-cyan-100 text-cyan-700'));
    installments.forEach(i => add(i.date, `Installment: ${i.amount.toLocaleString()}`, 'bg-amber-100 text-amber-800'));
    return map;
  }, []);

  const goPrev = () => {
    const m = month - 1;
    if (m < 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m);
  };
  const goNext = () => {
    const m = month + 1;
    if (m > 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m);
  };

  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="h-6 w-1.5 rounded bg-teal-500" />
        <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
      </div>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={goPrev}>Prev</Button>
            <div className="text-sm font-medium">{monthName} {year}</div>
            <Button variant="outline" onClick={goNext}>Next</Button>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-teal-200 inline-block"/> Baana</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-cyan-200 inline-block"/> Beam</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-200 inline-block"/> Installment</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 text-center text-xs sm:text-sm text-gray-500">
          {days.map((d) => (
            <div key={d} className="py-2 font-medium">{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2 text-xs sm:text-sm">
          {matrix.map(({ date, inMonth }, i) => {
            const k = date.toISOString().slice(0,10);
            const today = new Date().toDateString() === date.toDateString();
            const items = eventsByDate[k] || [];
            return (
              <motion.div
                key={k + i}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.005 }}
                className={`h-24 rounded-lg border p-2 ${inMonth ? 'border-gray-100 bg-white' : 'border-gray-50 bg-gray-50 text-gray-400'} ${today ? 'ring-2 ring-teal-300' : ''}`}
              >
                <div className="text-[11px] font-medium">{date.getDate()}</div>
                <div className="mt-1 space-y-1">
                  {items.slice(0,3).map((ev, idx) => (
                    <div key={idx} className={`truncate rounded px-1 py-0.5 ${ev.color}`}>{ev.label}</div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-[11px] text-slate-500">+{items.length - 3} more</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
