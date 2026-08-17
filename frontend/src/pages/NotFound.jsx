import { Link } from 'react-router-dom'
import { Rocket } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">
        <Rocket className="w-16 h-16 text-text-muted mb-4" strokeWidth={1.5} />
        <h1 className="text-3xl font-bold text-text-primary mb-2">404</h1>
        <p className="text-text-secondary text-sm mb-6">Lost in the cosmos.</p>
        <Link
          to="/"
          className="bg-accent text-text-primary px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors no-underline"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
