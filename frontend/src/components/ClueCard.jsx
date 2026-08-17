import { useState } from 'react'
import { Card } from './ui/Card'
import { CodeInput } from './ui/Input'
import { Button } from './ui/Button'

export function ClueCard({ clue, onSubmit, loading, error }) {
  const [code, setCode] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim()) return
    await onSubmit(code.trim())
    setCode('')
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">Clue</p>
      <p className="text-text-primary text-base leading-relaxed mb-6 whitespace-pre-line">{clue}</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <p className="text-sm text-text-muted">Enter the code at this celestial body:</p>
        <CodeInput
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="_ _ _ _ _ _"
          error={error}
          disabled={loading}
        />
        <Button type="submit" className="w-full" disabled={loading || !code.trim()}>
          {loading ? 'Verifying...' : 'Submit Code'}
        </Button>
      </form>
    </Card>
  )
}
