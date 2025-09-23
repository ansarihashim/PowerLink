export default function Navbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="h-full flex items-center justify-between px-6">
        <h1 className="text-sm sm:text-base font-medium text-gray-800">
          PowerLink - Powerloom Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <button
            className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" strokeWidth="1.5"/></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-600 text-white grid place-items-center text-sm">AD</div>
            <div className="text-sm">
              <div className="font-medium text-gray-800">Admin</div>
              <div className="text-gray-500">Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
