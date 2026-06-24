import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D0E11] px-6 text-[#E8E8EA]">
      <svg width="56" height="56" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" className="mb-5">
        <defs>
          <linearGradient id="landingLogoGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B7CF6" />
            <stop offset="100%" stopColor="#6E5FE0" />
          </linearGradient>
        </defs>
        <path
          d="M 95 70 C 110 85, 145 95, 160 125 C 172 150, 160 168, 135 170 C 105 172, 75 165, 62 145"
          fill="none"
          stroke="url(#landingLogoGrad)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <circle cx="62" cy="145" r="10" fill="#8FC1F0" />
      </svg>

      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Dawam</h1>
      <p className="mb-8 max-w-xs text-center text-sm text-[#8B8D93]">
        Daily routines and deadlines, in one place. Yallah, let's get consistent.
      </p>

      <Link
        href="/login"
        className="rounded-lg bg-[#8B7CF6] px-5 py-2.5 text-sm font-medium text-[#0D0E11]"
      >
        Get started
      </Link>
    </div>
  )
}