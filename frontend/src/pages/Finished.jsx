import { Trophy } from 'lucide-react'
import { Layout } from '../components/Layout'

export default function Finished() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="bg-surface border border-surface-alt rounded-lg p-8 max-w-sm w-full flex flex-col items-center text-center shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
          <Trophy className="w-16 h-16 text-green mb-4" strokeWidth={1.5} />
          <h1 className="text-2xl font-semibold text-text-primary mb-2">MISSION COMPLETE</h1>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            You navigated all 5 celestial bodies.
          </p>
          <p className="text-text-muted text-sm">
            Proceed to L104 for case study.
          </p>
        </div>
      </div>
    </Layout>
  )
}
