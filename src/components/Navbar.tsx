'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar({ userEmail, displayName }: { userEmail: string; displayName: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-[var(--bg)]">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 pt-5 sm:px-6 sm:pt-6 md:max-w-4xl">
        <div className="flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="navLogoGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B7CF6" />
                <stop offset="100%" stopColor="#6E5FE0" />
              </linearGradient>
            </defs>
            <path
              d="M 95 70 C 110 85, 145 95, 160 125 C 172 150, 160 168, 135 170 C 105 172, 75 165, 62 145"
              fill="none"
              stroke="url(#navLogoGrad)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <circle cx="62" cy="145" r="10" fill="#8FC1F0" />
          </svg>
          <span className="text-lg font-semibold">Dawam</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-[var(--text-dim)] sm:inline">{displayName}</span>
          <button
            onClick={handleLogout}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-dim)]"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}