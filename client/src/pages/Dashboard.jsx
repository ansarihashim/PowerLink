import { motion } from "framer-motion";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useMemo } from "react";
import { workers } from "../data/workers.js";
import { baana } from "../data/baana.js";
import { beam } from "../data/beam.js";
import { loans } from "../data/loans.js";
import { installments } from "../data/installments.js";
import { expenses } from "../data/expenses.js";
import { useNavigate } from "react-router-dom";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const { totalWorkers, totalRemainingLoan, lastBaanaDate, lastBeamDate, recent } = useMemo(() => {
    const totalWorkers = workers.length;
    const totalRemainingLoan = workers.reduce((sum, w) => sum + (w.remainingLoan || 0), 0);

    const latestOf = (arr, key) => {
      if (!arr || arr.length === 0) return "—";
      const latest = arr.reduce((max, item) => (new Date(item[key]) > new Date(max[key]) ? item : max), arr[0]);
      return latest[key] || "—";
    };

    const lastBaanaDate = latestOf(baana, "date");
    const lastBeamDate = latestOf(beam, "date");

    const updates = [
      ...workers.map((w) => ({ date: w.joiningDate, text: `Worker joined: ${w.name}` })),
      ...loans.map((l) => ({ date: l.loanDate, text: `Loan taken: ${l.workerId} - ${l.amount.toLocaleString()}` })),
      ...installments.map((i) => ({ date: i.date, text: `Installment paid: ${i.worker} - ${i.amount.toLocaleString()}` })),
      ...expenses.map((e) => ({ date: e.date, text: `Expense added: ${e.category} - ${e.amount.toLocaleString()}` })),
      ...baana.map((b) => ({ date: b.date, text: `Baana arrival: ${b.sacks} sacks` })),
      ...beam.map((b) => ({ date: b.date, text: `Beam arrival: ${b.bunches} bunches` })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return { totalWorkers, totalRemainingLoan, lastBaanaDate, lastBeamDate, recent: updates };
  }, []);

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
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back, Admin!</h2>
        <p className="text-white/90">Here’s a snapshot of your powerloom network.</p>
      </motion.div>

      {/* KPI Cards */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-gray-700">Key Statistics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[
            { label: "Total Workers", value: totalWorkers.toLocaleString(), iconTint: "bg-teal-100 text-teal-700", card: "from-teal-50 to-white" },
            { label: "Total Remaining Loan", value: totalRemainingLoan.toLocaleString(), iconTint: "bg-cyan-100 text-cyan-700", card: "from-cyan-50 to-white" },
            { label: "Last Baana Date", value: lastBaanaDate, iconTint: "bg-teal-100 text-teal-700", card: "from-teal-50 to-white" },
            { label: "Last Beam Date", value: lastBeamDate, iconTint: "bg-cyan-100 text-cyan-700", card: "from-cyan-50 to-white" },
          ].map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              variants={fadeIn}
              initial="hidden"
              animate="show"
              transition={{ delay: idx * 0.06, duration: 0.35 }}
              className="rounded-xl bg-gradient-to-br p-4 shadow hover:shadow-lg hover:shadow-teal-200/50 transition-all duration-300 border border-white/0 from-white to-slate-50 hover:scale-[1.015] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg grid place-items-center ${kpi.iconTint}`}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 17l-5 3 1.9-5.9L4 9h6l2-6 2 6h6l-4.9 5.1L17 20l-5-3z" strokeWidth="1.5"/></svg>
                </div>
                <div className="text-sm text-slate-600">{kpi.label}</div>
              </div>
              <div className="mt-3 text-2xl font-semibold">{kpi.value}</div>
              <div className="text-xs text-slate-400">animated counter (placeholder)</div>
            </motion.div>
          ))}
        </div>
      </section>

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

      {/* Lower Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "Recent Baana Arrivals",
          "Recent Beam Arrivals",
          "Recent Expenses",
        ].map((title, idx) => (
          <motion.section
            key={title}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            variants={fadeIn}
            initial="hidden"
            animate="show"
            transition={{ delay: idx * 0.05 }}
          >
            <h4 className="font-semibold text-slate-800">{title}</h4>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="rounded-md border border-teal-100 bg-teal-50 p-2">—</div>
              <div className="rounded-md border border-teal-100 bg-teal-50 p-2">—</div>
            </div>
          </motion.section>
        ))}
      </div>

      {/* Performance Section */}
      <motion.section
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={fadeIn}
        initial="hidden"
        animate="show"
      >
        <h3 className="text-base font-semibold text-slate-800">Performance</h3>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
          {["Weekly Expenses","Max Baana/Beam Arrivals","Other KPIs"].map((title, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-lg border border-teal-100 bg-gradient-to-br from-white to-teal-50 p-4 text-sm text-slate-600 h-40"
            >
              {title} (placeholder)
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
