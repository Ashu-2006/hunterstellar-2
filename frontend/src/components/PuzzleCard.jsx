import { useState } from 'react'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

export function PuzzleCard({ question, onSubmit, loading, error }) {
  const [answer, setAnswer] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!answer.trim()) return
    await onSubmit(answer.trim())
    setAnswer('')
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">Puzzle</p>
      <p className="text-text-primary text-base leading-relaxed mb-6 whitespace-pre-line">{question}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Enter your answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          error={error}
          disabled={loading}
        />
        <Button type="submit" className="w-full" disabled={loading || !answer.trim()}>
          {loading ? 'Verifying...' : 'Submit Answer'}
        </Button>
      </form>
    </Card>
  )
}
