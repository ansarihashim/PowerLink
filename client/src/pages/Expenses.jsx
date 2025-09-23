export default function Expenses() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <input type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
              <input type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
              <select className="rounded-md border border-gray-200 px-3 py-2 text-sm">
                <option>All categories</option>
                <option>tea</option>
                <option>workshop</option>
                <option>mistary</option>
                <option>mukadam</option>
                <option>maintenance</option>
                <option>other</option>
              </select>
              <input className="rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Min amount" />
            </div>
          </div>
          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-600">
                  {['Category','Amount','Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">—</td>
                  <td className="px-4 py-3">—</td>
                  <td className="px-4 py-3">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800">Summary</h3>
          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
            Total Expenses in selected range: —
          </div>
        </aside>
      </div>
    </div>
  );
}
