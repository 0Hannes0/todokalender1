export function IconButton({ onClick, label, children, className = '', disabled = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-cream-dark focus:outline-none focus:ring-2 focus:ring-sage/50 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}
