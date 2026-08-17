import { Lock } from 'lucide-react'
import { useCountdown } from '../hooks/useCountdown'

export function LockoutOverlay({ lockUntil, islandName }) {
  const { display, expired } = useCountdown(lockUntil)

  if (expired) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 animate-fadeIn">
      <div className="bg-surface border border-surface-alt rounded-lg p-8 max-w-[360px] w-full mx-4 flex flex-col items-center text-center shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
        <Lock className="w-10 h-10 text-amber mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-4">Access Locked</h2>
        <p className="font-mono text-4xl font-medium text-text-primary mb-4 tracking-wider">{display}</p>
        <p className="text-sm text-text-muted">
          Wrong answer at {islandName}. Visit the correct celestial body.
        </p>
      </div>
    </div>
  )
}
