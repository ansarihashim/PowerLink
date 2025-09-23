import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Workers from "./pages/Workers.jsx";
import Loans from "./pages/Loans.jsx";
import Installments from "./pages/Installments.jsx";
import Expenses from "./pages/Expenses.jsx";
import Baana from "./pages/Baana.jsx";
import Beam from "./pages/Beam.jsx";
import Calendar from "./pages/Calendar.jsx";
import AddWorker from "./pages/AddWorker.jsx";
import AddLoan from "./pages/AddLoan.jsx";
import AddExpense from "./pages/AddExpense.jsx";
import Notifications from "./pages/Notifications.jsx";
import PayInstallment from "./pages/PayInstallment.jsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("pl_sidebar_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  }); // desktop sidebar collapse (persisted)

  // persist collapsed state
  useEffect(() => {
    try { localStorage.setItem("pl_sidebar_collapsed", JSON.stringify(collapsed)); } catch {}
  }, [collapsed]);

  // ESC closes mobile sidebar
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <BrowserRouter>
  <div className="min-h-screen bg-slate-50">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
        <Navbar
          onMenuClick={() => setSidebarOpen((v) => !v)}
          offsetClass={collapsed ? "lg:left-[6rem]" : "lg:left-[18rem]"}
        />
  <main className={`pt-24 ${collapsed ? "lg:pl-[6rem]" : "lg:pl-[18rem]"} px-4 sm:px-6 pb-8 transition-all duration-300 ease-in-out text-slate-700`}>
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/installments" element={<Installments />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/baana" element={<Baana />} />
          <Route path="/beam" element={<Beam />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/pay-installment" element={<PayInstallment />} />
          <Route path="/add-worker" element={<AddWorker />} />
          <Route path="/add-loan" element={<AddLoan />} />
          <Route path="/add-expense" element={<AddExpense />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
