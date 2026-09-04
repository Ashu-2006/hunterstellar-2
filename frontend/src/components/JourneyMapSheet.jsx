import { Check, Lock, Star } from 'lucide-react'
import { Sheet } from './ui/Sheet'
import { PLANET_LIST } from '../utils/story'

/**
 * The whole route, one tap from the clue.
 *
 * This is where the deleted ProgressBar's information went. The bar knew all of
 * this already but showed it as six 32px circles with 8px labels squeezed above
 * the clue. Here the same five stops get a row each, at a size a player can
 * read while walking.
 *
 * Names are revealed progressively, exactly as the bar did: a station the team
 * has not reached shows as "Unknown", because the route is randomised per team
 * and naming an unvisited stop would give away where they are being sent.
 */

const NUMERALS = ['I', 'II', 'III', 'IV', 'V']

export function JourneyMapSheet({ open, onClose, progress = 0 }) {
  const current = Math.min(Math.max(progress, 0), 4)

  return (
    <Sheet open={open} onClose={onClose} title="Your route" detent="auto">
      <p className="text-[13px] text-text-muted leading-relaxed mb-5">
        Five stops. Every crew gets a different order, so these names are yours
        alone and only appear once you arrive.
      </p>

      <ol className="flex flex-col">
        {PLANET_LIST.map((planet, i) => {
          const done = i < current
          const active = i === current
          const unknown = i > current
          const terminal = planet.kind === 'terminal'

          return (
            <li
              key={planet.name}
              aria-current={active ? 'step' : undefined}
              className={`flex items-start gap-3.5 py-3.5 ${
                i > 0 ? 'border-t border-border/60' : ''
              }`}
            >
              <span
                aria-hidden="true"
                className={`shrink-0 w-8 h-8 flex items-center justify-center border
                  font-mono text-[12px] ${
                    done
                      ? 'border-green/50 bg-green/10 text-green'
                      : active
                        ? terminal
                          ? 'border-void-gold bg-void-gold/15 text-void-gold'
                          : 'border-accent bg-accent/15 text-accent'
                        : 'border-dashed border-border text-text-muted/50'
                  }`}
              >
                {done ? (
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                ) : unknown ? (
                  <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                ) : (
                  NUMERALS[i]
                )}
              </span>

              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[14px] truncate ${
                      unknown
                        ? 'text-text-muted/50'
                        : active
                          ? terminal
                            ? 'text-void-gold font-medium'
                            : 'text-text-primary font-medium'
                          : 'text-text-secondary'
                    }`}
                  >
                    {unknown ? 'Unknown' : planet.name}
                  </span>
                  {terminal && !unknown && (
                    <Star
                      className="w-3.5 h-3.5 shrink-0 text-void-gold"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className="text-[12px] text-text-muted">
                  {done
                    ? 'Cleared'
                    : active
                      ? 'You are here'
                      : unknown
                        ? 'Bearing not yet received'
                        : planet.descriptor}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </Sheet>
  )
}

export default JourneyMapSheet
