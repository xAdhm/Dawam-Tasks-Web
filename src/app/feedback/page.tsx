'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type FeedbackType = 'bug' | 'suggestion' | 'other'

export default function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>('suggestion')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

    async function handleSubmit() {
        if (!message.trim()) {
            setError('Please enter a message')
            return
        }

        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase.from('feedback').insert({
            user_id: user?.id ?? null,
            type,
            message: message.trim(),
        })

        if (error) {
            setError('Failed to submit feedback. Please try again.')
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
        }
    }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-[var(--text)]">
        <div className="w-full max-w-sm space-y-3 text-center">
          <div className="text-3xl">🎉</div>
          <h1 className="text-xl font-semibold">Thanks for the feedback!</h1>
          <p className="text-sm text-[var(--text-dim)]">
            Your message has been received. It genuinely helps make Dawam better.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-block pt-2 text-sm text-[var(--violet)]"
          >
            ← Back to tasks
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-sm text-[var(--text-dim)] hover:text-[var(--text)]"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">Feedback</h1>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="mb-5 text-sm text-[var(--text-dim)]">
            Found a bug? Have a suggestion? Just want to say something? All feedback is welcome.
          </p>

          {/* Type selector */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold text-[var(--text-dim)]">Type</label>
            <div className="flex gap-2">
              {([
                { value: 'bug', label: '🐛 Bug' },
                { value: 'suggestion', label: '💡 Suggestion' },
                { value: 'other', label: '💬 Other' },
              ] as { value: FeedbackType; label: string }[]).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                    type === t.value
                      ? 'bg-[var(--violet)] text-[var(--bg)]'
                      : 'border border-[var(--border)] text-[var(--text-dim)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold text-[var(--text-dim)]">Message</label>
            <textarea
              value={message}
              onChange={(e) => { setMessage(e.target.value); setError(null) }}
              placeholder={
                type === 'bug'
                  ? "Describe what happened and how to reproduce it..."
                  : type === 'suggestion'
                  ? "What feature or improvement would you like to see?"
                  : "What's on your mind?"
              }
              rows={5}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none resize-none focus:border-[var(--violet)]"
            />
          </div>

          {error && <p className="mb-3 text-sm text-[var(--blue)]">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-lg bg-[var(--violet)] py-2.5 text-sm font-semibold text-[var(--bg)]"
          >
            {loading ? 'Sending...' : 'Send feedback'}
          </button>
        </div>
      </div>
    </div>
  )
}