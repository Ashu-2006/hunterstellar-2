import { FragmentCardExpandable } from './FragmentCardExpandable'
import {
  ASSEMBLED_MESSAGE,
  FRAGMENT_COUNT,
  FRAGMENT_LABELS,
  FRAGMENT_LINES,
} from '../utils/story'

/**
 * The four fragments, plus the message they assemble into.
 *
 * Entirely derived from the server's `progress`. No fetch, no local
 * bookkeeping, which means it is correct on a freshly cleared phone, it works
 * with no signal, and all four teammates see the same thing regardless of who
 * happened to be looking when a fragment was won.
 *
 * The most recently earned fragment opens by default. A crew arriving here
 * straight from a reveal is looking for the line they just got, and making
 * them tap for it would be a small insult.
 */
export function FragmentDeck({ unlocked = 0 }) {
  const count = Math.min(Math.max(unlocked, 0), FRAGMENT_COUNT)
  const complete = count >= FRAGMENT_COUNT

  if (count === 0) {
    // Empty is a first-run experience, not "nothing to show". It names what
    // this screen will hold and points at the one action that fills it.
    return (
      <div className="w-full border border-dashed border-border bg-surface/40 px-5 py-8 flex flex-col gap-3">
        <h2 className="display-grunge text-[26px] text-text-primary">Nothing recovered yet</h2>
        <p className="text-[14px] text-text-secondary leading-relaxed">
          Each station holds one quarter of the pulse&rsquo;s targeting data.
          Solve a station&rsquo;s challenge and its fragment lands here, readable
          for the rest of the hunt.
        </p>
        <p className="text-[13px] text-text-muted">
          Four fragments assemble into one transmission. You will need it at the end.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <ul className="w-full flex flex-col gap-3">
        {Array.from({ length: FRAGMENT_COUNT }, (_, i) => i + 1).map((index) => (
          <FragmentCardExpandable
            key={index}
            label={FRAGMENT_LABELS[index]}
            line={FRAGMENT_LINES[index]}
            unlocked={index <= count}
            defaultOpen={index === count}
          />
        ))}
      </ul>

      {complete && (
        <section className="w-full border border-void-gold/50 bg-void-gold/10 px-4 py-5 flex flex-col gap-3">
          <h2 className="font-mono text-[12px] tracking-[0.3em] uppercase text-void-gold">
            Assembled transmission
          </h2>
          <p className="text-void-gold text-[17px] leading-relaxed whitespace-pre-line">
            {ASSEMBLED_MESSAGE}
          </p>
          <p className="text-[12px] text-void-gold/80">
            Carry this into the final challenge. It is not solved in this app.
          </p>
        </section>
      )}
    </div>
  )
}

export default FragmentDeck
