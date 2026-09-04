import { useId, useState } from 'react'
import { ChevronDown, Lock } from 'lucide-react'

/**
 * One fragment, as a card that opens in place.
 *
 * Expand rather than peek or drill, for three reasons that all point the same
 * way: the content belongs to exactly one card, each fragment is a short line
 * rather than a screenful, and a crew reads several together when they are
 * trying to assemble the message. That is the definition of in-row disclosure.
 * A route per fragment would be four navigations to read four sentences.
 *
 * A locked card is not an empty card. It shows redacted bars at the shape of
 * the line it is hiding, because the outline of what is missing is part of what
 * pulls a crew forward. It is also not a button: there is nothing behind it
 * yet, and a control that opens to nothing is the drill-to-nothing failure.
 */
export function FragmentCardExpandable({ label, line, unlocked, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const regionId = useId()

  if (!unlocked) {
    return (
      <li
        className="w-full border border-dashed border-border bg-surface/40 px-4 py-4
          flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[12px] tracking-[0.24em] uppercase text-text-muted">
            {label}
          </span>
          <Lock
            className="w-3.5 h-3.5 text-text-muted shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col gap-1.5 py-0.5" aria-label="Not yet recovered">
          <div className="h-3 w-full bg-surface-alt/70" />
          <div className="h-3 w-3/5 bg-surface-alt/70" />
        </div>
      </li>
    )
  }

  return (
    <li className="w-full border border-accent/40 card-noise">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={regionId}
        className="w-full min-h-11 px-4 py-4 flex items-center justify-between gap-3
          text-left motion-press cursor-pointer
          focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent
          focus-visible:-outline-offset-2"
      >
        <span className="font-mono text-[12px] tracking-[0.24em] uppercase text-accent">
          {label}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`w-4 h-4 shrink-0 text-accent transition-transform
            duration-[--duration-base] ease-standard ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      <div id={regionId} className="motion-disclose" data-open={open ? 'true' : 'false'}>
        <div>
          <p className="px-4 pb-4 text-text-primary text-[15px] leading-relaxed whitespace-pre-line">
            {line}
          </p>
        </div>
      </div>
    </li>
  )
}

export default FragmentCardExpandable
