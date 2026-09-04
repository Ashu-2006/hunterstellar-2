import { useState } from 'react'
import { ImageOff, Images } from 'lucide-react'
import { Skeleton } from './Skeleton'

/**
 * The clue, and the one thing to do about it.
 *
 * The screen now has a single dominant element. Previously the strongest type
 * here was a `text-xl` label reading "Station Computer", which is chrome, while
 * the clue itself sat at the same weight as everything around it. The comps put
 * a huge distressed numeral at the top of this screen, and that is the right
 * call: it tells a player at a glance which stop they are on and gives the eye
 * somewhere to land.
 *
 * Artwork is decoration for finding a place, never a gate. The first image is
 * boxed inline at the skeleton's ratio so the swap does not shift layout; the
 * rest are one tap away. A broken or slow image can never hide or delay the
 * code input, which renders regardless.
 */

const NUMERALS = ['I', 'II', 'III', 'IV', 'V']

/**
 * Keyed on `src` by the caller, so a new image is a new component instance
 * with fresh state. An effect that reset `status` on src change would commit
 * one frame still showing the previous image's resolved state first.
 */
function InlineImage({ src, onOpen, extra }) {
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)

  if (status === 'error') {
    return (
      <div
        className="w-full rounded-md border border-border bg-surface px-4 py-5
          flex flex-col items-center gap-2 text-center"
      >
        <ImageOff className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
        <p className="text-[12px] text-text-muted">
          Image did not load. The written clue is complete on its own.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('loading')
            setAttempt((n) => n + 1)
          }}
          className="min-h-11 px-3 text-[12px] text-accent underline motion-press cursor-pointer
            focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
        >
          Retry image
        </button>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open clue image full size"
        className="w-full relative rounded-md overflow-hidden border border-border bg-surface
          motion-press cursor-zoom-in block
          focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
      >
        {status === 'loading' && <Skeleton className="w-full aspect-[4/3]" />}
        <img
          key={attempt}
          src={src}
          alt="Clue image"
          decoding="async"
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
          className={`w-full h-auto block ${
            status === 'ready' ? '' : 'absolute opacity-0 pointer-events-none'
          }`}
        />
      </button>

      {extra > 0 && (
        <button
          type="button"
          onClick={onOpen}
          className="self-start min-h-11 flex items-center gap-2 text-[13px] text-accent
            motion-press cursor-pointer
            focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
        >
          <Images className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          {extra} more {extra === 1 ? 'image' : 'images'}
        </button>
      )}
    </div>
  )
}

export function ClueCard({
  clue,
  images = [],
  cue,
  terminal = false,
  progress = 0,
  onSubmit,
  onOpenImages,
  loading,
  error,
  disabled = false,
  disabledHint,
  onDirtyChange,
}) {
  const [code, setCode] = useState('')
  const stop = Math.min(Math.max(progress, 0), 4)

  function update(value) {
    setCode(value)
    // Lets the screen know not to swap this view out from under a teammate who
    // is part-way through typing.
    onDirtyChange?.(value.trim().length > 0)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim() || loading || disabled) return
    const ok = await onSubmit(code.trim())
    // Only clear on success. Making someone retype a passcode they just got
    // wrong, when a wrong code costs fifteen minutes, destroys the very
    // evidence they want to check.
    if (ok) {
      setCode('')
      onDirtyChange?.(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-7 px-6 pt-5 pb-8">
      <div className="flex flex-col gap-5">
        <h2
          className={`display-grunge text-[44px] leading-none ${
            terminal ? 'text-void-gold' : 'text-accent'
          }`}
        >
          {terminal ? 'The Void' : `Clue ${NUMERALS[stop]}`}
        </h2>

        {clue ? (
          <p className="text-text-secondary text-[17px] leading-relaxed whitespace-pre-line">
            {clue}
          </p>
        ) : (
          <p className="text-[13px] text-amber">
            This clue did not load. Pull to refresh, or show this screen to a marshal.
          </p>
        )}

        {images.length > 0 && (
          <InlineImage
            key={images[0]}
            src={images[0]}
            onOpen={onOpenImages}
            extra={images.length - 1}
          />
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
          className="w-full h-[60px] bg-surface border border-surface-alt rounded-md px-5
            text-text-primary text-base placeholder:text-text-muted outline-none
            focus:border-accent disabled:opacity-50"
        />

        {error && (
          <p role="alert" className="text-[13px] text-red text-center shake">
            {error}
          </p>
        )}
        {disabled && disabledHint && (
          <p className="text-[12px] text-text-muted text-center">{disabledHint}</p>
        )}

        <button
          type="submit"
          disabled={loading || disabled || !code.trim()}
          className="w-full h-[52px] bg-[#f6f6f6] text-text-inverse rounded-md font-display
            text-lg disabled:opacity-60 motion-press cursor-pointer
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent
            focus-visible:outline-offset-2"
        >
          {loading ? 'Decrypting...' : cue || 'Decrypt Signal'}
        </button>
      </form>
    </div>
  )
}
