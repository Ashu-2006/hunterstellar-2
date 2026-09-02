/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('odyssey_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('odyssey_token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token ) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data } = await api.get('/team/state')
        if (cancelled) return
        setUser(data.team)
        localStorage.setItem('odyssey_user', JSON.stringify(data.team))
      } catch {
        if (!cancelled) {
          setToken(null)
          setUser(null)
          localStorage.removeItem('odyssey_token')
          localStorage.removeItem('odyssey_user')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  async function login(teamName, password) {
    const { data } = await api.post('/login', {
      team_name: teamName,
      password,
    })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('odyssey_token', data.token)
    localStorage.setItem('odyssey_user', JSON.stringify(data.user))
    return data
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('odyssey_token')
    localStorage.removeItem('odyssey_user')
    localStorage.removeItem('hunterstellar_flow')
  }

  function updateUser(newUser) {
    setUser(newUser)
    localStorage.setItem('odyssey_user', JSON.stringify(newUser))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
