import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import { OfflineBanner } from './components/OfflineBanner'
import Landing from './pages/Landing'
import Login from './pages/Login'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Prologue = lazy(() => import('./pages/Prologue'))
const Planet = lazy(() => import('./pages/Planet'))
const Finished = lazy(() => import('./pages/Finished'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

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

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg,#0B0D0B)]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/prologue" element={<ProtectedRoute><Prologue /></ProtectedRoute>} />
        <Route path="/planet" element={<ProtectedRoute><Planet /></ProtectedRoute>} />
        <Route path="/fragments" element={<Navigate to="/planet" replace />} />
        <Route path="/finished" element={<ProtectedRoute><Finished /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        {/* The real gate is the x-admin-secret check on every admin route; this
            only keeps the console out of a player's hands by accident. */}
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          {/* A `.film-grain` div used to sit here. The class was never defined
              in App.css, so it painted nothing for as long as it existed. The
              grain a player actually sees comes from `.grain-frame` on the
              phone frame in Layout. */}
          <OfflineBanner />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
