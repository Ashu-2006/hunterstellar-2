import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HunterstellarLogo } from '../components/HunterstellarLogo'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [teamName, setTeamName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!teamName.trim() || !password.trim()) {
      setError('Both fields are required')
      return
    }
    setLoading(true)
    try {
      await login(teamName.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative w-full max-w-[412px] h-screen sm:h-[917px] bg-bg flex flex-col overflow-hidden border-x sm:border border-surface-alt shadow-2xl">
        <div className="flex-1 flex flex-col items-center bg-bg px-6 pt-16">
          <div className="flex flex-col items-center gap-16 w-full max-w-sm">
            <HunterstellarLogo width={240} />

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-7">
              <p className="text-text-primary text-center text-lg leading-snug">
                Enter your Crew Identifier
              </p>

              <div className="flex flex-col gap-6">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Crew Name"
                  className="w-full h-[60px] bg-surface border border-surface-alt rounded-md px-5 text-text-primary text-base placeholder:text-text-muted outline-none focus:border-accent"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Access Code"
                  className="w-full h-[60px] bg-surface border border-surface-alt rounded-md px-5 text-text-primary text-base placeholder:text-text-muted outline-none focus:border-accent"
                />
              </div>

              {error && <p className="text-sm text-red text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#f6f6f6] text-text-inverse rounded-md font-display text-lg disabled:opacity-60"
              >
                {loading ? 'Decrypting...' : 'Join Team'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
