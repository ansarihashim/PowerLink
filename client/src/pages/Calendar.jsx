export default function Calendar() {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-7 text-center text-sm text-gray-500">
          {days.map((d) => (
            <div key={d} className="py-2 font-medium">{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2 text-sm">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg border border-gray-100 bg-gray-50 p-2 text-gray-600">—</div>
          ))}
        </div>
      </div>
    </div>
  );
}
