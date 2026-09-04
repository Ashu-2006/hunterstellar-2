import axios from 'axios'

export const SESSION_NOTICE_KEY = 'odyssey_session_notice'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5173/api',
})

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('odyssey_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {
    /* storage unavailable — send the request unauthenticated and let the
       server decide */
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status

    // 401 is the only status that ends a session. A 403 from the event gate
    // ("not started" / "has ended") is a normal game state, not an auth
    // failure -- logging someone out mid-hunt for standing at a station too
    // early would be indefensible.
    if (status === 401) {
      try {
        localStorage.removeItem('odyssey_token')
        localStorage.removeItem('odyssey_user')
        // Tell the login screen why it is being shown, instead of bouncing
        // the player there with no explanation. Being evicted by a teammate's
        // login is a very different thing from a session timing out, and a
        // team that reads the wrong one will waste minutes chasing it.
        const replaced = err.response?.data?.reason === 'session_replaced'
        sessionStorage.setItem(SESSION_NOTICE_KEY, replaced ? 'replaced' : 'expired')
      } catch {
        /* ignore */
      }
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(err)
  },
)

export default api
