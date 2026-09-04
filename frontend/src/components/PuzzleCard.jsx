import { useState } from 'react'

/**
 * The station's challenge, and the one thing to do about it.
 *
 * Same shape as ClueCard so the two stages of a stop read as one place with
 * two states, rather than two different screens. The display numeral changes
 * word and colour; everything below it holds position, so a player's thumb
 * lands in the same spot both times.
 */

const NUMERALS = ['I', 'II', 'III', 'IV', 'V']

export function PuzzleCard({
  question,
  progress = 0,
  onSubmit,
  loading,
  error,
  disabled = false,
  disabledHint,
  onDirtyChange,
}) {
  const [answer, setAnswer] = useState('')
  const stop = Math.min(Math.max(progress, 0), 4)

  function update(value) {
    setAnswer(value)
    onDirtyChange?.(value.trim().length > 0)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!answer.trim() || loading || disabled) return
    const ok = await onSubmit(answer.trim())
    if (ok) {
      setAnswer('')
      onDirtyChange?.(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-7 px-6 pt-5 pb-8">
      <div className="flex flex-col gap-5">
        <h2 className="display-grunge text-[44px] leading-none text-teal">
          Challenge {NUMERALS[stop]}
        </h2>

        {question ? (
          <p className="text-text-secondary text-[17px] leading-relaxed whitespace-pre-line">
            {question}
          </p>
        ) : (
          <p className="text-[13px] text-amber">
            This question did not load. Pull to refresh, or show this screen to a marshal.
          </p>
        )}

        {/* Wrong codes lock a team for fifteen minutes; wrong answers do not.
            Teams conflate the two and stop guessing, so say it before they
            submit rather than after. */}
        <p className="text-[12px] text-text-muted">
          Wrong answers do not lock you. Take your best guess.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          value={answer}
          onChange={(e) => update(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          placeholder="Enter your answer here"
          aria-label="Your answer"
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
          disabled={loading || disabled || !answer.trim()}
          className="w-full h-[52px] bg-[#f6f6f6] text-text-inverse rounded-md font-display
            text-lg disabled:opacity-60 motion-press cursor-pointer
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent
            focus-visible:outline-offset-2"
        >
          {loading ? 'Verifying...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  )
}
