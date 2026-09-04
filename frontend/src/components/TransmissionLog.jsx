import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { STORY, PLANET_LIST } from '../utils/story'

/**
 * The story, on request only.
 *
 * The previous build had a story machine that gated play: a briefing you had to
 * click through before the first clue. It was removed for good reason, and the
 * `LEGACY_FLOW_KEY` cleanup in AuthContext exists so a stale copy can never
 * resurrect it. Nothing here re-adds a gate. A crew standing at a station in a
 * hurry never sees this unless they go looking.
 *
 * But the copy is genuinely good and it was written to be read:
 * `STORY.baseBriefing` and every station's `arrival`, `reveal` and `gained`
 * line sit in utils/story.js imported by absolutely nothing. So they get a
 * home here, opt-in, on the crew's own surface.
 *
 * Spoiler rule: a cleared station shows its full exchange, the current station
 * shows only its arrival. A station's `gained` line names where the crew is
 * sent next, so showing it for the current stop would hand out the next
 * bearing before they have earned it.
 */

function LogEntry({ title, subtitle, paragraphs, tone = 'default' }) {
  const [open, setOpen] = useState(false)
  const regionId = useId()

  const accent = tone === 'base' ? 'text-rust' : 'text-teal'

  return (
    <li className="w-full border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={regionId}
        className="w-full min-h-11 px-4 py-3.5 flex items-center justify-between gap-3
          text-left motion-press cursor-pointer
          focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent
          focus-visible:-outline-offset-2"
      >
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className={`font-mono text-[12px] tracking-[0.2em] uppercase ${accent}`}>
            {title}
          </span>
          <span className="text-[13px] text-text-muted truncate">{subtitle}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`w-4 h-4 shrink-0 text-text-muted transition-transform
            duration-[--duration-base] ease-standard ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      <div id={regionId} className="motion-disclose" data-open={open ? 'true' : 'false'}>
        <div>
          <div className="px-4 pb-4 flex flex-col gap-3">
            {paragraphs.map((text, i) => (
              <p
                key={i}
                className="text-text-secondary text-[14.5px] leading-relaxed whitespace-pre-line"
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </li>
  )
}

export function TransmissionLog({ progress = 0 }) {
  const current = Math.min(Math.max(progress, 0), 4)

  // 0..current inclusive: the crew has arrived at `current`, so its arrival
  // line is theirs to re-read.
  const reached = PLANET_LIST.slice(0, current + 1)

  return (
    <section className="w-full flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-mono text-[12px] tracking-[0.3em] uppercase text-text-muted">
          Transmission log
        </h2>
        <p className="text-[13px] text-text-muted leading-relaxed">
          Everything you have been told so far. Nothing here is required reading.
        </p>
      </div>

      <ul className="w-full flex flex-col gap-2">
        <LogEntry
          tone="base"
          title={STORY.baseBriefing.character}
          subtitle={STORY.baseBriefing.location}
          paragraphs={[...STORY.baseBriefing.lines, STORY.baseBriefing.sendoff]}
        />

        {reached.map((planet, i) => {
          const cleared = i < current
          const paragraphs = cleared
            ? [planet.arrival, planet.reveal, planet.gained].filter(Boolean)
            : [planet.arrival].filter(Boolean)

          return (
            <LogEntry
              key={planet.name}
              title={planet.robot?.label || planet.name}
              subtitle={cleared ? `${planet.name} · cleared` : `${planet.name} · you are here`}
              paragraphs={paragraphs}
            />
          )
        })}
      </ul>
    </section>
  )
}

export default TransmissionLog
