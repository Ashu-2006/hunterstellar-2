import { Star } from 'lucide-react'
import { PLANET_LIST } from '../../utils/story'

function Node({ item, done, active, hidden }) {
  const terminal = item.kind === 'terminal'
  const isBase = item.kind === 'base'
  if (hidden) {
    return <div className="flex items-center justify-center h-8 w-8 rounded-full border border-dashed border-surface-alt bg-transparent"><span className="w-1.5 h-1.5 rounded-full bg-border/60" /></div>
  }
  return (
    <div className={`relative flex items-center justify-center h-8 w-8 rounded-full border ${done ? 'border-green bg-green/10' : active ? 'border-accent bg-accent/15' : 'border-surface-alt bg-surface'}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${isBase ? 'bg-[#FB8C3A]' : done ? 'bg-green' : active ? 'bg-accent' : 'bg-border'}`} />
      {terminal && !active && !hidden && <Star className="absolute w-3.5 h-3.5 text-[#FFD6A0]" strokeWidth={2} />}
    </div>
  )
}

export function ProgressBar({ progress = 0 }) {
  const items = [{ key: 'base', name: 'Base', kind: 'base' }].concat(PLANET_LIST.map((p) => ({ key: p.name, name: p.name, kind: p.kind })))
  const currentIndex = Math.min(progress + 1, items.length)
  const maxIdx = items.length - 1
  return (
    <div className="w-full flex flex-col items-center gap-1.5">
      <div className="w-full flex items-center justify-between gap-0">
        {items.map((item, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          const hidden = i > currentIndex
          return (
            <div key={item.key} className="flex items-center flex-1 last:flex-none">
              <Node item={item} done={done} active={active} hidden={hidden} />
              {i < maxIdx && <div className="relative flex-1 h-[2px] mx-0.5 sm:mx-1 overflow-hidden rounded-full bg-border/50"><div className="absolute inset-y-0 left-0 bg-accent" style={{ width: done ? '100%' : '0%' }} /></div>}
            </div>
          )
        })}
      </div>
      <div className="w-full flex items-start justify-between">
        {items.map((item, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          const discovered = i <= currentIndex
          const label = item.kind === 'base' ? 'Base' : discovered ? (item.kind === 'terminal' ? 'Void' : item.name) : 'Locked'
          return <div key={item.key} className={`flex-1 last:flex-none text-center text-[8px] sm:text-[9px] uppercase tracking-wider leading-tight px-0.5 ${active ? 'text-text-primary font-semibold' : done ? 'text-text-muted' : 'text-text-muted/30'}`}>{label}</div>
        })}
      </div>
    </div>
  )
}
