import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 bg-white">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-100">
          <div className="h-8 w-8 rounded-lg bg-emerald-600" aria-hidden />
          <div className="font-semibold">PowerLink</div>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              aria-label={item.label}
            >
              <span className="text-gray-500">{item.icon}</span>
              <span>{item.label}</span>
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
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-600" aria-hidden />
                  <div className="font-semibold">PowerLink</div>
                </div>
                <button className="rounded-md p-2 hover:bg-gray-100" aria-label="Close sidebar" onClick={onClose}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth="1.5"/></svg>
                </button>
              </div>
              <nav className="p-3 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={onClose}
                    className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-label={item.label}
                  >
                    <span className="text-gray-500">{item.icon}</span>
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
