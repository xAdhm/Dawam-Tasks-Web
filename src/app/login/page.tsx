'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-xl font-semibold">Dawam</h1>

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

        {error && <p className="text-sm text-[var(--blue)]">{error}</p>}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-lg bg-[var(--violet)] px-3 py-2 text-sm font-medium text-[var(--bg)]"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <div className="flex justify-between text-xs text-[var(--text-dim)]">
          <a href="/signup" className="text-[var(--violet)]">Create account</a>
          <a href="/forgot-password" className="text-[var(--violet)]">Forgot password?</a>
        </div>
      </div>
    </div>
  )
}