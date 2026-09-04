import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Wordmark } from '../components/brand/Wordmark'
import { useAuth } from '../context/AuthContext'
import {
  ASSEMBLED_MESSAGE,
  FRAGMENT_COUNT,
  unlockedFragmentCount,
} from '../utils/story'

/**
 * The handoff from the app to the physical final challenge.
 *
 * This screen used to be pure story. It has to be both: a team arriving here
 * needs to know, without ambiguity, that the hunt continues offline and what
 * to do next.
 */
export default function Finished() {
  const { user } = useAuth()
  const complete = unlockedFragmentCount(user?.progress) >= FRAGMENT_COUNT

  return (
    <Layout title="The Null Void">
      <div className="flex-1 flex flex-col items-center px-6 py-8 gap-6 overflow-y-auto">
        <Wordmark width={200} />

        <h1 className="display-grunge text-4xl text-void-gold text-center">
          You are in the Null Void
        </h1>

        {complete && (
          <div className="w-full rounded-md border border-void-gold/50 bg-void-gold/10 px-4 py-5 flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.3em] text-void-gold">
              Assembled transmission
            </span>
            <p className="text-void-gold text-[17px] leading-relaxed whitespace-pre-line">
              {ASSEMBLED_MESSAGE}
            </p>
          </div>
        )}

        <div className="w-full rounded-md border border-accent/40 bg-accent/10 px-4 py-4 flex flex-col gap-2">
          <p className="text-accent text-[15px] font-medium">The final challenge is physical.</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Report to the marshals with your assembled transmission. The last problem is a
            case study, solved in person — not in this app. Nothing further happens on this
            screen.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 text-text-secondary text-[15px] leading-relaxed">
          <p>
            The signal that pulled you across the dark is quiet now. Four fragments,
            four stations, one message that was never meant to be reassembled.
          </p>
          <p className="text-text-muted">
            What you do with it is no longer the ship&rsquo;s decision.
          </p>
        </div>

        <Link
          to="/leaderboard"
          className="w-full h-[52px] flex items-center justify-center bg-[#f6f6f6] text-text-inverse rounded-md font-display text-lg no-underline mt-auto"
        >
          See the standings
        </Link>

        <p className="text-text-muted text-[11px] text-center">
          Presented by <span className="font-semibold">ASTRONOMY &amp; PHYSICS SOCIETY</span>
        </p>
      </div>
    </Layout>
  )
}
