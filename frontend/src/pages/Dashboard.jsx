import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import supabase from '../supabaseClient'
import { Layout } from '../components/Layout'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ClueCard } from '../components/ClueCard'
import { PuzzleCard } from '../components/PuzzleCard'
import { LockoutOverlay } from '../components/LockoutOverlay'
import { AnnouncementBanner } from '../components/AnnouncementBanner'
import {
  BaseBriefing,
  StationWelcome,
  RobotReveal,
  RobotFragment,
  McFinal,
} from '../components/StoryCards'
import ErrorBoundary from '../components/ErrorBoundary'
import { getPlanet } from '../utils/story'
import { Loading } from '../components/Loading'

const FLOW_KEY = 'hunterstellar_flow'

function loadFlow() {
  try {
    const raw = localStorage.getItem(FLOW_KEY)
    if (raw) {
      const f = JSON.parse(raw)
      return {
        started: !!f.started,
        seen: f.seen || {},
        pendingFragment: !!f.pendingFragment,
        pendingMcFinal: !!f.pendingMcFinal,
        traveling: !!f.traveling,
      }
    }
  } catch {
    /* ignore */
  }
  return { started: false, seen: {}, pendingFragment: false, pendingMcFinal: false, traveling: false }
}

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successFlash, setSuccessFlash] = useState(false)
  const [flow, setFlow] = useState(loadFlow)

  function persistFlow(next) {
    setFlow(next)
    try {
      localStorage.setItem(FLOW_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    let cancelled = false
    let hasMounted = false
    let realtimeChannel = null

    if (user && supabase && !realtimeChannel) {
      realtimeChannel = supabase
        .channel(`team-state-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'teams',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            if (!cancelled && hasMounted) {
              setState(payload.new)
              if (payload.new.team) updateUser(payload.new.team)
            }
          },
        )
        .subscribe()
    }

    async function load() {
      try {
        const { data } = await api.get('/team/state')
        if (cancelled) return
        setState(data)
        if (data.team) updateUser(data.team)
        if (data.stage === 'finished') navigate('/finished')
      } catch {
        /* silent */
      } finally {
        if (!cancelled) {
          setLoading(false)
          hasMounted = true
        }
      }
    }

    load()
    const interval = setInterval(load, 15000)

    return () => {
      cancelled = true
      clearInterval(interval)
      if (realtimeChannel) supabase.removeChannel(realtimeChannel)
    }
  }, [user, supabase])

  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          setState((prev) =>
            prev ? { ...prev, announcement: payload.new.message } : prev,
          )
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function handleCodeSubmit(code) {
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/team/verify-code', { enteredCode: code })
      if (data.success) {
        setSuccessFlash(true)
        setTimeout(() => setSuccessFlash(false), 300)
        setState(data.state)
        if (data.state.team) updateUser(data.state.team)
        if (data.state.stage === 'finished') navigate('/finished')
      } else if (data.reason === 'locked') {
        setState((prev) => ({ ...prev, stage: 'locked', lock_until: data.lock_until }))
      } else if (data.reason === 'wrong_stage' && data.state) {
        setState(data.state)
        if (data.state.team) updateUser(data.state.team)
        if (data.state.stage === 'finished') navigate('/finished')
      } else {
        setError('Wrong code. Try again.')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAnswerSubmit(answer) {
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/team/verify-answer', { enteredAns: answer })
      if (data.success) {
        setSuccessFlash(true)
        setTimeout(() => setSuccessFlash(false), 300)
        persistFlow({ ...flow, pendingFragment: true })
        setState(data.state)
        if (data.state.team) updateUser(data.state.team)
        if (data.state.stage === 'finished') navigate('/finished')
      } else if (data.reason === 'locked') {
        setState((prev) => ({ ...prev, stage: 'locked', lock_until: data.lock_until }))
      } else if (data.reason === 'wrong_stage' && data.state) {
        setState(data.state)
        if (data.state.team) updateUser(data.state.team)
        if (data.state.stage === 'finished') navigate('/finished')
      } else {
        setError('Wrong answer. Try again.')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Loading label="Tuning the receiver..." />
      </Layout>
    )
  }

  if (!state) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red text-sm">Could not load the signal.</p>
        </div>
      </Layout>
    )
  }

  const progress = state.team?.progress || 0
  const stage = state.stage
  const planet = getPlanet(progress)
  const isTerminal = planet.kind === 'terminal'
  const seenCount = flow.seen[String(progress)] || 0

  // ---- Base: Commander only (progress 0, before shuttle) ----
  if (!flow.started) {
    return (
      <Layout title="Base">
        <ErrorBoundary fallback={<p className="text-center py-20">An error occurred. Please refresh.</p>}>
          {stage === 'locked' && state.lock_until && (
            <LockoutOverlay lockUntil={state.lock_until} islandName="the station" />
          )}
          <BaseBriefing
            onDone={() => persistFlow({ ...flow, started: true, traveling: true })}
          />
        </ErrorBoundary>
      </Layout>
    )
  }

  // ---- Shuttle travel between stations (skipped) ----
  if (flow.traveling) {
    persistFlow({ ...flow, traveling: false })
    return null
  }

  // ---- Pending fragment beat (after a correct answer) ----
  if (flow.pendingFragment) {
    const solvedStop = Math.max(0, progress - 1)
    const isLast = solvedStop >= 3
    const solvedPlanet = getPlanet(solvedStop)
    return (
      <Layout title="Fragment secured">
        <ErrorBoundary fallback={<p className="text-center py-20">An error occurred. Please refresh.</p>}>
          <RobotFragment
            planet={solvedPlanet}
            final={isLast}
            onNext={() =>
              isLast
                ? persistFlow({ ...flow, pendingFragment: false, pendingMcFinal: true })
                : persistFlow({ ...flow, pendingFragment: false, traveling: true })
            }
          />
        </ErrorBoundary>
      </Layout>
    )
  }

  // ---- MC’s only line: after all fragments, before crossing the Void ----
  if (flow.pendingMcFinal) {
    return (
      <Layout title="The final fragment">
        <ErrorBoundary fallback={<p className="text-center py-20">An error occurred. Please refresh.</p>}>
          <McFinal onNext={() => persistFlow({ ...flow, pendingMcFinal: false, traveling: true })} />
        </ErrorBoundary>
      </Layout>
    )
  }

  // ---- Ready (event not started) ----
  if (stage === 'ready') {
    return (
      <Layout title="Standing by">
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-text-muted text-sm">
            Standing by. The first beacon activates when the collapse begins.
          </p>
        </div>
      </Layout>
    )
  }

  // ---- Locked ----
  if (stage === 'locked') {
    return (
      <Layout title={planet.name}>
        {state.lock_until && (
          <LockoutOverlay lockUntil={state.lock_until} islandName={planet.name} />
        )}
      </Layout>
    )
  }

  // ---- Stop interludes vs inputs ----
  let body
  let title = planet.name

  if (stage === 'awaiting_code') {
    if (seenCount < 1) {
      title = 'Arrival'
      body = (
        <StationWelcome
          planet={planet}
          onNext={() =>
            persistFlow({ ...flow, seen: { ...flow.seen, [String(progress)]: 1 } })
          }
        />
      )
    } else {
      title = isTerminal ? planet.name : `Clue ${progress + 1}`
      body = (
        <ClueCard
          clue={state.clue_statement}
          cue={isTerminal ? 'Cross into the void' : 'Enter the station code'}
          terminal={isTerminal}
          onSubmit={handleCodeSubmit}
          loading={submitting}
          error={error}
        />
      )
    }
  } else if (stage === 'awaiting_puzzle') {
    if (seenCount < 2) {
      title = 'Inside'
      body = (
        <RobotReveal
          planet={planet}
          onNext={() =>
            persistFlow({ ...flow, seen: { ...flow.seen, [String(progress)]: 2 } })
          }
        />
      )
    } else {
      title = `Challenge ${progress + 1}`
      body = (
        <PuzzleCard
          question={state.question}
          brief={planet.reveal}
          onSubmit={handleAnswerSubmit}
          loading={submitting}
          error={error}
        />
      )
    }
  } else {
    title = planet.name
    body = <div className="text-center text-text-muted text-sm py-12">Signal lost.</div>
  }

  return (
    <ErrorBoundary fallback={<p className="text-center py-20">An error occurred. Please refresh the page.</p>}>
      <Layout title={title}>
        {stage === 'locked' && state.lock_until && (
          <LockoutOverlay lockUntil={state.lock_until} islandName={planet.name} />
        )}

        <div className="flex-1 flex flex-col items-center w-full">
          {stage !== 'awaiting_code' && stage !== 'awaiting_puzzle' ? null : (
            <div className="w-full flex flex-col items-center px-6 pt-4 gap-3">
              {/* Title block — compact hierarchy to keep task above fold */}
              <div className="w-full text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">
                  Mission {Math.min(progress + 1, 5)} / 5 · {planet.fragment || planet.descriptor}
                </p>
                <h2 className="font-grotesk font-bold text-[22px] leading-none text-text-primary mt-1">
                  {planet.name}
                </h2>
              </div>

              <ProgressBar progress={progress} />

              {(state.notice || state.announcement) && (
                <div className="w-full flex flex-col gap-2">
                  {state.notice && <AnnouncementBanner message={state.notice} />}
                  {state.announcement && (
                    <AnnouncementBanner
                      key={state.announcement}
                      message={state.announcement}
                      tone="warning"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <div className={`w-full transition-all duration-300 ${successFlash ? 'ring-2 ring-green rounded-md' : ''}`}>
            {body}
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
