import { getFragment } from '../utils/story'

/**
 * The hand-over beat after a correct answer: one label, one line, one button.
 * Deliberately plain — a team reads this standing in a corridor, mid-hunt.
 */
export function FragmentCard({ index, onContinue, isLast }) {
  const fragment = getFragment(index)

  // Defensive: an index outside 1-4 (a replayed response, a future stop count)
  // must not render "undefined" at a team. The caller skips this screen when
  // it returns null.
  if (!fragment) return null

  return (
    <div className="w-full flex-1 flex flex-col justify-center gap-8 px-6 py-10">
      <div className="flex flex-col gap-4">
        <p className="text-[11px] uppercase tracking-[0.35em] text-accent">
          Data fragment recovered
        </p>
        <h2 className="display-grunge text-5xl text-text-primary">{fragment.label}</h2>
      </div>

      <blockquote className="border-l-2 border-accent pl-4 py-1">
        <p className="text-text-primary text-lg leading-relaxed whitespace-pre-line">
          {fragment.line}
        </p>
      </blockquote>

      <p className="text-xs text-text-muted">
        {isLast
          ? 'That is the last fragment. Open Fragments to read the assembled message.'
          : 'Saved to your Fragments tab. You can re-read it any time.'}
      </p>

      <button
        onClick={onContinue}
        className="w-full h-[52px] bg-[#f6f6f6] text-text-inverse rounded-md font-display text-lg cursor-pointer"
      >
        {isLast ? 'Continue to the Null Void' : 'Continue'}
      </button>
    </div>
  )
}
