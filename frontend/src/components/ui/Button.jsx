export function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  const base = 'px-5 py-2.5 rounded-md text-sm font-semibold transition-colors duration-100 disabled:opacity-50 cursor-pointer'

  const variants = {
    primary: 'bg-accent text-text-primary hover:bg-accent-hover active:bg-accent-active',
    secondary: 'border border-border text-text-secondary hover:bg-surface bg-transparent',
    danger: 'bg-red text-text-primary hover:bg-red-hover',
    ghost: 'text-text-muted hover:bg-surface bg-transparent px-3 py-2',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
