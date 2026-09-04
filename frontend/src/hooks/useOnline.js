import { useEffect, useState } from 'react'

/** Tracks connectivity so screens can degrade instead of silently failing. */
export function useOnline() {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine !== false,
  )

  useEffect(() => {
    function up() {
      setOnline(true)
    }
    function down() {
      setOnline(false)
    }
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  return online
}
