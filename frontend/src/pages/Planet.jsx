import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { Wordmark } from '../components/brand/Wordmark'
import { FragmentRecord } from '../components/FragmentRecord'
import {
  FRAGMENT_COUNT,
  FRAGMENTS,
  ASSEMBLED_MESSAGE,
  unlockedFragmentCount,
} from '../content/fragments'

/**
 * The fragment inventory.
 *
 * Entirely derived from the server's `progress` — no fetch, no local
 * bookkeeping. That means it is correct on a freshly cleared phone, works
 * offline, and shows the same thing to all four teammates regardless of who
 * was looking when a fragment was won.
 *
 * Records render in progress order and are never collapsed or truncated:
 * reading them in sequence is the puzzle, so the tab has to be the place a
 * team can lay all four side by side.
 */
export default function Planet() {
  const { user } = useAuth()
  const unlocked = unlockedFragmentCount(user?.progress)
  const complete = unlocked >= FRAGMENT_COUNT

  return (
    <Layout title="Fragments">
      <div className="flex-1 flex flex-col px-6 py-6 gap-6 overflow-y-auto">
        <div>
          <h1 className="display-grunge text-4xl text-text-primary">Data Fragments</h1>
          <p className="text-text-muted text-sm mt-2">
            {complete
              ? 'All four recovered. Read them in order.'
              : `${unlocked} of ${FRAGMENT_COUNT} recovered. Solve a station's challenge to earn the next.`}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: FRAGMENT_COUNT }, (_, i) => i + 1).map((index) => {
            const isUnlocked = index <= unlocked
            const fragment = FRAGMENTS[index]
            return (
              <div
                key={index}
                className={`w-full rounded-md border px-4 py-4 flex flex-col gap-3 ${
                  isUnlocked ? 'border-accent/40' : 'border-dashed border-border bg-surface/40'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`text-[11px] uppercase tracking-[0.25em] ${
                      isUnlocked ? 'text-accent' : 'text-text-muted'
                    }`}
                  >
                    {fragment.label}
                  </span>
                  {!isUnlocked && (
                    <Lock className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={2} />
                  )}
                </div>

                {isUnlocked ? (
                  <FragmentRecord fragment={fragment} dense />
                ) : (
                  // Redacted rather than empty: the shape of what is missing is
                  // part of the pull forward.
                  <div className="flex flex-col gap-1.5 py-0.5" aria-label="Not yet recovered">
                    <div className="h-3 w-full rounded bg-surface-alt/70" />
                    <div className="h-3 w-4/5 rounded bg-surface-alt/70" />
                    <div className="h-3 w-3/5 rounded bg-surface-alt/70" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {complete && (
          <div className="rounded-md border border-void-gold/50 bg-void-gold/10 px-4 py-5 flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.3em] text-void-gold">
              Assembled transmission
            </span>
            {ASSEMBLED_MESSAGE ? (
              <p className="text-void-gold text-[17px] leading-relaxed whitespace-pre-line">
                {ASSEMBLED_MESSAGE}
              </p>
            ) : (
              // No invented conclusion. The records above already say it; the
              // team's job is to say it back.
              <p className="text-void-gold text-[15px] leading-relaxed">
                Four records, one sequence. Where the Ultimate Power came from, where it can be
                assembled, what it throws backward — and what it needs to survive being made.
              </p>
            )}
            <p className="text-[12px] text-void-gold/80">
              Carry this into the final challenge. It is not solved in this app.
            </p>
          </div>
        )}

        {unlocked === 0 && (
          <p className="text-text-muted text-sm text-center py-4">
            No fragments yet. Solve your first station to begin the transmission.
          </p>
        )}

        {/* Reference material a crew comes back to, not something to sit
            beside the code input on the journey screen. */}
        <Link
          to="/prologue"
          className="self-center text-[11px] uppercase tracking-[0.2em] text-text-muted underline"
        >
          Re-read the prologue
        </Link>

        <div className="mt-auto pt-6 flex flex-col items-center gap-2">
          <Wordmark width={180} />
          <p className="text-text-muted text-[11px] text-center">
            Presented by <span className="font-semibold">ASTRONOMY &amp; PHYSICS SOCIETY</span>
          </p>
        </div>
      </div>
    </Layout>
  )
}
