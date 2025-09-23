export default function AddExpense() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Add Expense</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <select className="rounded-md border border-gray-200 px-3 py-2 text-sm">
            <option>tea</option>
            <option>workshop</option>
            <option>mistary</option>
            <option>mukadam</option>
            <option>maintenance</option>
            <option>other</option>
          </select>
          <input type="number" className="rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Amount" />
          <input type="date" className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
          <div className="sm:col-span-2 flex gap-2">
            <button type="button" className="rounded-md bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-2 text-sm">Save</button>
            <button type="button" className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
