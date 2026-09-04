import { useId, useState } from 'react'
import { ChevronDown, Lock } from 'lucide-react'
import { FragmentRecord } from './FragmentRecord'
import { FRAGMENT_COUNT, getFragment } from '../content/fragments'

/**
 * The four recovered logs, as a deck of cards that open in place.
 *
 * Expand rather than peek or drill, for three reasons that point the same way:
 * each record belongs to exactly one card, each is short, and a crew reads
 * several together when they are trying to assemble the picture. A route per
 * fragment would be four navigations to read four logs.
 *
 * Entirely derived from the server's `progress`. No fetch, no local
 * bookkeeping, which means it is correct on a freshly cleared phone, it works
 * with no signal, and all four teammates see the same thing regardless of who
 * happened to be looking when a fragment was won.
 */

function FragmentCardExpandable({ index, unlocked, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const regionId = useId()
  const fragment = getFragment(index)
  const label = fragment?.label || `Fragment ${index}`

  if (!unlocked) {
    // A locked card is not an empty card: it shows redacted bars at the shape
    // of the record it hides, because the outline of what is missing is part of
    // what pulls a crew forward. It is deliberately not a button, since there
    // is nothing behind it yet.
    return (
      <li className="flex w-full flex-col gap-3 border border-dashed border-border bg-surface/40 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[12px] uppercase tracking-[0.24em] text-text-muted">
            {label}
          </span>
          <Lock className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1.5 py-0.5" aria-label="Not yet recovered">
          <div className="h-3 w-full bg-surface-alt/70" />
          <div className="h-3 w-4/5 bg-surface-alt/70" />
          <div className="h-3 w-3/5 bg-surface-alt/70" />
        </div>
      </li>
    )
  }

  return (
    <li className="card-noise w-full border border-accent/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={regionId}
        className="motion-press flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-1 focus-visible:outline-accent"
      >
        <span className="font-mono text-[12px] uppercase tracking-[0.24em] text-accent">
          {label}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`ease-standard h-4 w-4 shrink-0 text-accent transition-transform duration-[--duration-base] ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={2}
        />
      </button>

      <div id={regionId} className="motion-disclose" data-open={open ? 'true' : 'false'}>
        <div>
          <div className="px-4 pb-4">
            <FragmentRecord fragment={fragment} dense />
          </div>
        </div>
      </div>
    </li>
  )
}

export function FragmentDeck({ unlocked = 0 }) {
  const count = Math.min(Math.max(unlocked, 0), FRAGMENT_COUNT)

  if (count === 0) {
    // Empty is a first-run experience, not "nothing to show". It names what
    // this screen will hold rather than apologising for being blank.
    return (
      <div className="flex w-full flex-col gap-3 border border-dashed border-border bg-surface/40 px-5 py-8">
        <h2 className="display-grunge text-[26px] text-text-primary">Nothing recovered yet</h2>
        <p className="text-[14px] leading-relaxed text-text-secondary">
          Each station holds one fragment of the Ultimate Power. Solve a
          station&rsquo;s challenge and its log lands here, readable for the
          rest of the hunt.
        </p>
        <p className="text-[13px] text-text-muted">
          Four fragments, four pieces of the same picture.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex w-full flex-col gap-3">
      {Array.from({ length: FRAGMENT_COUNT }, (_, i) => i + 1).map((index) => (
        <FragmentCardExpandable
          key={index}
          index={index}
          unlocked={index <= count}
          // The most recently earned card opens by default. A crew arriving
          // here straight from a reveal wants the log they just got.
          defaultOpen={index === count}
        />
      ))}
    </ul>
  )
}

export default FragmentDeck
