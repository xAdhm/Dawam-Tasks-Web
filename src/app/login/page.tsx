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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
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

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else {
      setError('Check your email to confirm your account, or try logging in.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0E11] text-[#E8E8EA]">
      <form className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-xl font-semibold">Dawam</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[#2A2B30] bg-[#1B1C1F] px-3 py-2 text-sm outline-none"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[#2A2B30] bg-[#1B1C1F] px-3 py-2 text-sm outline-none"
          required
        />

        {error && <p className="text-sm text-[#8FC1F0]">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="flex-1 rounded-lg bg-[#8B7CF6] px-3 py-2 text-sm font-medium text-[#0D0E11]"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 rounded-lg border border-[#2A2B30] px-3 py-2 text-sm font-medium"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  )
}