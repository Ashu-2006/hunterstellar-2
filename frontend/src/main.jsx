import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { assertTokensInSync } from './lib/motion'

// Motion tokens are mirrored by hand between App.css and lib/motion.js. This
// warns in the console if the two ever drift. Dev-only, and a warning rather
// than a throw: a token mismatch is a consistency bug, not a reason to
// white-screen a crew standing at a station.
assertTokensInSync()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
