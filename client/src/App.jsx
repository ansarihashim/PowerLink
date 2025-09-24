import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Workers from "./pages/Workers.jsx";
import Loans from "./pages/Loans.jsx";
import Installments from "./pages/Installments.jsx";
import WorkerDetail from "./pages/WorkerDetail.jsx";
import Expenses from "./pages/Expenses.jsx";
import Baana from "./pages/Baana.jsx";
import Beam from "./pages/Beam.jsx";
import Calendar from "./pages/Calendar.jsx";
import AddWorker from "./pages/AddWorker.jsx";
import AddLoan from "./pages/AddLoan.jsx";
import AddExpense from "./pages/AddExpense.jsx";
import AddBaana from "./pages/AddBaana.jsx";
import AddBeam from "./pages/AddBeam.jsx";
import Notifications from "./pages/Notifications.jsx";
import PayInstallment from "./pages/PayInstallment.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

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
      <AuthProvider>
        <RouteAwareLayout
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="pt-32 text-center text-sm text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
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
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Private><Dashboard /></Private>} />
          <Route path="/workers" element={<Private><Workers /></Private>} />
          <Route path="/workers/:id" element={<Private><WorkerDetail /></Private>} />
          <Route path="/loans" element={<Private><Loans /></Private>} />
          <Route path="/installments" element={<Private><Installments /></Private>} />
          <Route path="/expenses" element={<Private><Expenses /></Private>} />
          <Route path="/baana" element={<Private><Baana /></Private>} />
          <Route path="/beam" element={<Private><Beam /></Private>} />
          <Route path="/calendar" element={<Private><Calendar /></Private>} />
          <Route path="/notifications" element={<Private><Notifications /></Private>} />
          <Route path="/pay-installment" element={<Private><PayInstallment /></Private>} />
          <Route path="/add-worker" element={<Private><AddWorker /></Private>} />
          <Route path="/add-loan" element={<Private><AddLoan /></Private>} />
          <Route path="/add-expense" element={<Private><AddExpense /></Private>} />
          <Route path="/add-baana" element={<Private><AddBaana /></Private>} />
          <Route path="/add-beam" element={<Private><AddBeam /></Private>} />
          <Route path="/profile" element={<Private><Profile /></Private>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function RouteAwareLayout({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) {
  const location = useLocation();
  const authRoute = location.pathname.startsWith('/login');
  if (authRoute) {
    return <AnimatedRoutes />; // render only the auth page (Login)
  }
  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{
        ['--pl-sidebar-w']: collapsed ? '5rem' : '16rem',
        ['--pl-gap']: '2rem',
        ['--pl-offset']: 'calc(var(--pl-sidebar-w) + var(--pl-gap))',
      }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
      <Navbar
        onMenuClick={() => setSidebarOpen((v) => !v)}
        offsetClass={"lg:left-[var(--pl-offset)]"}
      />
      <main className={`relative pt-24 lg:pl-[var(--pl-offset)] pb-8 transition-all duration-300 ease-in-out text-slate-700`}>
        <div className="pointer-events-none absolute -top-8 left-0 right-0 h-12 bg-gradient-to-b from-slate-50 via-slate-50/80 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedRoutes />
        </div>
      </main>
    </div>
  );
}
