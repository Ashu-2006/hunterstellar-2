import { Megaphone } from 'lucide-react'

export function AnnouncementBanner({ message }) {
  if (!message) return null

  return (
    <div className="bg-indigo/10 border border-indigo/30 border-l-[3px] border-l-indigo rounded-md px-4 py-3 flex items-start gap-3">
      <Megaphone className="w-4 h-4 text-indigo mt-0.5 shrink-0" />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  )
}
