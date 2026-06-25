'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleSignup() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Name, email, and a password (6+ characters) are required')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords don\'t match')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
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
            We sent a confirmation link to <span className="text-[var(--text)]">{email}</span>.
            Click it and you'll be logged in automatically.
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
        <h1 className="text-xl font-semibold">Create your account</h1>

        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
        />

        {error && <p className="text-sm text-[var(--blue)]">{error}</p>}

        <button
          type="button"
          onClick={handleSignup}
          disabled={loading}
          className="w-full rounded-lg bg-[var(--violet)] px-3 py-2 text-sm font-medium text-[var(--bg)]"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-xs text-[var(--text-dim)]">
          Already have an account?{' '}
          <a href="/login" className="text-[var(--violet)]">Log in</a>
        </p>
      </div>
    </div>
  )
}