import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { Layout } from '../components/Layout'
import { ClueCard } from '../components/ClueCard'
import { PuzzleCard } from '../components/PuzzleCard'
import { FragmentCard } from '../components/FragmentCard'
import { LockoutBanner } from '../components/LockoutBanner'
import { StateView, StaleChip } from '../components/StateView'
import { ClueSkeleton } from '../components/Skeleton'
import { Toast } from '../components/Toast'
import { notificationsFromState } from '../utils/notifications'
import { useTeamState } from '../hooks/useTeamState'
import { useOnline } from '../hooks/useOnline'
import { FRAGMENT_COUNT } from '../content/fragments'
import { describeError, formatCountdown, retryAfterSeconds, RETRY } from '../utils/errorCopy'

const FLOW_KEY = 'hunterstellar_v2'

/**
 * Only genuinely-local UI state lives here. Which fragments a team has earned
 * is NOT stored -- it is derived from the server's `progress`, so clearing
 * storage or switching phones loses nothing. That matters because four
 * teammates share one login and only one of them sees any given reveal.
 */
function loadFlow() {
  try {
    const raw = localStorage.getItem(FLOW_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { pendingReveal: parsed.pendingReveal ?? null }
    }
  } catch {
    /* corrupt or unavailable storage is not worth failing over */
  }
  return { pendingReveal: null }
}

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const online = useOnline()

  const { state, loading, error, lastUpdated, refetch, applyState } = useTeamState({
    teamId: user?.id,
  })

  const [flow, setFlow] = useState(loadFlow)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [toast, setToast] = useState(null)
  const [rateLimitedUntil, setRateLimitedUntil] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  // Set while a teammate is part-way through typing, so a poll cannot yank
  // the screen out from under them.
  const [inputDirty, setInputDirty] = useState(false)
  const [heldStage, setHeldStage] = useState(null)

  function persistFlow(next) {
    setFlow(next)
    try {
      localStorage.setItem(FLOW_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  // Drives both the rate-limit countdown and the stale-content chip.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Purely derived: it reaches zero on its own as `now` ticks, so there is no
  // second copy of this in state to keep in sync.
  const rateSecondsLeft = rateLimitedUntil
    ? Math.max(0, Math.round((rateLimitedUntil - now) / 1000))
    : 0

  const stage = state?.stage
  const progress = state?.team?.progress || 0

  // Memoised on the two strings, not on `state`: the poll hands back a fresh
  // object every 15s, and a new array each time would make the bell's unread
  // bookkeeping churn for no reason.
  const notifications = useMemo(
    () => notificationsFromState(state),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state?.notice, state?.announcement],
  )

  useEffect(() => {
    if (state?.team) updateUser(state.team)
  }, [state?.team, updateUser])

  useEffect(() => {
    // Only leave once the reveal has been acknowledged, or the last fragment
    // would never be shown.
    if (stage === 'finished' && !flow.pendingReveal) navigate('/finished')
  }, [stage, flow.pendingReveal, navigate])

  /**
   * A teammate advanced the stage while this member was typing. Swapping the
   * view now would destroy their half-entered code, so hold the previous stage
   * and let them choose when to move.
   *
   * Adjusted during render rather than in an effect (React's documented
   * pattern for deriving state from changing props): an effect would render
   * the wrong screen for one frame first, which is the exact flicker we are
   * trying to prevent.
   */
  const holdingForTyping = Boolean(inputDirty && heldStage && stage && heldStage !== stage)
  if (stage && !holdingForTyping && heldStage !== stage) {
    setHeldStage(stage)
  }

  const stageChangedWhileTyping = holdingForTyping

  const adoptLatest = useCallback(() => {
    setInputDirty(false)
    setHeldStage(stage)
    setSubmitError('')
  }, [stage])

  function handleFailure(err, ctx) {
    const described = describeError(err, ctx)
    if (described.retry === RETRY.COUNTDOWN) {
      const seconds = retryAfterSeconds(err) ?? described.seconds ?? 60
      setRateLimitedUntil(Date.now() + seconds * 1000)
      setSubmitError('')
      setToast({ tone: 'warning', message: `${described.title}. ${described.body}` })
      return
    }
    setSubmitError(`${described.title}. ${described.body}`)
  }

  /** Returns true when the submission succeeded, so inputs know to clear. */
  async function submit(path, payload, ctx) {
    if (!online) {
      setSubmitError("You're offline. This will work again once you reconnect.")
      return false
    }
    setSubmitError('')
    setSubmitting(true)
    try {
      const { data } = await api.post(path, payload)

      if (data.success) {
        // Trust the POST over the poll: it already describes the next stop.
        applyState(data.state)
        setInputDirty(false)
        setHeldStage(data.state?.stage ?? null)

        if (typeof data.fragment_index === 'number') {
          persistFlow({ ...flow, pendingReveal: data.fragment_index })
        }
        return true
      }

      if (data.reason === 'locked') {
        if (data.state) applyState(data.state)
        else refetch({ silent: true })
        setToast({ tone: 'warning', message: 'Your team is locked out right now.' })
        return false
      }

      if (data.reason === 'wrong_stage') {
        // Not an error: another member got there first. Both end up in the
        // right place; say so plainly rather than showing a failure.
        if (data.state) applyState(data.state)
        setInputDirty(false)
        setHeldStage(data.state?.stage ?? null)
        setToast({ tone: 'info', message: 'A teammate already submitted this one.' })
        return true
      }

      if (data.reason === 'finished') {
        if (data.state) applyState(data.state)
        return true
      }

      if (data.reason === 'wrong_code') {
        if (data.state) applyState(data.state)
        else refetch({ silent: true })
        return false
      }

      // wrong_answer, or anything unrecognised
      setSubmitError(
        ctx === 'question' ? 'Not quite. Try again.' : 'That code was not accepted.',
      )
      return false
    } catch (err) {
      handleFailure(err, ctx)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const submitCode = (code) => submit('/team/verify-code', { enteredCode: code }, 'clue')
  const submitAnswer = (ans) => submit('/team/verify-answer', { enteredAns: ans }, 'question')

  // ---------------------------------------------------------------- render

  const hasContent = Boolean(state)

  if (!hasContent) {
    return (
      <Layout title="Your Journey" notifications={notifications}>
        <StateView
          loading={loading}
          error={error}
          hasContent={false}
          skeleton={<ClueSkeleton />}
          onRetry={refetch}
        />
      </Layout>
    )
  }

  // Fragment reveal takes precedence over everything below it.
  if (flow.pendingReveal) {
    const index = flow.pendingReveal
    const dismiss = () => persistFlow({ ...flow, pendingReveal: null })
    return (
      <Layout title="Fragment secured" notifications={notifications}>
        <FragmentCard
          index={index}
          isLast={index >= FRAGMENT_COUNT}
          onContinue={dismiss}
        />
      </Layout>
    )
  }

  const locked = stage === 'locked'
  // The server decides this; the local check is only a fallback for payloads
  // that omit the flag (the `locked` branch does). The terminal stop is always
  // the one after the last fragment.
  const isTerminal = state.is_terminal ?? progress >= FRAGMENT_COUNT
  const showStale = Boolean(error) && hasContent
  const inputsDisabled = locked || !online || rateSecondsLeft > 0

  let disabledHint = null
  if (locked) disabledHint = 'Locked out — the timer above has to run down first.'
  else if (!online) disabledHint = 'Offline — reconnect to submit.'
  else if (rateSecondsLeft > 0)
    disabledHint = `Your team's attempts reset in ${formatCountdown(rateSecondsLeft)}.`

  let body
  if (stage === 'ready') {
    body = (
      <div className="flex-1 flex items-center justify-center px-8 text-center py-16">
        <p className="text-text-muted text-sm">
          Standing by. The first beacon activates when the hunt begins.
        </p>
      </div>
    )
  } else if (stage === 'awaiting_code') {
    body = (
      <ClueCard
        clue={state.clue_statement}
        images={state.clue_images || []}
        terminal={isTerminal}
        cue={isTerminal ? 'Cross into the void' : 'Decrypt Signal'}
        onSubmit={submitCode}
        loading={submitting}
        error={submitError}
        disabled={inputsDisabled}
        disabledHint={disabledHint}
        onDirtyChange={setInputDirty}
      />
    )
  } else if (stage === 'awaiting_puzzle') {
    body = (
      <PuzzleCard
        question={state.question}
        images={state.question_images || []}
        onSubmit={submitAnswer}
        loading={submitting}
        error={submitError}
        disabled={inputsDisabled}
        disabledHint={disabledHint}
        onDirtyChange={setInputDirty}
      />
    )
  } else if (stage === 'locked') {
    // Locked with no clue to show (the server withholds it) — still not a
    // dead end: the banner above carries the countdown.
    body = (
      <div className="flex-1 flex items-center justify-center px-8 text-center py-16">
        <p className="text-text-muted text-sm">
          Entry reopens when the timer runs out. Your fragments are still readable.
        </p>
      </div>
    )
  } else {
    body = (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center py-16 gap-3">
        <p className="text-text-muted text-sm">We couldn&rsquo;t read your current stage.</p>
        <button onClick={refetch} className="text-sm text-accent underline cursor-pointer">
          Refresh
        </button>
      </div>
    )
  }

  const showChrome = stage === 'awaiting_code' || stage === 'awaiting_puzzle' || locked

  /**
   * The briefing promises four stations, so the app promises four. The fifth
   * stop does not exist for the player until the fourth question is solved,
   * and neither does the "of 5" that would give it away.
   *
   * Keyed on `progress`, deliberately not on `isTerminal`: the server only
   * sends `is_terminal` on the awaiting_code payload, so a team locked out AT
   * the Null Void would fall back to "of 4" at the one moment the fifth stop
   * is most obviously real.
   */
  const totalStops = progress >= FRAGMENT_COUNT ? 5 : FRAGMENT_COUNT

  return (
    <Layout title={isTerminal ? 'The Null Void' : 'Your Journey'} notifications={notifications}>
      <div className="flex-1 flex flex-col items-center w-full">
        {showChrome && (
          <div className="w-full flex flex-col items-center px-6 pt-4 gap-3">
            <div className="w-full text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">
                Stop {Math.min(progress + 1, totalStops)} of {totalStops}
              </p>
              {isTerminal && (
                <h2 className="font-grotesk font-bold text-[22px] leading-none text-text-primary mt-1">
                  The Null Void
                </h2>
              )}
            </div>

            {showStale && <StaleChip lastUpdated={lastUpdated} now={now} onRetry={refetch} />}

            {locked && (
              <LockoutBanner
                lockUntil={state.lock_until}
                onExpire={() => refetch({ silent: true })}
              />
            )}

            {rateSecondsLeft > 0 && (
              <div className="w-full px-3 py-2 rounded-md border border-amber/40 bg-amber/10">
                <p className="text-[11px] text-amber">
                  Your team has used all 10 attempts for this 15-minute window. Next try in{' '}
                  <span className="font-mono tabular-nums">
                    {formatCountdown(rateSecondsLeft)}
                  </span>
                </p>
              </div>
            )}

            {stageChangedWhileTyping && (
              <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-accent/40 bg-accent/10">
                <span className="text-[11px] text-accent">
                  A teammate moved the team forward.
                </span>
                <button
                  onClick={adoptLatest}
                  className="text-[11px] text-accent underline cursor-pointer shrink-0"
                >
                  Show me
                </button>
              </div>
            )}

            {toast && (
              <Toast
                message={toast.message}
                tone={toast.tone}
                onDismiss={() => setToast(null)}
              />
            )}

          </div>
        )}

        <div className="w-full">{body}</div>
      </div>
    </Layout>
  )
}
