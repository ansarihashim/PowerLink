export default function Navbar({ onMenuClick }) {
  return (
    <header className="fixed left-0 lg:left-[17rem] right-0 top-0 z-30 h-16 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="h-full flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            className="lg:hidden rounded-md p-2 hover:bg-gray-100 transition-all duration-200"
            aria-label="Open sidebar"
            onClick={onMenuClick}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.5"/></svg>
          </button>
          <h1 className="min-w-0 truncate text-sm sm:text-base font-medium text-gray-800">
            <span className="font-semibold">PowerLink</span>
            <span className="hidden sm:inline"> – Powerloom Dashboard</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" strokeWidth="1.5"/></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-600 text-white grid place-items-center text-sm">AD</div>
            <div className="hidden sm:block text-sm">
              <div className="font-medium text-gray-800">Admin</div>
              <div className="text-gray-500">Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
