import { useEffect, useRef } from 'react'
import { Lock } from 'lucide-react'
import { useCountdown } from '../hooks/useCountdown'

/**
 * Replaces the old full-screen lockout modal.
 *
 * Fifteen minutes behind a blocking overlay with nothing to do is the worst
 * moment in the hunt. As a banner, the team keeps reading the clue they got
 * wrong, can re-read their fragments, and can watch the leaderboard while the
 * penalty runs. The penalty is enforced by disabling the input, not by hiding
 * the game.
 *
 * The old overlay also returned null the instant it expired and nothing
 * refetched, leaving a dead screen for up to a poll interval. `onExpire` fixes
 * that by pulling fresh state the moment the clock runs out.
 */
export function LockoutBanner({ lockUntil, onExpire }) {
  const { display, expired } = useCountdown(lockUntil)
  const fired = useRef(false)

  useEffect(() => {
    fired.current = false
  }, [lockUntil])

  useEffect(() => {
    if (expired && lockUntil && !fired.current) {
      fired.current = true
      onExpire?.()
    }
  }, [expired, lockUntil, onExpire])

  if (!lockUntil || expired) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full flex items-center gap-3 px-4 py-3 rounded-md border border-red/40 bg-red/10"
    >
      <Lock className="w-4 h-4 text-red shrink-0" strokeWidth={2} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-red font-medium">Wrong code — shuttle under repair</p>
        <p className="text-[11px] text-red/80">
          You can keep reading. Entry reopens in{' '}
          <span className="font-mono tabular-nums">{display}</span>
        </p>
      </div>
    </div>
  )
}
