import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useMemo, useState, useEffect } from "react";
import { api } from "../api/http.js";
import { useNavigate } from "react-router-dom";
import { formatDMY } from "../utils/date.js";
import ExpenseComparisonChart from "../components/charts/ExpenseComparisonChart.jsx";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Removed date range filtering per request

  const rangeCaption = ""; // no caption now

  // (Comparison range removed for now; can be reintroduced later)

  const [stats, setStats] = useState({ workers:0, loansIssued:0, installmentsReceived:0, expenses:0 });
  const [recent, setRecent] = useState([]); // {date,label}
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  useEffect(()=> {
    let alive = true;
    setLoadingStats(true); setStatsError("");
    api.stats.summary({})
      .then(data => { if (alive) setStats(data); })
      .catch(err => { if (alive) setStatsError(err.message || 'Failed loading stats'); })
      .finally(()=> { if (alive) setLoadingStats(false); });

    // Fetch recent events by querying lightweight lists (limit 5 each then merge)
    Promise.all([
      api.workers.list({ page:1, pageSize:5 }),
      api.loans.list({ page:1, pageSize:5 }),
      api.installments.list({ page:1, pageSize:5 }),
      api.expenses.list({ page:1, pageSize:5 }),
      api.baana.list({ page:1, pageSize:5 }),
      api.beam.list({ page:1, pageSize:5 })
    ]).then(([w,l,i,e,ba,be]) => {
      if(!alive) return;
      const collect = [];
      (w.data||[]).forEach(x=> collect.push({ date:x.joiningDate, text:`Worker joined: ${x.name}` }));
      (l.data||[]).forEach(x=> collect.push({ date:x.loanDate, text:`Loan issued: ${Number(x.amount).toLocaleString()}` }));
      (i.data||[]).forEach(x=> collect.push({ date:x.date, text:`Installment: ${Number(x.amount).toLocaleString()}` }));
      (e.data||[]).forEach(x=> collect.push({ date:x.date, text:`Expense: ${Number(x.amount).toLocaleString()}` }));
      (ba.data||[]).forEach(x=> collect.push({ date:x.date, text:`Baana arrival: ${x.sacks} sacks` }));
      (be.data||[]).forEach(x=> collect.push({ date:x.date, text:`Beam arrival: ${x.bunches} bunches` }));
      collect.sort((a,b)=> new Date(b.date) - new Date(a.date));
      setRecent(collect.slice(0,5));
    }).catch(()=>{});
    return ()=> { alive=false; };
  }, []);

  const kpis = [
  { key: 'workers', label: 'All Workers', value: stats.workers, route: '/workers' },
    { key: 'loans', label: 'Loans Issued', value: stats.loansIssued, route: '/loans', isCurrency: true },
    { key: 'installments', label: 'Installments Received', value: stats.installmentsReceived, route: '/installments', isCurrency: true },
    { key: 'expenses', label: 'Expenses', value: stats.expenses, route: '/expenses', isCurrency: true },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-600 p-6 text-white shadow max-w-7xl mx-auto"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* subtle wave/pattern accents */}
        <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(120px_60px_at_20%_0%,rgba(255,255,255,0.35),rgba(255,255,255,0)_60%),radial-gradient(160px_80px_at_70%_0%,rgba(255,255,255,0.25),rgba(255,255,255,0)_60%)]" />
  <h2 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name || 'there'}!</h2>
        <p className="text-white/90">Here’s a snapshot of your powerloom network.</p>
      </motion.div>

      {/* KPI Cards */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-gray-700">Key Statistics</h3>
        <div id="kpi-snapshot" className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 print:grid-cols-2 print:gap-3">
          {kpis.map((kpi, idx) => {
            const rawVal = loadingStats ? null : kpi.value;
            const fmtVal = rawVal == null ? '…' : (kpi.isCurrency ? rawVal.toLocaleString() : rawVal.toLocaleString());
            const diff = (kpi.prev ?? 0) === 0 ? (kpi.value > 0 ? 100 : 0) : Math.round(((kpi.value - kpi.prev) / kpi.prev) * 100);
            const up = kpi.value >= (kpi.prev ?? 0);
            const showDelta = false; // compare UI removed
            return (
              <motion.div
                key={kpi.key}
                variants={fadeIn}
                initial="hidden"
                animate="show"
                transition={{ delay: idx * 0.06, duration: 0.35 }}
                onClick={()=> navigate(`${kpi.route}${from && to ? `?from=${from}&to=${to}`: ''}`)}
                className="rounded-xl bg-gradient-to-br p-4 shadow hover:shadow-lg hover:shadow-teal-200/50 transition-all duration-300 border border-white/0 from-white to-slate-50 hover:scale-[1.015] cursor-pointer print:shadow-none print:border print:border-gray-200 print:hover:scale-100 print:cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg grid place-items-center ${up ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 17l-5 3 1.9-5.9L4 9h6l2-6 2 6h6l-4.9 5.1L17 20l-5-3z" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <div className="text-sm text-slate-600">{kpi.label}</div>
                </div>
                <div className="mt-3 text-2xl font-semibold">{fmtVal}</div>
                {!loadingStats && statsError && (
                  <div className="mt-1 text-[11px] text-rose-600">{statsError}</div>
                )}
                {showDelta && (
                  <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${up ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'} print:bg-transparent print:border print:border-gray-300`}>
                    <svg className={`h-3 w-3 ${up ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14m0 0l-6-6m6 6l6-6" strokeWidth="2"/></svg>
                    <span>{diff}%</span>
                    <span className="text-slate-500">vs prev</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

  {/* Expense Comparison Chart */}
  <ExpenseComparisonChart />

  {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Notifications */}
        <motion.section
          className="xl:col-span-2"
          variants={fadeIn}
          initial="hidden"
          animate="show"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">Recent Notifications</h3>
              <span className="text-xs rounded-full bg-teal-100 px-2 py-0.5 text-teal-700">5 New</span>
            </div>
            <div className="mt-4 space-y-3">
              {recent.map((n, i) => (
                <motion.div
                  key={`${n.text}-${n.date}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm text-teal-800 hover:shadow-md hover:shadow-teal-200/50 hover:bg-teal-100 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span>{n.text}</span>
                    <span className="text-xs text-teal-700/80">{n.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={() => navigate('/notifications')}>View All Notifications</Button>
            </div>
          </Card>
        </motion.section>

        {/* Quick Actions */}
        <motion.aside
          className=""
          variants={fadeIn}
          initial="hidden"
          animate="show"
        >
          <Card className="p-4">
            <h3 className="text-base font-semibold text-slate-800">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Button className="w-full justify-start" onClick={() => navigate('/add-worker')}>Add New Worker</Button>
              <Button className="w-full justify-start" onClick={() => navigate('/add-loan')}>Add New Loan</Button>
              <Button className="w-full justify-start" onClick={() => navigate('/add-expense')}>Add New Expense</Button>
              <Button className="w-full justify-start" onClick={() => navigate('/pay-installment')}>Pay Installment</Button>
            </div>
          </Card>
        </motion.aside>
      </div>

      {/* Removed placeholder lower grid & performance sections as requested */}
    </div>
  );
}
