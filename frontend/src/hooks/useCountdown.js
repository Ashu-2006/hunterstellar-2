import { useState, useEffect, useRef, useMemo } from 'react'

export function useCountdown(lockUntil) {
  const [remaining, setRemaining] = useState(() => {
    if (!lockUntil) return 0
    const diff = new Date(lockUntil).getTime() - Date.now()
    return diff > 0 ? Math.ceil(diff / 1000) : 0
  })
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!lockUntil) return

    intervalRef.current = setInterval(() => {
      const diff = new Date(lockUntil).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining(0)
        clearInterval(intervalRef.current)
      } else {
        setRemaining(Math.ceil(diff / 1000))
      }
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [lockUntil])

  return useMemo(() => {
    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60
    const display = `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`
    return { remaining, display, expired: remaining === 0 }
  }, [remaining])
}
