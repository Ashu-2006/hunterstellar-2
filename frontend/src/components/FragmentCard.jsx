import { getFragment } from '../content/fragments'
import { FragmentRecord } from './FragmentRecord'

/**
 * The hand-over beat after a correct answer.
 *
 * Deliberately plain around the record itself — a team reads this standing in
 * a corridor, mid-hunt, and the log is the only thing on screen worth their
 * attention. The record scrolls if it has to; the Continue button never does.
 */
export function FragmentCard({ index, onContinue, isLast }) {
  const fragment = getFragment(index)

  // The caller skips this screen when it returns null, but an index outside
  // 1-4 (a replayed response, a future stop count) must never render
  // "undefined" at a team.
  if (!fragment) return null

  return (
    <div className="w-full flex-1 flex flex-col gap-6 px-6 py-8 overflow-y-auto">
      <div className="flex flex-col gap-3 shrink-0">
        <p className="text-[11px] uppercase tracking-[0.35em] text-accent">
          Data fragment recovered
        </p>
        <h2 className="display-grunge text-5xl text-text-primary">{fragment.label}</h2>
      </div>

      <FragmentRecord fragment={fragment} />

      <p className="text-xs text-text-muted shrink-0">
        {isLast
          ? 'That is the last fragment. Open Fragments to read all four in sequence.'
          : 'Saved to your Fragments tab. You can re-read it any time.'}
      </p>

      <button
        onClick={onContinue}
        className="w-full h-[52px] shrink-0 mt-auto bg-[#f6f6f6] text-text-inverse rounded-md font-display text-lg cursor-pointer"
      >
        {/* Never names where they are going. The fourth question is solved by
            the time this renders, but the reveal belongs to the clue screen
            one step later -- one clean turn instead of two. */}
        Continue
      </button>
    </div>
  )
}
