import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trophy, UserRound, Layers, Radio } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { SessionSheet } from './SessionSheet'

/**
 * The phone frame, the header, the nav rail, and the portal target every sheet
 * renders into.
 *
 * Two changes from the previous version.
 *
 * The nav rail went from four items to three. Logout was the fourth, which put
 * a session-ending action at Tier 1 beside three navigation destinations. It
 * now lives in SessionSheet, behind the crew button, behind a confirm step.
 *
 * The back chevron is gone. All three nav destinations are root tabs, so
 * "back" had no meaningful target and `handleBack` fell through to
 * `navigate('/dashboard')`, which is what the Journey tab already did. An
 * affordance that either does nothing or duplicates a neighbour is worse than
 * no affordance.
 *
 * `#hs-sheet-root` sits inside the frame rather than at the document root so
 * sheets are clipped to the 412px phone frame instead of spanning a desktop
 * viewport.
 */

const NAV_ITEMS = [
  { to: '/planet', key: 'fragments', label: 'Fragments', Icon: Layers },
  { to: '/dashboard', key: 'journey', label: 'Journey', Icon: Radio },
  { to: '/leaderboard', key: 'leaderboard', label: 'Standings', Icon: Trophy },
]

export function Layout({
  /** Plain-text header title. Ignored when `titleNode` is given. */
  title = 'Your Journey',
  /** Replaces the header's LEFT region only, for the Journey stop indicator.
      The right region is always owned by the header, so the crew button never
      disappears on a screen that supplies its own title. */
  titleNode,
  /** Screen-specific header controls, placed before the crew button. */
  actions,
  /** Set false on terminal screens where the rail would offer a false exit. */
  showNav = true,
  children,
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [sessionOpen, setSessionOpen] = useState(false)

  const activeKey = NAV_ITEMS.reduce(
    (acc, item) => (location.pathname.startsWith(item.to) ? item.key : acc),
    null,
  )

  function handleLogout() {
    setSessionOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#020712] flex items-center justify-center p-0 sm:p-4">
      <div
        className="relative grain-frame w-full max-w-[412px] h-[100dvh] sm:h-[min(917px,92dvh)]
          bg-bg flex flex-col overflow-hidden border-x sm:border border-surface-alt shadow-2xl"
      >
        <header
          className="flex items-center justify-between gap-2 px-4 h-[52px] shrink-0
            border-b border-surface-alt/40"
        >
          {titleNode || (
            <h1 className="font-display text-[15px] tracking-[0.18em] uppercase text-text-primary truncate">
              {title}
            </h1>
          )}
          <div className="flex items-center shrink-0">
            {actions}
            <CrewButton onClick={() => setSessionOpen(true)} />
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-y-auto">{children}</main>

        {showNav && (
          <nav
            aria-label="Sections"
            className="flex items-stretch h-16 bg-surface border-t border-surface-alt/40 shrink-0"
          >
            {NAV_ITEMS.map(({ to, key, label, Icon }) => {
              const active = activeKey === key
              return (
                <Link
                  key={key}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 no-underline
                    motion-press focus-visible:outline focus-visible:outline-1
                    focus-visible:outline-accent focus-visible:-outline-offset-2
                    ${active ? 'text-accent' : 'text-text-muted'}`}
                >
                  {/* Active state is carried by colour plus the rule above the
                      icon. Two channels, and both survive colour blindness. */}
                  <span
                    aria-hidden="true"
                    className={`h-[2px] w-7 ${active ? 'bg-accent' : 'bg-transparent'}`}
                  />
                  <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                  <span className="text-[12px] leading-none font-medium">{label}</span>
                </Link>
              )
            })}
          </nav>
        )}

        {/*
          Sheet portal target. pointer-events-none so it never swallows taps
          while empty; each sheet re-enables them on its own surface.
        */}
        <div
          id="hs-sheet-root"
          className="absolute inset-0 z-50 pointer-events-none"
        />

        <SessionSheet
          open={sessionOpen}
          onClose={() => setSessionOpen(false)}
          user={user}
          onLogout={handleLogout}
        />
      </div>
    </div>
  )
}

/**
 * Always the rightmost header control, on every screen. Consistent geography
 * is what lets a player learn where something lives once.
 */
export function CrewButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Your crew and session"
      className="w-11 h-11 -mr-2 flex items-center justify-center text-text-muted
        hover:text-text-primary motion-press cursor-pointer
        focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
    >
      <UserRound className="w-[19px] h-[19px]" strokeWidth={2} />
    </button>
  )
}

export default Layout
