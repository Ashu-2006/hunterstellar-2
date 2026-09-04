/**
 * One recovered log record, rendered as a terminal readout.
 *
 * Shared by the post-answer reveal and the Fragments tab so a player recognises
 * the same artefact in both places -- if the reveal looked like a story beat
 * and the tab looked like a list item, a team would not realise the tab is
 * where the evidence lives.
 *
 * Monospace throughout: these are machine logs, and the field keys only read
 * as a readout when they align.
 */

const TONES = {
  notice: { rule: 'border-accent', head: 'text-accent' },
  warning: { rule: 'border-amber', head: 'text-amber' },
  critical: { rule: 'border-red', head: 'text-red' },
}

export function FragmentRecord({ fragment, dense = false }) {
  if (!fragment) return null
  const tone = TONES[fragment.tone] || TONES.notice

  return (
    <div className={`border-l-2 ${tone.rule} pl-4 flex flex-col gap-3`}>
      <p
        className={`font-mono ${dense ? 'text-[11px]' : 'text-[12px]'} ${tone.head} leading-snug break-words`}
      >
        [{fragment.header}]
      </p>

      <dl className="flex flex-col gap-2">
        {fragment.fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-0.5">
            <dt className="font-mono text-[10px] tracking-[0.12em] text-text-muted">
              {field.key}
            </dt>
            <dd
              className={`font-mono ${dense ? 'text-[12px]' : 'text-[13px]'} leading-relaxed text-text-primary`}
            >
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
