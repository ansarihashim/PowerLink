export default function Button({ variant = "brand", className = "", children, ...props }) {
  const base = "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300";
  const variants = {
    brand: "bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-lg hover:shadow-teal-300/50",
    subtle: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    outline: "border border-slate-200 text-slate-800 hover:bg-slate-50",
    ghost: "text-slate-800 hover:bg-slate-100",
  };
  return (
    <button className={`${base} ${variants[variant] ?? variants.brand} ${className}`} {...props}>
      {children}
    </button>
  );
}
