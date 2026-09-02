import { Link } from 'react-router-dom'
import { HunterstellarLogo } from '../components/HunterstellarLogo'

export default function Landing() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative w-full max-w-[412px] h-screen sm:h-[917px] bg-bg flex flex-col overflow-hidden border-x sm:border border-surface-alt shadow-2xl">
        <div className="flex-1 flex flex-col items-center justify-between px-6 py-16 bg-bg relative overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <HunterstellarLogo width={280} />
            <p className="text-text-primary text-center text-lg leading-snug max-w-[339px]">
              Mankind was born on Earth but was never meant to die here
            </p>
            <Link
              to="/login"
              className="mt-4 bg-[#f6f6f6] text-text-inverse px-10 py-3 rounded-md font-display text-lg no-underline"
            >
              Continue
            </Link>
          </div>
          <p className="text-text-primary text-center text-[15px] tracking-normal leading-snug whitespace-nowrap px-3">
            Presented by <span className="font-semibold">ASTRONOMY &amp; PHYSICS SOCIETY</span>
          </p>
        </div>
      </div>
    </div>
  )
}
