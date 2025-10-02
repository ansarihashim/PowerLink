import { createContext, useCallback, useContext, useRef, useState, useEffect } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts(ts => ts.filter(t => t.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm); timers.current.delete(id);
    }
  }, []);

  const push = useCallback((toast) => {
    const id = ++idCounter;
    const t = { id, type: toast.type || 'info', title: toast.title, message: toast.message, duration: toast.duration ?? 3500 };
    setToasts(ts => [...ts, t]);
    if (t.duration > 0) {
      const tm = setTimeout(() => remove(id), t.duration);
      timers.current.set(id, tm);
    }
    return id;
  }, [remove]);

  useEffect(() => () => {
    timers.current.forEach(v => clearTimeout(v));
    timers.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[320px] flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastItem({ toast, onClose }) {
  const colors = toast.type === 'success'
    ? 'border-teal-200/50 bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 text-teal-900'
    : toast.type === 'error'
      ? 'border-rose-200/50 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-50 text-rose-900'
      : toast.type === 'warning'
        ? 'border-amber-200/50 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 text-amber-900'
        : 'border-slate-200/50 bg-gradient-to-br from-white via-slate-50 to-white text-slate-800';
  
  const progressBar = toast.type === 'success'
    ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600'
    : toast.type === 'error'
      ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600'
      : toast.type === 'warning'
        ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600'
        : 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600';
  
  const closeButtonColor = toast.type === 'success'
    ? 'text-teal-600 hover:bg-teal-100'
    : toast.type === 'error'
      ? 'text-rose-600 hover:bg-rose-100'
      : toast.type === 'warning'
        ? 'text-amber-600 hover:bg-amber-100'
        : 'text-slate-500 hover:bg-slate-100';
  
  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm transition-all ${colors}`}
      role="status"
      aria-live="polite"
    >
      <button
        onClick={onClose}
        className={`absolute right-1.5 top-1.5 rounded-md p-1 text-xs transition-colors ${closeButtonColor}`}
        aria-label="Close notification"
      >✕</button>
      <div className="p-4 pr-8">
        {toast.title && <div className="mb-1 text-sm font-semibold leading-snug">{toast.title}</div>}
        <div className="text-xs leading-relaxed opacity-90">{toast.message}</div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full ${progressBar} animate-[shrink_3.5s_linear_forwards]`} />
      <style>{`@keyframes shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } } .animate-[shrink_3.5s_linear_forwards]{ transform-origin:left; }`}</style>
    </div>
  );
}
