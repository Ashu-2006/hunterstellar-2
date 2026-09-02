import { useState, useEffect } from 'react'
import { Trophy, Users, RefreshCw } from 'lucide-react'
import supabase from '../supabaseClient'
import { Loading } from '../components/Loading'
import { Layout } from '../components/Layout'

function relativeTime(ts) {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60) return 'just now'
  const mins = Math.floor(diff / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function statusLabel(status) {
  if (!status) return null
  const s = String(status).toLowerCase()
  if (s === 'finished' || s === 'complete' || s === 'done') return { text: 'Finished', tone: 'green' }
  if (s === 'locked' || s === 'cooldown') return { text: 'On Cooldown', tone: 'amber' }
  if (s === 'awaiting_puzzle' || s === 'awaiting_code') return { text: 'Active', tone: 'teal' }
  return { text: s, tone: 'muted' }
}

const TONE_CLASS = {
  green: 'bg-green/15 text-green',
  amber: 'bg-amber/15 text-amber',
  teal: 'bg-teal/15 text-teal',
  muted: 'bg-surface-alt text-text-muted',
}

export default function Leaderboard() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    if (!supabase) { setError('Live data not configured.'); setLoading(false); return }
    try { const { data, error: err } = await supabase.from('leaderboard').select('team_name, progress, status, last_correct_at'); if (err) throw err; setTeams(data || []); setError('') } catch { setError('Could not load leaderboard.') } finally { setLoading(false) }
  }

  useEffect(() => {
    let cancelled = false
    async function initial() {
      if (!supabase) { if (!cancelled) { setError('Live data not configured.'); setLoading(false) } return }
      try { const { data, error: err } = await supabase.from('leaderboard').select('team_name, progress, status, last_correct_at'); if (cancelled) return; if (err) throw err; setTeams(data || []); setError('') } catch { if (!cancelled) setError('Could not load leaderboard.') } finally { if (!cancelled) setLoading(false) }
    }
    initial(); const interval = setInterval(load, 10000); return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const sorted = [...teams].sort((a, b) => {
    if (b.progress !== a.progress) return b.progress - a.progress
    const t = (new Date(a.last_correct_at || 0).getTime() - new Date(b.last_correct_at || 0).getTime())
    if (t !== 0) return t
    return String(a.team_name).localeCompare(String(b.team_name))
  })

  const updatedAt = sorted.length > 0 ? sorted[0].last_correct_at : null

  return (
    <Layout title="Recon">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-8 w-full gap-5">
        <div className="w-full text-center">
          <h1 className="font-grotesk font-bold text-[34px] leading-none text-text-primary">Leaderboard</h1>
          <p className="text-text-muted text-[14px] mt-2 leading-relaxed max-w-[280px] mx-auto">Teams ranked by fragments recovered on the journey to the Void.</p>
          {updatedAt && <p className="text-[11px] text-text-muted/60 mt-1.5 uppercase tracking-widest">Updated {relativeTime(updatedAt)}</p>}
        </div>

        {loading ? <Loading label="Updating recon data..." /> : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-text-muted">{error}</p>
            <button onClick={load} className="flex items-center gap-2 px-4 h-10 rounded-md bg-surface border border-surface-alt text-text-secondary text-sm"> <RefreshCw className="w-4 h-4" /> Retry </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Users className="w-10 h-10 text-text-muted" strokeWidth={1.4} />
            <p className="text-text-primary text-base font-medium">No teams registered yet.</p>
            <p className="text-text-muted text-sm max-w-[240px]">Be the first to solve a station puzzle and claim the top of the route.</p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2.5">
            {sorted.map((team, i) => {
              const status = statusLabel(team.status)
              const pct = Math.min(100, (team.progress || 0) * 20)
              return (
                <div key={team.team_name} className="flex items-center gap-3 px-4 py-3 rounded-md bg-surface border border-surface-alt/40">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 bg-surface-alt">
                    {i === 0 ? <Trophy className="w-[18px] h-[18px] text-teal" strokeWidth={1.8} /> : <span className={`font-bebas text-xl leading-none ${i < 5 ? 'text-teal' : 'text-text-muted'}`}>{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[16px] text-text-primary truncate">{team.team_name}</p>
                    <p className="text-[11px] text-text-muted/70 truncate mt-0.5">{team.progress >= 5 ? 'Mission complete' : `${team.progress ?? 0} fragment${team.progress === 1 ? '' : 's'} secured`}{team.last_correct_at ? ` · ${relativeTime(team.last_correct_at)}` : ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 w-24">
                    <div className="w-full h-[5px] rounded-full overflow-hidden bg-surface-alt"><div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} /></div>
                    <div className="flex items-center gap-2">{status && <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${TONE_CLASS[status.tone]}`}>{status.text}</span>}<span className="font-bebas text-lg leading-none text-text-secondary">{team.progress ?? 0}/5</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
