import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ) },
  { to: "/workers", label: "Workers", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="1.5"/><path d="M12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" strokeWidth="1.5"/></svg>
  ) },
  { to: "/loans", label: "Loans", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 8c-1.657 0-3 1.343-3 3h6c0-1.657-1.343-3-3-3z" strokeWidth="1.5"/><path d="M5 12h14v7a1 1 0 01-1 1H6a1 1 0 01-1-1v-7z" strokeWidth="1.5"/></svg>
  ) },
  { to: "/installments", label: "Installments", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h10" strokeWidth="1.5"/></svg>
  ) },
  { to: "/expenses", label: "Expenses", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 8v8m-4-4h8" strokeWidth="1.5"/></svg>
  ) },
  { to: "/baana", label: "Baana", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7" strokeWidth="1.5"/></svg>
  ) },
  { to: "/beam", label: "Beam", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4" strokeWidth="1.5"/><path d="M4 12h4M16 12h4M12 4v4M12 16v4" strokeWidth="1.5"/></svg>
  ) },
  { to: "/calendar", label: "Calendar", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5"/><path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5"/></svg>
  ) },
  { to: "/user-management", label: "User Management", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="1.5"/></svg>
  ), adminOnly: true },
  { to: "/profile", label: "Profile", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="1.5"/></svg>
  ) },
];

export default function Sidebar({ open, onClose, collapsed = false, onToggleCollapse }) {
  const { user } = useAuth();
  return (
    <>
      {/* Desktop fixed sidebar */}
  <aside className={`hidden lg:block fixed inset-y-0 left-0 z-40 ${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-teal-500 via-cyan-600 to-teal-700 text-white transition-all duration-300`}>
        <div className="h-16 flex items-center justify-between gap-2 px-4 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-white/20 grid place-items-center font-semibold">PL</div>
            {!collapsed && <div className="font-semibold tracking-wide truncate">PowerLink</div>}
          </div>
          <button onClick={onToggleCollapse} className="hidden lg:inline-flex rounded-md p-2 hover:bg-white/10" aria-label="Collapse sidebar">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 6l-4 4 4 4M16 6l4 4-4 4" strokeWidth="1.5"/></svg>
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.filter(item => !item.adminOnly || user?.role === 'admin').map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                isActive
                  ? "bg-white/10 text-white shadow-inner border-l-4 border-teal-200"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
              aria-label={item.label}
            >
              <span className="text-white/70">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-teal-500 via-cyan-600 to-teal-700 text-white lg:hidden shadow-xl"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/20 grid place-items-center font-semibold">PL</div>
                  <div className="font-semibold tracking-wide">PowerLink</div>
                </div>
                <button className="rounded-md p-2 hover:bg-white/10" aria-label="Close sidebar" onClick={onClose}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth="1.5"/></svg>
                </button>
              </div>
              <nav className="p-3 space-y-1">
                {navItems.filter(item => !item.adminOnly || user?.role === 'admin').map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={onClose}
                    className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                      isActive
                        ? "bg-white/10 text-white border-l-4 border-teal-200"
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    }`}
                    aria-label={item.label}
                  >
                    <span className="text-white/70">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
