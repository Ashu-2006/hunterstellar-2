/**
 * Where the team is, in one line. Fills the header's left region.
 *
 * This replaces `ui/ProgressBar`. The bar rendered six nodes, connector rails
 * and a row of 8px labels directly beneath an eyebrow that already said
 * "Chapter 3 of 5" in words. Two channels for one fact, and the bar was the
 * redundant one, so the fact stays and the bar goes.
 *
 * Everything the bar actually knew (which stops are done, which names have been
 * revealed, where the Void sits) moves into JourneyMapSheet, one tap away,
 * where it can be read at a legible size instead of 8px.
 */

const NUMERALS = ['I', 'II', 'III', 'IV', 'V']

export function StopIndicator({ name, progress = 0, terminal = false }) {
  const stop = Math.min(Math.max(progress, 0), 4)

  return (
    <div className="flex items-baseline gap-2.5 min-w-0">
      <h1
        className={`font-display text-[15px] tracking-[0.18em] uppercase truncate ${
          terminal ? 'text-void-gold' : 'text-text-primary'
        }`}
      >
        {name || 'Standing by'}
      </h1>
      <span
        className={`font-mono text-[12px] shrink-0 ${
          terminal ? 'text-void-gold/70' : 'text-text-muted'
        }`}
      >
        <span className="sr-only">Stop </span>
        {NUMERALS[stop]}
        <span className="sr-only"> of V</span>
      </span>
    </div>
  )
}

export default StopIndicator
