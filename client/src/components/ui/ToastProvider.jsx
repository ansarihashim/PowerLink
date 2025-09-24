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
    ? 'border-teal-300 bg-teal-50 text-teal-800'
    : toast.type === 'error'
      ? 'border-rose-300 bg-rose-50 text-rose-800'
      : toast.type === 'warning'
        ? 'border-amber-300 bg-amber-50 text-amber-800'
        : 'border-slate-300 bg-white text-slate-800';
  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-lg border shadow-sm backdrop-blur-sm transition-all ${colors}`}
      role="status"
      aria-live="polite"
    >
      <button
        onClick={onClose}
        className="absolute right-1 top-1 rounded p-1 text-xs text-slate-500 hover:bg-black/5"
        aria-label="Close notification"
      >✕</button>
      <div className="p-3 pr-6">
        {toast.title && <div className="mb-0.5 text-sm font-semibold leading-snug">{toast.title}</div>}
        <div className="text-xs leading-relaxed">{toast.message}</div>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 animate-[shrink_3.5s_linear_forwards]" />
      <style>{`@keyframes shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } } .animate-[shrink_3.5s_linear_forwards]{ transform-origin:left; }`}</style>
    </div>
  );
}
