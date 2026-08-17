import { Link, useLocation } from 'react-router-dom'
import { Rocket, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (location.pathname === '/admin') return <>{children}</>

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-surface-alt px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-text-primary no-underline">
          <Rocket className="w-5 h-5 text-accent" />
          <span className="font-semibold text-sm tracking-wide">ODYSSEY</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user.team_name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}
