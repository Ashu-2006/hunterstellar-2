import { useEffect, useState } from 'react'
import { Megaphone, X } from 'lucide-react'

// Auto-dismissing announcement banner. Shows when `message` changes and
// disappears after `duration` ms (also closable by the X).
export function AnnouncementBanner({ message, duration = 8000, tone = 'notice' }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    setHidden(false)
    if (!message) return
    const t = setTimeout(() => setHidden(true), duration)
    return () => clearTimeout(t)
  }, [message, duration])

  if (!message || hidden) return null

  const isWarning = tone === 'warning'
  const accent = isWarning ? 'border-amber text-amber' : 'border-indigo text-indigo'
  const bg = isWarning ? 'bg-amber/10' : 'bg-indigo/10'

  return (
    <div className={`${bg} ${accent} border-l-[3px] rounded-md px-4 py-3 flex items-start gap-3 animate-slide-up`}>
      <Megaphone className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-sm text-text-secondary flex-1">{message}</p>
      <button
        onClick={() => setHidden(true)}
        aria-label="Dismiss"
        className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-surface-alt transition-colors"
      >
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  )
}
