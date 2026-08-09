import { useState } from 'react'
import { Mail } from 'lucide-react'

export function LoginScreen({
  onSubmit,
}: {
  onSubmit: (email: string) => Promise<string | null>
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setStatus('sending')
    setError(null)
    const err = await onSubmit(trimmed)
    if (err) {
      setError(err)
      setStatus('idle')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-130 flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold text-text">blockr</h1>
        <p className="text-sm text-text-muted">Sign in to sync your tasks across devices.</p>
      </div>

      {status === 'sent' ? (
        <div className="flex w-full flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center">
          <Mail size={20} className="text-text-muted" />
          <p className="text-sm text-text">Check {email} for a sign-in link.</p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="text-xs text-text-muted underline hover:text-text"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
          <input
            autoFocus
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-muted"
          />
          <button
            type="submit"
            disabled={!email.trim() || status === 'sending'}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-text px-3 py-2 text-sm font-medium text-bg transition-opacity disabled:opacity-40"
          >
            {status === 'sending' ? 'Sending link…' : 'Send magic link'}
          </button>
          {error && <p className="text-xs text-priority-high">{error}</p>}
        </form>
      )}
    </div>
  )
}
