export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-surface border border-surface-alt rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-colors duration-150 hover:border-border ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
