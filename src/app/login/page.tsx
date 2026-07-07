'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function AppPreview() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-12">
      <div className="w-full max-w-xs">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="previewGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B7CF6" />
                  <stop offset="100%" stopColor="#6E5FE0" />
                </linearGradient>
              </defs>
              <path d="M 95 70 C 110 85, 145 95, 160 125 C 172 150, 160 168, 135 170 C 105 172, 75 165, 62 145"
                fill="none" stroke="url(#previewGrad)" strokeWidth="20" strokeLinecap="round" />
              <circle cx="62" cy="145" r="10" fill="#8FC1F0" />
            </svg>
            <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-nunito)' }}>Dawam</span>
          </div>
          <p className="text-sm text-[var(--text-dim)]">Your daily consistency tracker</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Morning</div>
            <div className="space-y-2">
              {[
                { title: 'Morning run', done: true },
                { title: 'Journal entry', done: true },
                { title: 'Review goals', done: false },
              ].map((task) => (
                <div key={task.title} className="flex items-center gap-2.5">
                  <div className={`flex h-[16px] w-[16px] min-w-[16px] items-center justify-center rounded-full border ${
                    task.done ? 'bg-[var(--violet)] border-[var(--violet)]' : 'border-[var(--border)]'
                  }`}>
                    {task.done && <span className="text-[9px] font-bold text-[var(--bg)]">✓</span>}
                  </div>
                  <span className={`text-xs ${task.done ? 'text-[var(--text-dim)] line-through' : 'text-[var(--text)]'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Work</div>
            <div className="space-y-2">
              {[
                { title: 'Push backend changes', done: false, badge: '2h', urgent: true },
                { title: 'Update resume', done: false, badge: 'Tomorrow', urgent: false },
              ].map((task) => (
                <div key={task.title} className="flex items-center gap-2.5">
                  <div className="flex h-[16px] w-[16px] min-w-[16px] items-center justify-center rounded-full border border-[var(--border)]" />
                  <span className="flex-1 text-xs text-[var(--text)]">{task.title}</span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${
                    task.urgent ? 'bg-[var(--blue)] text-[var(--bg)]' : 'bg-[var(--border)] text-[var(--text-dim)]'
                  }`}>{task.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const prefill = searchParams.get('email')
    if (prefill) setEmail(prefill)
  }, [searchParams])

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
    <div className="flex h-full flex-col justify-center px-8 py-12 sm:px-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">Welcome back</h1>
        <p className="mb-8 text-sm text-[var(--text-dim)]">Log in to your Dawam account</p>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--violet)]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--violet)]"
          />
        </div>

        {error && <p className="mt-3 text-sm text-[var(--blue)]">{error}</p>}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-[var(--violet)] py-2.5 text-sm font-semibold text-[var(--bg)]"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <div className="mt-4 flex justify-between text-xs text-[var(--text-dim)]">
          <Link href="/signup" className="text-[var(--violet)]">Create account</Link>
          <Link href="/forgot-password" className="text-[var(--violet)]">Forgot password?</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="hidden w-1/2 border-r border-[var(--border)] bg-[var(--surface)] lg:block">
        <AppPreview />
      </div>
      <div className="flex w-full flex-col justify-center lg:w-1/2">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <div className="block pb-8 text-center lg:hidden">
          <span className="text-xs text-[var(--text-dim)]">Dawam — stay consistent, every day.</span>
        </div>
      </div>
    </div>
  )
}