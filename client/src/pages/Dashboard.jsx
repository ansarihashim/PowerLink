export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 p-6 text-white shadow-sm">
        <h2 className="text-2xl font-semibold">Welcome back, Admin!</h2>
        <p className="text-white/90">Here’s a snapshot of your powerloom network.</p>
      </div>

      {/* KPI Cards */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-gray-700">Key Statistics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Workers", value: "—", tint: "bg-sky-100 text-sky-700" },
            { label: "Total Remaining Loan", value: "—", tint: "bg-emerald-100 text-emerald-700" },
            { label: "Last Baana Date", value: "—", tint: "bg-indigo-100 text-indigo-700" },
            { label: "Last Beam Date", value: "—", tint: "bg-orange-100 text-orange-700" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg grid place-items-center ${kpi.tint}`}> 
                  <span className="text-xs">★</span>
                </div>
                <div className="text-sm text-gray-500">{kpi.label}</div>
              </div>
              <div className="mt-3 text-2xl font-semibold">{kpi.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Notifications */}
        <section className="xl:col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Recent Notifications</h3>
            <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">5 New</span>
          </div>
          <div className="mt-4 space-y-3">
            {["New worker added","Loan taken","Installment paid","Expense added","Baana arrival","Beam arrival"].map((n, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">{n}</div>
            ))}
          </div>
          <div className="mt-4">
            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">View All Notifications</button>
          </div>
        </section>

        {/* Quick Actions */}
        <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800">Quick Actions</h3>
          <div className="mt-4 space-y-3">
            {["Add New Worker","Add New Loan","Add New Expense"].map((a) => (
              <button key={a} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm hover:bg-gray-50">{a}</button>
            ))}
          </div>
        </aside>
      </div>

      {/* Lower Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="font-semibold text-gray-800">Recent Baana Arrivals</h4>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="rounded-md border border-gray-100 bg-gray-50 p-2">—</div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-2">—</div>
          </div>
        </section>
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="font-semibold text-gray-800">Recent Beam Arrivals</h4>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="rounded-md border border-gray-100 bg-gray-50 p-2">—</div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-2">—</div>
          </div>
        </section>
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="font-semibold text-gray-800">Recent Expenses</h4>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="rounded-md border border-gray-100 bg-gray-50 p-2">—</div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-2">—</div>
          </div>
        </section>
      </div>

      {/* Performance Section */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800">Performance</h3>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
          {["Weekly Expenses","Max Baana/Beam Arrivals","Other KPIs"].map((title) => (
            <div key={title} className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">{title} (placeholder)</div>
          ))}
        </div>
      </section>
    </div>
  );
}
