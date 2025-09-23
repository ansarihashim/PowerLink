export default function Workers() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Workers</h2>
      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          <input className="rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Search by name" />
          <input type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
          <input type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
          <input className="rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Min loan" />
          <input className="rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Max loan" />
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-600">
              {['ID','Name','Phone Number','Address','Joining Date','Loan Taken','Remaining Loan Amount'].map(h=> (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
