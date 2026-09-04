import { useEffect, useRef, useState } from 'react'
import { Bell, Megaphone, Radio, X } from 'lucide-react'

const SEEN_KEY = 'hunterstellar_seen_notifications'

/**
 * Notices and announcements used to appear as banners stacked above the clue.
 * That was the wrong trade: they pushed the one thing a player actually needs
 * off the screen on a 640px phone, and they auto-dismissed, so a teammate who
 * looked down for ten seconds lost a marshal's message with no way back to it.
 *
 * They live behind this bell instead -- persistent, re-readable, and out of
 * the clue's way, with an unread dot so an urgent announcement still pulls the
 * eye.
 */

function readSeen() {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function NotificationBell({ items = [] }) {
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(readSeen)
  const panelRef = useRef(null)

  const unread = items.filter((item) => !seen.includes(item.id))

  // Opening the panel is the read receipt. Done here rather than on render so
  // a badge can never clear without the player having actually looked.
  function toggle() {
    const next = !open
    setOpen(next)
    if (next && unread.length) {
      // Keep only ids still live plus the ones just read, so the list cannot
      // grow without bound over a long event.
      const merged = items.map((i) => i.id)
      setSeen(merged)
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(merged))
      } catch {
        /* ignore -- worst case the dot reappears */
      }
    }
  }

  useEffect(() => {
    if (!open) return undefined
    function onPointer(e) {
      if (!panelRef.current?.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={panelRef} className="relative shrink-0">
      <button
        onClick={toggle}
        aria-label={
          unread.length
            ? `Notifications, ${unread.length} unread`
            : 'Notifications'
        }
        aria-expanded={open}
        className="relative w-9 h-9 flex items-center justify-center rounded-full text-text-primary hover:bg-surface-alt/60 transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5" strokeWidth={1.8} />
        {unread.length > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber ring-2 ring-bg"
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-11 z-30 w-[300px] max-h-[60dvh] overflow-y-auto rounded-lg border border-surface-alt bg-surface shadow-2xl animate-fadeIn"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-alt/60">
            <p className="text-[10px] uppercase tracking-[0.28em] text-text-muted">
              Transmissions
            </p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              className="w-5 h-5 flex items-center justify-center text-text-muted cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-[13px] text-text-muted text-center">
              No transmissions. The channel is quiet.
            </p>
          ) : (
            <ul className="flex flex-col">
              {items.map((item) => {
                const isBroadcast = item.kind === 'announcement'
                const Icon = isBroadcast ? Megaphone : Radio
                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 px-4 py-3 border-b border-surface-alt/40 last:border-b-0"
                  >
                    <Icon
                      className={`w-4 h-4 mt-0.5 shrink-0 ${isBroadcast ? 'text-amber' : 'text-indigo'}`}
                      strokeWidth={1.8}
                    />
                    <div className="flex flex-col gap-1">
                      <p
                        className={`text-[10px] uppercase tracking-[0.2em] ${isBroadcast ? 'text-amber' : 'text-indigo'}`}
                      >
                        {item.label}
                      </p>
                      <p className="text-[13px] leading-snug text-text-secondary">
                        {item.message}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
