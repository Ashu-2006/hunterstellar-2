import { useState } from 'react'

export function ClueCard({ clue, cue, terminal = false, onSubmit, loading, error }) {
  const [code, setCode] = useState('')
  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim()) return
    await onSubmit(code.trim())
    setCode('')
  }
  return (
    <div className="w-full flex flex-col gap-8 px-6 pt-2">
      <div className="flex flex-col gap-5">
        <h2 className="font-display text-xl text-text-secondary tracking-widest">{terminal ? 'The Null Void' : 'Station Computer'}</h2>
        <p className="text-text-secondary text-[17px] leading-relaxed whitespace-pre-line">{clue}</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={terminal ? 'Enter the Void code' : 'Enter the station code'} className="w-full h-[60px] bg-surface border border-surface-alt rounded-md px-5 text-text-primary text-base placeholder:text-text-muted outline-none focus:border-accent" />
        {error && <p role="alert" className="text-sm text-red text-center">{error}</p>}
        <button type="submit" disabled={loading || !code.trim()} className="w-full h-[52px] bg-[#f6f6f6] text-text-inverse rounded-md font-display text-lg disabled:opacity-60">{loading ? 'Decrypting...' : cue || 'Decrypt Signal'}</button>
      </form>
    </div>
  )
}
