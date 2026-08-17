export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <input
        className={`w-full bg-surface border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none ${
          error ? 'border-red' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red">{error}</p>}
    </div>
  )
}

export function CodeInput({ error, className = '', ...props }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <input
        type="text"
        maxLength={20}
        className={`w-[260px] bg-bg border-2 border-border rounded-lg px-4 py-3.5 text-xl font-mono font-medium text-text-primary uppercase tracking-[4px] text-center focus:border-accent focus:outline-none ${
          error ? 'border-red shake' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red">{error}</p>}
    </div>
  )
}
