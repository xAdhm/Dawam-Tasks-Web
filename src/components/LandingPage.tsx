'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function LandingPage() {
  const pathRef = useRef<SVGPathElement>(null)
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const path = pathRef.current
    const circle = circleRef.current
    if (!path || !circle) return

    const length = path.getTotalLength()
    path.style.strokeDasharray = `${length}`
    path.style.strokeDashoffset = `${length}`
    circle.style.opacity = '0'

    const startTime = performance.now()
    const duration = 1200
    const delay = 300

    function animate(now: number) {
      if (!path || !circle) return
      const elapsed = now - startTime - delay
      if (elapsed < 0) {
        requestAnimationFrame(animate)
        return
      }
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      path.style.strokeDashoffset = `${length * (1 - eased)}`

      if (progress >= 0.85) {
        circle.style.opacity = `${Math.min((progress - 0.85) / 0.15, 1)}`
      }

      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 pt-6 sm:px-12">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="navGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B7CF6" />
                <stop offset="100%" stopColor="#6E5FE0" />
              </linearGradient>
            </defs>
            <path d="M 95 70 C 110 85, 145 95, 160 125 C 172 150, 160 168, 135 170 C 105 172, 75 165, 62 145"
              fill="none" stroke="url(#navGrad)" strokeWidth="20" strokeLinecap="round" />
            <circle cx="62" cy="145" r="10" fill="#8FC1F0" />
          </svg>
          <span className="text-base font-semibold" style={{ fontFamily: 'var(--font-nunito)' }}>Dawam</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[var(--text-dim)] hover:text-[var(--text)]">Log in</Link>
          <Link href="/signup" className="rounded-lg bg-[var(--violet)] px-4 py-1.5 text-sm font-medium text-[var(--bg)]">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-12">
        {/* Animated Dal logo */}
        <div className="mb-10">
          <svg width="120" height="120" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" className="sm:w-[160px] sm:h-[160px]">
            <defs>
              <linearGradient id="heroGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B7CF6" />
                <stop offset="100%" stopColor="#6E5FE0" />
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
              d="M 95 70 C 110 85, 145 95, 160 125 C 172 150, 160 168, 135 170 C 105 172, 75 165, 62 145"
              fill="none"
              stroke="url(#heroGrad)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <circle ref={circleRef} cx="62" cy="145" r="10" fill="#8FC1F0" />
          </svg>
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl" style={{ fontFamily: 'var(--font-nunito)' }}>
          Stay consistent,<br />every day.
        </h1>
        <p className="mb-10 max-w-md text-base text-[var(--text-dim)] sm:text-lg">
          Dawam helps you track daily routines and deadlines in one clean place. Yallah, let's build better habits.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="rounded-xl bg-[var(--violet)] px-8 py-3 text-base font-semibold text-[var(--bg)]">
            Get started — it's free
          </Link>
          <Link href="/login" className="rounded-xl border border-[var(--border)] px-8 py-3 text-base font-semibold text-[var(--text-dim)] hover:text-[var(--text)]">
            Log in
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {[
            '✓ Daily routines',
            '✓ Task deadlines',
            '✓ Calendar view',
            '✓ Dark & light mode',
          ].map((f) => (
            <span key={f} className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs text-[var(--text-dim)]">
              {f}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}