import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ConfirmDialog({ open, title = 'Are you sure?', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', onConfirm, onCancel }) {
  useEffect(() => {
    function onKey(e){ if(e.key==='Escape') onCancel?.(); }
    if(open) document.addEventListener('keydown', onKey);
    return ()=> document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  const toneStyles = tone === 'danger'
    ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-400'
    : tone === 'primary'
      ? 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-400'
      : 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-400';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onCancel} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{opacity:0, scale:.94, y:16}}
              animate={{opacity:1, scale:1, y:0}}
              exit={{opacity:0, scale:.94, y:16}}
              transition={{duration:.18}}
              className="w-full max-w-sm rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-xs font-bold shadow">!</span>
                  {title}
                </h2>
                {message && <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>}
                <div className="mt-6 flex items-center justify-end gap-3 text-sm">
                  <button onClick={onCancel} className="rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1">{cancelLabel}</button>
                  <button onClick={onConfirm} className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${toneStyles}`}>{confirmLabel}</button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
