import { useEffect } from 'react'
import { Info, X } from 'lucide-react'

/**
 * Transient, non-blocking feedback. Used for things the player should notice
 * but must not be interrupted by -- above all "a teammate already did this",
 * which is information, not an error.
 */
export function Toast({ message, tone = 'info', onDismiss, duration = 5000 }) {
  useEffect(() => {
    if (!message || !duration) return undefined
    const timer = setTimeout(() => onDismiss?.(), duration)
    return () => clearTimeout(timer)
  }, [message, duration, onDismiss])

  if (!message) return null

  const tones = {
    info: 'border-accent/40 bg-accent/10 text-accent',
    success: 'border-green/40 bg-green/10 text-green',
    warning: 'border-amber/40 bg-amber/10 text-amber',
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-md border animate-fadeIn ${tones[tone] || tones.info}`}
    >
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <p className="text-[12px] leading-snug flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0 cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
