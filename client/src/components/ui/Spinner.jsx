export default function Spinner({ size = 20, className = '' }) {
  const s = typeof size === 'number' ? `${size}px` : size;
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-teal-500 border-t-transparent ${className}`}
      style={{ width: s, height: s }}
      aria-label="loading"
    />
  );
}
