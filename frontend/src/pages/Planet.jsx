import { useAuth } from '../context/AuthContext'
import { Layout } from '../components/Layout'
import { HunterstellarLogo } from '../components/HunterstellarLogo'
import { PLANET_LIST } from '../utils/story'

export default function Planet() {
  const { user } = useAuth()
  return (
    <Layout title="Route">
      <div className="flex-1 flex flex-col px-6 py-6 w-full gap-6">
        <div className="w-full text-center">
          <h1 className="font-grotesk font-bold text-[40px] leading-[0.95] text-accent whitespace-nowrap">The Route</h1>
          <p className="text-text-muted text-[15px] mt-3 leading-relaxed">Recover the fragments, then face the Null Void.</p>
        </div>
        <div className="w-full flex flex-col gap-3">
          {PLANET_LIST.map((p, i) => {
            const progress = user?.progress ?? 0
            const discovered = i <= progress
            const done = progress + 1 > i + 1
            if (!discovered) {
              return (
                <div key={p.name} className="flex items-center justify-between px-4 h-[52px] rounded-md border border-dashed border-surface-alt bg-transparent opacity-60">
                  <div className="flex items-center gap-3"><span className="font-bebas text-xl text-text-muted/50">{i + 1}.</span><span className="font-display text-[15px] text-text-muted">Signal locked</span></div>
                  <span className="text-[11px] tracking-widest text-text-muted/50 uppercase">Locked</span>
                </div>
              )
            }
            return (
              <div key={p.name} className={`flex items-center justify-between px-4 h-[52px] rounded-md border ${done ? 'border-green/40 bg-green/10' : 'border-surface-alt bg-surface'}`}>
                <div className="flex items-center gap-3"><span className="font-bebas text-xl text-text-muted">{i + 1}.</span><span className="font-display text-[15px] text-text-primary">{p.name}</span></div>
                <span className={`text-[12px] tracking-wide ${p.kind === 'terminal' ? 'text-[#FFD6A0]' : 'text-accent'} uppercase`}>{p.kind === 'terminal' ? 'Cross' : p.fragment.replace('Fragment ', 'Frag ')}</span>
              </div>
            )
          })}
        </div>
        <div className="flex-1" />
        <div className="flex flex-col items-center gap-3 pt-2 pb-2">
          <HunterstellarLogo width={200} className="opacity-60" />
          <p className="text-text-muted text-[13px] tracking-normal leading-snug whitespace-nowrap text-center px-3">Presented by <span className="font-semibold">ASTRONOMY & PHYSICS SOCIETY</span></p>
        </div>
      </div>
    </Layout>
  )
}
