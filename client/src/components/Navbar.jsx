export default function Navbar({ onMenuClick, offsetClass = "lg:left-[17rem]" }) {
  return (
    <header className={`fixed left-0 ${offsetClass} right-0 top-4 z-30`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 w-full bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-600 text-white shadow-sm rounded-xl flex items-center justify-between px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            className="lg:hidden rounded-md p-2 hover:bg-white/10 transition-all duration-200"
            aria-label="Open sidebar"
            onClick={onMenuClick}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.5"/></svg>
          </button>
          <h1 className="min-w-0 truncate text-sm sm:text-base font-medium">
            <span className="font-semibold">PowerLink</span>
            <span className="hidden sm:inline text-white/80"> – Powerloom Dashboard</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            className="relative rounded-full p-2 text-white hover:bg-white/10 transition-all duration-200"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" strokeWidth="1.5"/></svg>
          </button>
          <div className="relative group">
            <div className="flex items-center gap-2 cursor-pointer select-none">
              <div className="h-8 w-8 rounded-full bg-white/20 text-white grid place-items-center text-sm shadow">AD</div>
              <div className="hidden sm:block text-sm">
                <div className="font-medium">Admin</div>
                <div className="text-white/80">Administrator</div>
              </div>
              <svg className="h-4 w-4 text-white/80 group-hover:text-white transition" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
            </div>
            {/* Dropdown */}
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute right-0 mt-2 w-44 rounded-lg border border-white/20 bg-white/95 backdrop-blur p-2 shadow-lg">
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:shadow-md hover:shadow-teal-200/50 transition-all duration-200">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="1.5"/></svg>
                Profile
              </button>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:shadow-md hover:shadow-teal-200/50 transition-all duration-200">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeWidth="1.5"/></svg>
                Logout
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </header>
  );
}
