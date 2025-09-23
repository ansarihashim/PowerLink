export default function AddLoan() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Add Loan</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input className="rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Worker ID" />
          <input type="number" className="rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Amount" />
          <input type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
          <input className="rounded-md border border-gray-200 px-3 py-2 text-sm sm:col-span-2" placeholder="Reason" />
          <div className="sm:col-span-2 flex gap-2">
            <button type="button" className="rounded-md bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-2 text-sm">Save</button>
            <button type="button" className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
