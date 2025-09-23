import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
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

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
  <div className="min-h-screen bg-slate-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />
  <main className="pt-20 lg:pl-[17rem] px-4 sm:px-6 pb-8 transition-all duration-300 ease-in-out text-slate-700">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/installments" element={<Installments />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/baana" element={<Baana />} />
            <Route path="/beam" element={<Beam />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/add-worker" element={<AddWorker />} />
            <Route path="/add-loan" element={<AddLoan />} />
            <Route path="/add-expense" element={<AddExpense />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
