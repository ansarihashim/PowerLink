import { BrowserRouter, Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Navbar />
        <main className="pt-20 pl-64 pr-6 pb-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/installments" element={<Installments />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/baana" element={<Baana />} />
            <Route path="/beam" element={<Beam />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
