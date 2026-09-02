import { Layout } from '../components/Layout'
import { HunterstellarLogo } from '../components/HunterstellarLogo'

export default function Finished() {
  return (
    <Layout title="The Anomaly">
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full flex flex-col items-center text-center gap-6">
          <HunterstellarLogo width={240} className="mb-2" />
          <h1 className="font-grotesk font-bold text-3xl text-[#FFD6A0]">THE PULSE IS FIRED</h1>
          <div className="flex flex-col gap-3 text-left">
            <p className="text-text-secondary text-[17px] leading-relaxed">
              You entered the Null Void, set the coordinates, and fired the tachyon pulse meant to
              cure the Vacuum Decay. All four fragments at once — the data whole, the aim true.
            </p>
            <p className="text-accent text-[17px] leading-relaxed font-medium">
              The Cure was the cause. The gamma-ray burst that seeded this hunt was your own.
            </p>
            <p className="text-text-secondary text-[17px] leading-relaxed">
              The mission was never to undo someone else’s mistake. It was to complete the loop you
              were about to start — the pulse that scattered the fragments across the four data
              centers, and the burst that hurled your younger selves toward this very hunt.
            </p>
            <p className="text-text-muted text-[17px] leading-relaxed">
              You did not fix history. You wrote it — as it was always meant to be written.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
