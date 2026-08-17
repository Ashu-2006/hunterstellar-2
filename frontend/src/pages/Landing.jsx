import { Link } from 'react-router-dom'
import { Rocket, Puzzle, Trophy, Globe } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="px-6 py-3 flex items-center justify-between border-b border-surface-alt">
        <div className="flex items-center gap-2 text-text-primary">
          <Rocket className="w-5 h-5 text-accent" />
          <span className="font-semibold text-sm tracking-wide">ODYSSEY</span>
        </div>
        <Link
          to="/login"
          className="text-sm text-text-secondary hover:text-text-primary transition-colors no-underline"
        >
          Login
        </Link>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <Rocket className="w-16 h-16 text-accent mb-6" strokeWidth={1.5} />
        <h1 className="text-[40px] font-bold text-text-primary leading-tight mb-3">ODYSSEY</h1>
        <p className="text-text-secondary text-base mb-8 max-w-sm">
          Navigate the cosmos. Solve the mysteries.
        </p>
        <Link
          to="/login"
          className="inline-block bg-accent text-text-primary px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-accent-hover active:bg-accent-active transition-colors no-underline"
        >
          Begin Your Journey
        </Link>
      </section>

      <section className="px-6 py-12 flex justify-center gap-6 flex-wrap max-w-3xl mx-auto w-full">
        {[
          { icon: Globe, title: 'Explore Stations', desc: 'Navigate through celestial bodies across the campus.' },
          { icon: Puzzle, title: 'Solve Puzzles', desc: 'Crack codes and answer challenges at each stop.' },
          { icon: Trophy, title: 'Compete & Win', desc: 'Race against other teams to finish first.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-surface border border-surface-alt rounded-lg p-5 flex-1 min-w-[220px] max-w-[280px] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
          >
            <Icon className="w-8 h-8 text-accent mb-3" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      <footer className="px-6 py-4 border-t border-surface-alt text-center">
        <p className="text-xs text-text-muted">Made by Team Odyssey</p>
      </footer>
    </div>
  )
}
