import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button.jsx';

// Simple password validation: >=6 chars, at least one lowercase, one uppercase, one special/non-alphanumeric char
const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const validPassword = passwordRule.test(password);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Email is required');
    if (mode === 'register' && !name.trim()) return setError('Name is required');
    if (!validPassword) return setError('Password must be 6+ chars, include lowercase, uppercase & a special character');
    try {
      setLoading(true);
      // Placeholder: replace with real API call later
      await new Promise(r => setTimeout(r, 700));
      alert(`${mode === 'login' ? 'Logged in' : 'Registered'} (demo only)`);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-500 via-cyan-600 to-teal-700 px-4 py-10 text-slate-700 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(160px_80px_at_20%_15%,rgba(255,255,255,0.45),rgba(255,255,255,0)_60%),radial-gradient(220px_120px_at_80%_70%,rgba(255,255,255,0.35),rgba(255,255,255,0)_65%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md rounded-2xl bg-white/90 backdrop-blur shadow-xl border border-white/40 p-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white grid place-items-center font-semibold shadow">PL</div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">PowerLink</h1>
            <p className="text-xs text-slate-500">{mode === 'login' ? 'Welcome back — please sign in' : 'Create your account'}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e)=> setName(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition hover:border-teal-300"
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition hover:border-teal-300"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 flex items-center justify-between">Password
              <span className={`text-[10px] tracking-wide ${password.length===0 ? 'text-slate-400' : validPassword ? 'text-teal-600' : 'text-rose-600'}`}>{validPassword ? 'Strong' : 'Needs: 6+, Aa & special'}</span>
            </label>
            <div className="relative group">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 pr-10 text-sm shadow-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-200 transition hover:border-teal-300"
                placeholder="••••••"
                autoComplete={mode==='login' ? 'current-password' : 'new-password'}
              />
              <button type="button" onClick={()=> setShowPw(s=>!s)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-teal-600 focus:outline-none">
                {showPw ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3l18 18M10.58 10.58a2 2 0 102.83 2.83" strokeWidth="1.5"/><path d="M6.53 6.53C4.64 7.94 3.27 9.81 3 10.2c-.13.2-.13.4 0 .6.46.72 4.55 6.2 9 6.2 1.37 0 2.68-.38 3.9-1.02M14.12 9.88a2 2 0 012.83 2.83" strokeWidth="1.5"/></svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" strokeWidth="1.5"/></svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 flex items-start gap-2">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 9v4m0 4h.01" strokeWidth="1.5"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="1.5"/></svg>
              <span>{error}</span>
            </div>
          )}

          <Button disabled={loading} className="w-full justify-center py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <span>Don't have an account? <button onClick={()=> { setMode('register'); setError(''); }} className="font-medium text-teal-600 hover:text-teal-700">Create one</button></span>
          ) : (
            <span>Already have an account? <button onClick={()=> { setMode('login'); setError(''); }} className="font-medium text-teal-600 hover:text-teal-700">Sign in</button></span>
          )}
        </div>

        <div className="mt-4 text-[10px] text-slate-400 text-center">
          Password must be at least 6 chars, include uppercase, lowercase & a special character.
        </div>
      </motion.div>

      <div className="mt-8 text-xs text-white/70">
        © {new Date().getFullYear()} PowerLink. All rights reserved.
      </div>
    </div>
  );
}
