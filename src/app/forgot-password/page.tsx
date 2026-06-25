'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleSubmit() {
    if (!email.trim()) {
      setError('Enter your email')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-[var(--text)]">
        <div className="w-full max-w-sm space-y-3 text-center">
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-sm text-[var(--text-dim)]">
            We sent a password reset link to <span className="text-[var(--text)]">{email}</span>.
          </p>
          <a href="/login" className="inline-block pt-2 text-sm text-[var(--violet)]">
            Back to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="text-sm text-[var(--text-dim)]">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
        />

        {error && <p className="text-sm text-[var(--blue)]">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-[var(--violet)] px-3 py-2 text-sm font-medium text-[var(--bg)]"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>

        <a href="/login" className="block text-center text-xs text-[var(--violet)]">
          Back to login
        </a>
      </div>
    </div>
  )
}