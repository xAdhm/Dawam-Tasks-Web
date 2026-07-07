'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const features = [
  {
    icon: '✓',
    title: 'Daily routines',
    desc: 'Build habits that stick with recurring tasks that reset every day.',
  },
  {
    icon: '⏰',
    title: 'Deadline tracking',
    desc: 'Set due dates and times so nothing slips through the cracks.',
  },
  {
    icon: '📅',
    title: 'Calendar view',
    desc: 'See your tasks laid out across the month — past, present, and future.',
  },
  {
    icon: '🗂',
    title: 'Custom sections',
    desc: 'Organize tasks into sections that match how you actually think.',
  },
]

function FeaturePanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-12 text-center">
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-center gap-2">
          <svg width="28" height="28" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="signupGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B7CF6" />
                <stop offset="100%" stopColor="#6E5FE0" />
              </linearGradient>
            </defs>
            <path d="M 95 70 C 110 85, 145 95, 160 125 C 172 150, 160 168, 135 170 C 105 172, 75 165, 62 145"
              fill="none" stroke="url(#signupGrad)" strokeWidth="20" strokeLinecap="round" />
            <circle cx="62" cy="145" r="10" fill="#8FC1F0" />
          </svg>
          <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-nunito)' }}>Dawam</span>
        </div>
        <h2 className="text-2xl font-bold leading-tight">Everything you need<br />to stay on track.</h2>
      </div>

      <div className="space-y-6 text-left max-w-xs">
        {features.map((f) => (
          <div key={f.title} className="flex gap-4">
            <div className="flex h-9 w-9 min-w-[36px] items-center justify-center rounded-lg bg-[var(--violet)]/10 text-base">
              {f.icon}
            </div>
            <div>
              <div className="mb-0.5 text-sm font-semibold">{f.title}</div>
              <div className="text-xs text-[var(--text-dim)]">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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
      setError("Passwords don't match")
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
          <Link href="/login" className="inline-block pt-2 text-sm text-[var(--violet)]">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="hidden w-1/2 border-r border-[var(--border)] bg-[var(--surface)] lg:block">
        <FeaturePanel />
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-sm px-8 py-12 sm:px-12">
          <h1 className="mb-2 text-2xl font-bold">Create your account</h1>
          <p className="mb-8 text-sm text-[var(--text-dim)]">Start building better habits today.</p>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--violet)]"
            />
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
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--violet)]"
            />
          </div>

          {error && <p className="mt-3 text-sm text-[var(--blue)]">{error}</p>}

          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-[var(--violet)] py-2.5 text-sm font-semibold text-[var(--bg)]"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="mt-4 text-center text-xs text-[var(--text-dim)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--violet)]">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}