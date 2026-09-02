import { useState } from 'react'

export function PuzzleCard({ question, onSubmit, loading, error }) {
  const [answer, setAnswer] = useState('')
  async function handleSubmit(e) {
    e.preventDefault()
    if (!answer.trim()) return
    await onSubmit(answer.trim())
    setAnswer('')
  }
  return (
    <div className="w-full flex flex-col gap-8 px-6 pt-2">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-text-secondary tracking-widest">Challenge</h2>
        <p className="text-text-secondary text-[17px] leading-relaxed">{question}</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Enter your answer here" className="w-full h-[60px] bg-surface border border-surface-alt rounded-md px-5 text-text-primary text-base placeholder:text-text-muted outline-none focus:border-accent" />
        {error && <p role="alert" className="text-sm text-red text-center">{error}</p>}
        <button type="submit" disabled={loading || !answer.trim()} className="w-full h-[52px] bg-[#f6f6f6] text-text-inverse rounded-md font-display text-lg disabled:opacity-60">{loading ? 'Verifying...' : 'Submit Answer'}</button>
      </form>
    </div>
  )
}
