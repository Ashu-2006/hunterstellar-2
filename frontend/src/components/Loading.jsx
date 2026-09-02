import { Orbit } from 'lucide-react'

export function Loading({ label = 'Compiling navigation data...', full = false }) {
  return (
    <div
      className={
        full
          ? 'min-h-screen bg-bg flex items-center justify-center'
          : 'flex-1 flex items-center justify-center py-20'
      }
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-accent/20" />
          <Orbit className="absolute inset-0 w-full h-full text-accent animate-spin-slow" strokeWidth={1} />
        </div>
        <p className="text-sm text-text-muted font-mono tracking-widest uppercase">{label}</p>
      </div>
    </div>
  )
}
