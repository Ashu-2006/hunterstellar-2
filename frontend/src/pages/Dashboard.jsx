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

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successFlash, setSuccessFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await api.get('/team/state')
        if (cancelled) return
        setState(data)
        if (data.team) updateUser(data.team)
        if (data.stage === 'finished') navigate('/finished')
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!supabase || !user?.id) return

    const channel = supabase
      .channel(`team-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'teams', filter: `id=eq.${user.id}` },
        () => {
          api.get('/team/state').then(({ data }) => {
            setState(data)
            if (data.team) updateUser(data.team)
            if (data.stage === 'finished') navigate('/finished')
          }).catch(() => {})
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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
        setState(data.state)
        if (data.state.team) updateUser(data.state.team)
        if (data.state.stage === 'finished') navigate('/finished')
      } else if (data.reason === 'locked') {
        setState((prev) => ({ ...prev, stage: 'locked', lock_until: data.lock_until }))
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
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </Layout>
    )
  }

  if (!state) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-muted text-sm">Could not load state.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {state.stage === 'locked' && state.lock_until && (
        <LockoutOverlay lockUntil={state.lock_until} islandName="this station" />
      )}

      <div className="flex-1 flex flex-col items-center px-4 py-8 max-w-lg mx-auto w-full gap-6">
        <ProgressBar progress={state.team?.progress || 0} />

        {state.notice && <AnnouncementBanner message={state.notice} />}

        <div className={`w-full transition-all duration-300 ${successFlash ? 'ring-2 ring-green rounded-lg' : ''}`}>
          {state.stage === 'awaiting_code' && state.clue_statement && (
            <ClueCard
              clue={state.clue_statement}
              onSubmit={handleCodeSubmit}
              loading={submitting}
              error={error}
            />
          )}
          {state.stage === 'awaiting_puzzle' && state.question && (
            <PuzzleCard
              question={state.question}
              onSubmit={handleAnswerSubmit}
              loading={submitting}
              error={error}
            />
          )}
          {state.stage === 'ready' && (
            <div className="text-center text-text-muted text-sm py-12">
              Waiting for the event to start...
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
