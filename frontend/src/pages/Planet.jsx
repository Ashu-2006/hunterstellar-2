import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { FragmentDeck } from '../components/FragmentDeck'
import { TransmissionLog } from '../components/TransmissionLog'
import { Wordmark } from '../components/brand/Wordmark'
import { FRAGMENT_COUNT, unlockedFragmentCount } from '../utils/story'

/**
 * The crew's own surface: what they have recovered, and the story behind it.
 *
 * Both halves are derived from `user.progress` in context, with no fetch. That
 * is deliberate and it is what makes this the right screen to send a locked-out
 * crew to: it works with no signal, on a freshly cleared phone, and it shows
 * every teammate the same thing regardless of who was looking when a fragment
 * was won.
 *
 * The transmission log sits below the deck rather than above it. Fragments are
 * why a crew opens this tab; the story is why they might stay.
 */
export default function Planet() {
  const { user } = useAuth()
  const progress = user?.progress ?? 0
  const unlocked = unlockedFragmentCount(progress)
  const complete = unlocked >= FRAGMENT_COUNT

  return (
    <Layout title="Fragments">
      <div className="flex-1 flex flex-col px-5 py-6 gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="display-grunge text-[40px] leading-none text-text-primary">
            Data Fragments
          </h1>
          <p className="text-text-muted text-[14px] leading-relaxed">
            {complete
              ? 'All four recovered. The assembled transmission is below.'
              : `${unlocked} of ${FRAGMENT_COUNT} recovered. Solve a station's challenge to earn the next.`}
          </p>
        </header>

        <FragmentDeck unlocked={unlocked} />

        <TransmissionLog progress={progress} />

        <footer className="mt-auto pt-6 flex flex-col items-center gap-2">
          <Wordmark width={180} />
          <p className="text-text-muted text-[12px] text-center">
            Presented by <span className="font-semibold">ASTRONOMY &amp; PHYSICS SOCIETY</span>
          </p>
        </footer>
      </div>
    </Layout>
  )
}
