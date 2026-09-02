import { useState, useEffect } from 'react'
import { STORY } from '../utils/story'
import commanderImg from '../assets/commander.svg'
import mcImg from '../assets/main-character.svg'
import robotCarina from '../assets/robot-carina.svg'
import robotVerra from '../assets/robot-verra.svg'
import robotNyx from '../assets/robot-nyx.svg'
import robotSolune from '../assets/robot-solune.svg'
import robotVoid from '../assets/robot-void.svg'

const AVATARS = {
  commander: commanderImg,
  mc: mcImg,
  'robot-carina': robotCarina,
  'robot-verra': robotVerra,
  'robot-nyx': robotNyx,
  'robot-solune': robotSolune,
  'robot-void': robotVoid,
}

function useTypewriter(text, speed = 22) {
  const [len, setLen] = useState(0)
  const [done, setDone] = useState(false)
  useEffect(() => {
    setLen(0)
    setDone(false)
    if (!text) { setDone(true); return }
    const id = setInterval(() => {
      setLen((l) => {
        if (l >= text.length) { clearInterval(id); setDone(true); return l }
        return l + 1
      })
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  function complete() { setLen(text.length); setDone(true) }
  return { shown: text.slice(0, len), done, complete }
}

function Avatar({ src, ring = '#38BDF8', size = 76 }) {
  return (
    <div className="rounded-full overflow-hidden bg-surface-alt flex items-center justify-center shrink-0" style={{ width: size, height: size, border: `2px solid ${ring}` }}>
      <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
    </div>
  )
}

export function Dialogue({ avatar, name, ring = '#38BDF8', lines, cta = 'Continue', footer, onDone, accent = '#38BDF8', speed = 14 }) {
  const [idx, setIdx] = useState(0)
  const current = lines[idx] || ''
  const { shown, done, complete } = useTypewriter(current, speed)
  const isLast = idx >= lines.length - 1
  function skipAll() { if (done && isLast) { onDone(); return } if (!done) complete(); setIdx(lines.length - 1) }
  function advance() { if (!done) { complete(); return } if (isLast) { onDone(); return } setIdx((i) => i + 1) }
  return (
    <div className="flex-1 flex flex-col px-6 py-6 w-full">
      <div className="flex-1 flex flex-col justify-center gap-5 pt-4 cursor-pointer" onClick={advance}>
        <div className="flex items-start gap-4">
          <Avatar src={avatar} ring={ring} />
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="font-display text-[15px] uppercase tracking-widest" style={{ color: accent }}>{name}</span>
            <p className="text-text-secondary leading-relaxed text-[16px] min-h-[3.5em]">{shown}{!done && <span className="inline-block w-1.5 h-4 ml-0.5 bg-accent animate-pulse" />}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 pt-6 pb-2 w-full">
        <div className="w-full flex items-center justify-between">
          <button onClick={skipAll} className="text-[11px] uppercase tracking-widest text-text-muted hover:text-text-secondary">Skip</button>
          <span className="text-[11px] text-text-muted/60">{idx + 1} / {lines.length}</span>
        </div>
        <button onClick={advance} className="w-full h-[52px] rounded-md font-display text-lg bg-[#f6f6f6] text-text-inverse">{isLast ? cta : done ? 'Continue' : 'Reveal'}</button>
        {footer && <p className="text-text-muted text-sm text-center">{footer}</p>}
      </div>
    </div>
  )
}

export function BaseBriefing({ onDone }) {
  const { lines, cta, sendoff, character, location } = STORY.baseBriefing
  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="px-6 pt-4 pb-1 text-center">
        <span className="inline-block px-3 py-1 rounded-full border border-[#FFD6A0]/40 text-[#FFD6A0] text-[11px] uppercase tracking-[0.25em]">{location}</span>
      </div>
      <Dialogue avatar={AVATARS.commander} ring="#FFD6A0" name={character} accent="#FFD6A0" lines={lines} cta={cta} footer={sendoff} onDone={onDone} speed={14} />
    </div>
  )
}

export function StationWelcome({ planet, onNext }) {
  return <Dialogue avatar={AVATARS[planet.robot?.avatar] || AVATARS['robot-carina']} ring="#2DD4BF" name={planet.robot?.label || planet.name} accent="#38BDF8" lines={[planet.arrival]} cta="Record the code" onDone={onNext} />
}
export function RobotReveal({ planet, onNext, terminal = false }) {
  return <Dialogue avatar={AVATARS[planet.robot?.avatar] || AVATARS['robot-carina']} ring={terminal ? '#FFD6A0' : '#2DD4BF'} name={planet.robot?.label || planet.name} accent={terminal ? '#FFD6A0' : '#38BDF8'} lines={[planet.reveal]} cta={terminal ? 'Enter the code' : 'Face the test'} onDone={onNext} />
}
export function McFinal({ onNext }) {
  const { lines, cta, character } = STORY.mcFinal
  return <Dialogue avatar={AVATARS.mc} ring="#2DD4BF" name={character} accent="#38BDF8" lines={lines} cta={cta} onDone={onNext} />
}
export function RobotFragment({ planet, final = false, onNext }) {
  const { gained } = planet
  return <Dialogue avatar={AVATARS[planet.robot?.avatar] || AVATARS['robot-carina']} ring="#38BDF8" name={planet.robot?.label || planet.name} accent="#38BDF8" lines={[gained]} cta={final ? 'Continue' : 'On to the next bearing'} onDone={onNext} />
}
export function CommanderBriefing(props) { return <BaseBriefing {...props} /> }
export function ComputerWelcome({ planet, onNext }) { return <StationWelcome planet={planet} onNext={onNext} /> }
export function StoryReveal({ planet, onNext, terminal = false }) { return <RobotReveal planet={planet} onNext={onNext} terminal={terminal} /> }
export function StoryFragment() { return null }
