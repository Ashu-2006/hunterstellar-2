import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Loading } from './components/Loading'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Planet from './pages/Planet'
import Finished from './pages/Finished'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <Loading full />
  if (!token) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <Loading full />
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
      <Route path="/finished" element={<ProtectedRoute><Finished /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
