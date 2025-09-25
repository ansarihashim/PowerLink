import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ isOpen, onClose, title, children, size = "md", height = 'auto' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Adjusted 'sm' width to comfortably contain calendar (was max-w-md ~ 28rem)
  const sizeClasses = {
    sm: "max-w-lg",      // ~32rem
    md: "max-w-xl",      // ~36rem
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  const heightClasses = {
    auto: '',
    tall: 'min-h-[620px]',
    taller: 'min-h-[720px]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                className={`relative w-full ${sizeClasses[size]} ${heightClasses[height]||''} bg-white rounded-lg shadow-xl flex flex-col`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                  <button
                    onClick={onClose}
                    className="rounded-md p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}