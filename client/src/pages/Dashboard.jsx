import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        className="rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 p-6 text-white shadow-sm"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-semibold">Welcome back, Admin!</h2>
        <p className="text-white/90">Here’s a snapshot of your powerloom network.</p>
      </motion.div>

      {/* KPI Cards */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-gray-700">Key Statistics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[
            { label: "Total Workers", value: "—", tint: "bg-sky-100 text-sky-700" },
            { label: "Total Remaining Loan", value: "—", tint: "bg-emerald-100 text-emerald-700" },
            { label: "Last Baana Date", value: "—", tint: "bg-indigo-100 text-indigo-700" },
            { label: "Last Beam Date", value: "—", tint: "bg-orange-100 text-orange-700" },
          ].map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              variants={fadeIn}
              initial="hidden"
              animate="show"
              transition={{ delay: idx * 0.06, duration: 0.35 }}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg grid place-items-center ${kpi.tint}`}> 
                  <span className="text-xs">★</span>
                </div>
                <div className="text-sm text-gray-500">{kpi.label}</div>
              </div>
              <div className="mt-3 text-2xl font-semibold">{kpi.value}</div>
              <div className="text-xs text-gray-400">animated counter (placeholder)</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Notifications */}
        <motion.section
          className="xl:col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          variants={fadeIn}
          initial="hidden"
          animate="show"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Recent Notifications</h3>
            <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">5 New</span>
          </div>
          <div className="mt-4 space-y-3">
            {["New worker added","Loan taken","Installment paid","Expense added","Baana arrival","Beam arrival"].map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600"
              >
                {n}
              </motion.div>
            ))}
          </div>
          <div className="mt-4">
            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300">View All Notifications</button>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.aside
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          variants={fadeIn}
          initial="hidden"
          animate="show"
        >
          <h3 className="text-base font-semibold text-gray-800">Quick Actions</h3>
          <div className="mt-4 space-y-3">
            {["Add New Worker","Add New Loan","Add New Expense"].map((a) => (
              <button
                key={a}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm hover:bg-gray-50 transition-all duration-300 hover:shadow-sm animate-[pulse_2s_ease-in-out_infinite]"
              >
                {a}
              </button>
            ))}
          </div>
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
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="rounded-md border border-gray-100 bg-gray-50 p-2">—</div>
              <div className="rounded-md border border-gray-100 bg-gray-50 p-2">—</div>
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
        <h3 className="text-base font-semibold text-gray-800">Performance</h3>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
          {["Weekly Expenses","Max Baana/Beam Arrivals","Other KPIs"].map((title, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 h-40"
            >
              {title} (placeholder)
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
