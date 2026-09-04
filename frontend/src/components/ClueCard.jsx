import { useState } from 'react'
import { RemoteImage } from './RemoteImage'
import { LOCKOUT_MINUTES } from '../utils/rules'

export function ClueCard({
  clue,
  images = [],
  cue,
  terminal = false,
  onSubmit,
  loading,
  error,
  disabled = false,
  disabledHint,
  onDirtyChange,
}) {
  const [code, setCode] = useState('')

  function update(value) {
    setCode(value)
    // Lets the screen know not to yank this view out from under a teammate
    // who is part-way through typing.
    onDirtyChange?.(value.trim().length > 0)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim() || loading || disabled) return
    const ok = await onSubmit(code.trim())
    // Only clear on success. Making someone retype a passcode they just got
    // wrong -- when a wrong code costs them the full lockout -- destroys the very
    // evidence they want to check.
    if (ok) {
      setCode('')
      onDirtyChange?.(false)
    }
  }

  const blocked = loading || disabled || !code.trim()

  return (
    <div className="w-full flex flex-col gap-7 px-6 pt-2 pb-8">
      <div className="flex flex-col gap-5">
        <h2 className="font-display text-xl text-text-secondary tracking-widest">
          {terminal ? 'The Null Void' : 'Station Computer'}
        </h2>

        {clue ? (
          <p className="text-text-secondary text-[17px] leading-relaxed whitespace-pre-line">
            {clue}
          </p>
        ) : (
          <p className="text-sm text-amber">
            This clue didn&rsquo;t load. Pull to refresh, or show this screen to a marshal.
          </p>
        )}

        {images.length > 0 && (
          <div className="flex flex-col gap-3">
            {images.map((src, i) => (
              <RemoteImage
                key={src || i}
                src={src}
                alt={`Clue image ${i + 1}`}
                fallbackNote="Image didn't load — the written clue is complete on its own."
              />
            ))}
          </div>
        )}
      </div>

      {terminal && (
        <div className="rounded-md border border-void-gold/40 bg-void-gold/10 px-4 py-3 flex flex-col gap-1">
          <p className="text-[13px] text-void-gold font-medium">
            The final challenge is not in this app.
          </p>
          <p className="text-[12px] text-void-gold/80">
            Enter the code from the Null Void here. A wrong code still costs{' '}
            {LOCKOUT_MINUTES} minutes.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          value={code}
          onChange={(e) => update(e.target.value)}
          disabled={disabled}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck="false"
          placeholder={terminal ? 'Enter the Void code' : 'Enter the station code'}
          aria-label={terminal ? 'Void code' : 'Station code'}
          className="w-full h-[60px] bg-surface border border-surface-alt rounded-md px-5 text-text-primary text-base placeholder:text-text-muted outline-none focus:border-accent disabled:opacity-50"
        />

        {error && (
          <p role="alert" className="text-sm text-red text-center">
            {error}
          </p>
        )}
        {disabled && disabledHint && (
          <p className="text-xs text-text-muted text-center">{disabledHint}</p>
        )}

        <button
          type="submit"
          disabled={blocked}
          className="w-full h-[52px] bg-[#f6f6f6] text-text-inverse rounded-md font-display text-lg disabled:opacity-60"
        >
          {loading ? 'Decrypting...' : cue || 'Decrypt Signal'}
        </button>
      </form>
    </div>
  )
}
