import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { Skeleton } from './Skeleton'

/**
 * Artwork is decoration; the text clue is always sufficient on its own. A
 * broken or slow image must never hide or delay the passcode input, so images
 * carry their own loading and error states and are laid out above a field that
 * renders regardless.
 */
function ClueImage({ src, index }) {
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)

  if (status === 'error') {
    return (
      <div className="w-full rounded-md border border-border bg-surface px-4 py-5 flex flex-col items-center gap-2 text-center">
        <ImageOff className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
        <p className="text-xs text-text-muted">
          Image didn&rsquo;t load — the written clue is complete on its own.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('loading')
            setAttempt((n) => n + 1)
          }}
          className="text-xs text-accent underline cursor-pointer"
        >
          Retry image
        </button>
      </div>
    )
  }

  return (
    <div className="w-full relative rounded-md overflow-hidden border border-border bg-surface">
      {status === 'loading' && <Skeleton className="w-full aspect-[4/3]" />}
      <img
        key={attempt}
        src={src}
        alt={`Clue image ${index + 1}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setStatus('ready')}
        onError={() => setStatus('error')}
        className={`w-full h-auto block ${status === 'ready' ? '' : 'absolute opacity-0 pointer-events-none'}`}
      />
    </div>
  )
}

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
    // wrong -- when a wrong code costs them 15 minutes -- destroys the very
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
              <ClueImage key={src || i} src={src} index={i} />
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
            Enter the code from the Null Void here. A wrong code still costs 15 minutes.
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
