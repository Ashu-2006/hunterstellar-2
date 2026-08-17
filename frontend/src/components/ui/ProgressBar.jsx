export function ProgressBar({ progress = 0 }) {
  const steps = [1, 2, 3, 4, 5]

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-0 w-full max-w-xs">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full transition-all duration-300 ${
                  step < progress + 1
                    ? 'w-2.5 h-2.5 bg-green'
                    : step === progress + 1
                    ? 'w-3 h-3 bg-accent'
                    : 'w-2.5 h-2.5 bg-border'
                }`}
              />
              <span className="text-[10px] text-text-muted mt-1">{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-[2px] flex-1 mx-1 ${
                  step < progress + 1 ? 'bg-green' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
