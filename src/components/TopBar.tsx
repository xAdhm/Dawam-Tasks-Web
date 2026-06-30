'use client'

interface Props {
  onMenuClick: () => void
  hidden?: boolean
}

export default function TopBar({ onMenuClick, hidden }: Props) {
  if (hidden) return null

  return (
    <div className="bg-[var(--bg)]">
      <div className="relative flex items-center justify-center px-4 pt-5 sm:px-6 sm:pt-6">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="absolute left-4 top-5 text-xl text-[var(--text-dim)] hover:text-[var(--text)] sm:left-6 sm:top-6"
        >
          ☰
        </button>

        <div className="flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="topbarLogoGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B7CF6" />
                <stop offset="100%" stopColor="#6E5FE0" />
              </linearGradient>
            </defs>
            <path
              d="M 95 70 C 110 85, 145 95, 160 125 C 172 150, 160 168, 135 170 C 105 172, 75 165, 62 145"
              fill="none"
              stroke="url(#topbarLogoGrad)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <circle cx="62" cy="145" r="10" fill="#8FC1F0" />
          </svg>
          <span className="text-lg font-semibold">Dawam</span>
        </div>
      </div>
    </div>
  )
}