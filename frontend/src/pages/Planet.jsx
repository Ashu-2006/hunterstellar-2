import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { FragmentDeck } from '../components/FragmentDeck'
import { Wordmark } from '../components/brand/Wordmark'
import { FRAGMENT_COUNT, unlockedFragmentCount } from '../content/fragments'

/**
 * The crew's own surface: what they have recovered, and the story behind it.
 *
 * Both halves derive from `user.progress` in context, with no fetch. That is
 * deliberate and it is what makes this the right screen to send a locked-out
 * crew to: it works with no signal, on a freshly cleared phone, and it shows
 * every teammate the same thing regardless of who was looking when a fragment
 * was won.
 *
 * The prologue link sits below the deck rather than above it. Fragments are
 * why a crew opens this tab; the story is why they might stay. It is a link
 * and never a redirect, because a crew standing at a station in a hurry must
 * never be made to read.
 */
export default function Planet() {
  const { user } = useAuth()
  const progress = user?.progress ?? 0
  const unlocked = unlockedFragmentCount(progress)
  const complete = unlocked >= FRAGMENT_COUNT

  return (
    <Layout title="Fragments">
      <div className="flex flex-1 flex-col gap-8 px-5 py-6 sm:px-6">
        <header className="flex flex-col gap-2">
          <h1 className="display-grunge text-[clamp(2rem,9vw,2.5rem)] leading-none text-text-primary">
            Data Fragments
          </h1>
          <p className="text-[14px] leading-relaxed text-text-muted">
            {complete
              ? `All ${FRAGMENT_COUNT} recovered. Carry them into the final challenge.`
              : `${unlocked} of ${FRAGMENT_COUNT} recovered. Solve a station's challenge to earn the next.`}
          </p>
        </header>

        <FragmentDeck unlocked={unlocked} />

        <section className="flex flex-col gap-3 border-t border-border/60 pt-6">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.3em] text-text-muted">
            Mission briefing
          </h2>
          <p className="text-[13px] leading-relaxed text-text-muted">
            Why the hunt started, and what Vilgax is after. Nothing here is
            required reading.
          </p>
          <Link
            to="/prologue"
            className="motion-press flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface font-display text-[15px] tracking-wide text-text-primary no-underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
          >
            <BookOpen className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Read the prologue
          </Link>
        </section>

        <footer className="mt-auto flex flex-col items-center gap-2 pt-6">
          <Wordmark width={180} />
          <p className="text-center text-[12px] text-text-muted">
            Presented by <span className="font-semibold">ASTRONOMY &amp; PHYSICS SOCIETY</span>
          </p>
        </footer>
      </div>
    </Layout>
  )
}
