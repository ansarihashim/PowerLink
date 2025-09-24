import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/http.js";
import { useToast } from "./ui/ToastProvider.jsx";

export default function Navbar({ onMenuClick, offsetClass = "lg:left-[17rem]" }) {
  // Control for the profile dropdown (click-only)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { push } = useToast();
  const [avatarBusy, setAvatarBusy] = useState(false);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    setMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setMenuOpen(false);
  };

  // Close on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keyup", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keyup", handleKey);
    };
  }, []);
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
            onClick={() => navigate('/notifications')}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" strokeWidth="1.5"/></svg>
          </button>
          {/* Profile + dropdown (click on arrow only) */}
          <div className="relative" ref={menuRef}>
            <div className="flex items-center gap-2 select-none">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/30 shadow" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-white/20 text-white grid place-items-center text-sm shadow">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="hidden sm:block text-sm">
                <div className="font-medium">{user?.name || 'User'}</div>
                <div className="text-white/80">{user?.role || 'Member'}</div>
              </div>
              <button
                type="button"
                aria-label={menuOpen ? "Close profile menu" : "Open profile menu"}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                className="rounded-md p-1 text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <svg className={`h-4 w-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
              </button>
            </div>
            {/* Dropdown */}
            {menuOpen && (
              <div role="menu" className="transition-all duration-200 absolute right-0 mt-2 w-52 rounded-lg border border-white/20 bg-white/95 backdrop-blur p-2 shadow-lg">
                <div className="px-3 py-2 flex items-center gap-3 border-b border-slate-200/60">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="h-10 w-10 rounded-full object-cover ring-2 ring-teal-500/30" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white grid place-items-center text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 truncate max-w-[120px]">{user?.name || 'User'}</div>
                    <div className="text-slate-500 truncate max-w-[120px]">{user?.email}</div>
                  </div>
                </div>
                <label className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return; setAvatarBusy(true);
                      try {
                        const reader = new FileReader();
                        reader.onload = async () => {
                          try {
                            await api.updateProfile({ avatar: reader.result });
                            push({ type: 'success', title: 'Avatar Updated', message: 'Profile picture changed.' });
                            window.location.reload();
                          } catch (err) {
                            push({ type: 'error', title: 'Upload Failed', message: err.message });
                          } finally { setAvatarBusy(false); e.target.value = ''; }
                        };
                        reader.readAsDataURL(file);
                      } catch (err) {
                        setAvatarBusy(false);
                      }
                    }}
                  />
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 15l-3.5 2.1 1-4.1L7 9.9l4.2-.4L12 6l1.8 3.5 4.2.4-2.5 3.1 1 4.1z" strokeWidth="1.3"/></svg>
                  <span className="flex-1">{avatarBusy ? 'Uploading...' : 'Change Picture'}</span>
                </label>
                {user?.avatar && (
                  <button
                    onClick={async () => {
                      if (!confirm('Remove profile picture?')) return;
                      try {
                        await api.updateProfile({ avatar: '' });
                        push({ type: 'success', title: 'Removed', message: 'Avatar removed.' });
                        window.location.reload();
                      } catch (err) {
                        push({ type: 'error', title: 'Failed', message: err.message });
                      }
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 6l12 12M6 18L18 6" strokeWidth="1.5"/></svg>
                    Remove Picture
                  </button>
                )}
                <button 
                  onClick={handleProfileClick}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:shadow-md hover:shadow-teal-200/50 transition-all duration-200"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="1.5"/></svg>
                  Profile
                </button>
                <div className="h-px bg-slate-200 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:shadow-md hover:shadow-rose-200/50 transition-all duration-200"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeWidth="1.5"/></svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </header>
  );
}
