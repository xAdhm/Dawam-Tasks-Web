'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  open: boolean
  onClose: () => void
  displayName: string
}

export default function Sidebar({ open, onClose, displayName }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function navigate(path: string) {
    onClose()
    router.push(path)
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
        onClick={onClose}
      />

      <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-full flex-col bg-[var(--bg)] sm:w-64 sm:border-r sm:border-[var(--border)]">
        <div className="flex items-center justify-between px-4 pt-5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sidebarLogoGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B7CF6" />
                  <stop offset="100%" stopColor="#6E5FE0" />
                </linearGradient>
              </defs>
              <path
                d="M 95 70 C 110 85, 145 95, 160 125 C 172 150, 160 168, 135 170 C 105 172, 75 165, 62 145"
                fill="none"
                stroke="url(#sidebarLogoGrad)"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <circle cx="62" cy="145" r="10" fill="#8FC1F0" />
            </svg>
            <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-nunito)' }}>Dawam</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="text-xl text-[var(--text-dim)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>

        <nav className="mt-6 flex-1 px-3 space-y-1">
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-2.5 rounded-lg bg-[var(--surface)] px-3 py-2.5 text-left text-sm font-medium"
          >
            Tasks
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--text-dim)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            Calendar
          </button>
        </nav>

        <div className="border-t border-[var(--border)] px-3 py-4 space-y-1">
          <div className="px-3 pb-1 text-xs text-[var(--text-dim)]">{displayName}</div>
          <button
            onClick={() => navigate('/settings')}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--text-dim)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            Account settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-left text-sm font-medium text-[var(--text-dim)]"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}