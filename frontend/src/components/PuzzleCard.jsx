import { useState } from 'react'

export function PuzzleCard({
  question,
  onSubmit,
  loading,
  error,
  disabled = false,
  disabledHint,
  onDirtyChange,
}) {
  const [answer, setAnswer] = useState('')

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
    <div className="w-full flex flex-col gap-7 px-6 pt-2 pb-8">
      <div className="flex flex-col gap-5">
        <h2 className="font-display text-xl text-text-secondary tracking-widest">Challenge</h2>
        {question ? (
          <p className="text-text-secondary text-[17px] leading-relaxed whitespace-pre-line">
            {question}
          </p>
        ) : (
          <p className="text-sm text-amber">
            This question didn&rsquo;t load. Pull to refresh, or show this screen to a marshal.
          </p>
        )}
      </div>

      {/* Wrong codes lock a team for 15 minutes; wrong answers do not. Teams
          conflate the two and stop guessing, so say it before they submit. */}
      <p className="text-xs text-text-muted -mt-2">
        Wrong answers don&rsquo;t lock you. Take your best guess.
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          value={answer}
          onChange={(e) => update(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          placeholder="Enter your answer here"
          aria-label="Your answer"
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
          disabled={loading || disabled || !answer.trim()}
          className="w-full h-[52px] bg-[#f6f6f6] text-text-inverse rounded-md font-display text-lg disabled:opacity-60"
        >
          {loading ? 'Verifying...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  )
}
