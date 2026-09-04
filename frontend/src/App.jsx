import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import { OfflineBanner } from './components/OfflineBanner'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Planet from './pages/Planet'
import Finished from './pages/Finished'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { token } = useAuth()
  if (token) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/planet" element={<ProtectedRoute><Planet /></ProtectedRoute>} />
      <Route path="/fragments" element={<Navigate to="/planet" replace />} />
      <Route path="/finished" element={<ProtectedRoute><Finished /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      {/* The real gate is the x-admin-secret check on every admin route; this
          only keeps the console out of a player's hands by accident. */}
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <div className="film-grain" aria-hidden="true" />
          <OfflineBanner />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
