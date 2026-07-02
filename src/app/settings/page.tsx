'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPasswordForPw, setCurrentPasswordForPw] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [nameSuccess, setNameSuccess] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setDisplayName(user.user_metadata?.display_name || '')
      setEmail(user.email || '')
      setUserEmail(user.email || '')
    })
  }, [])

  async function handleSaveName() {
    if (!displayName.trim()) {
      setNameError('Name cannot be empty')
      return
    }
    setLoading('name')
    setNameError(null)
    setNameSuccess(false)

    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName.trim() },
    })

    if (error) {
      setNameError(error.message)
    } else {
      setNameSuccess(true)
    }
    setLoading(null)
  }

  async function handleSaveEmail() {
    if (!email.trim()) {
      setEmailError('Email cannot be empty')
      return
    }
    if (!currentPasswordForEmail) {
      setEmailError('Enter your current password to confirm')
      return
    }

    setLoading('email')
    setEmailError(null)
    setEmailSuccess(false)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPasswordForEmail,
    })

    if (signInError) {
      setEmailError('Current password is incorrect')
      setLoading(null)
      return
    }

    const { error } = await supabase.auth.updateUser({ email })

    if (error) {
      setEmailError(error.message)
    } else {
      setEmailSuccess(true)
      setCurrentPasswordForEmail('')
    }
    setLoading(null)
  }

  async function handleSavePassword() {
    if (!currentPasswordForPw) {
      setPasswordError('Enter your current password')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match")
      return
    }

    setLoading('password')
    setPasswordError(null)
    setPasswordSuccess(false)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPasswordForPw,
    })

    if (signInError) {
      setPasswordError('Current password is incorrect')
      setLoading(null)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setCurrentPasswordForPw('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-[var(--text-dim)] hover:text-[var(--text)]"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">Account settings</h1>
        </div>

        <div className="space-y-6">
          {/* Display name */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-4 text-sm font-semibold">Display name</h2>
            <input
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setNameSuccess(false) }}
              className="mb-3 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
            />
            {nameError && <p className="mb-2 text-xs text-[var(--blue)]">{nameError}</p>}
            {nameSuccess && <p className="mb-2 text-xs text-[var(--violet)]">Name updated successfully.</p>}
            <button
              onClick={handleSaveName}
              disabled={loading === 'name'}
              className="rounded-lg bg-[var(--violet)] px-4 py-2 text-sm font-medium text-[var(--bg)]"
            >
              {loading === 'name' ? 'Saving...' : 'Save name'}
            </button>
          </div>

          {/* Email */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-1 text-sm font-semibold">Email address</h2>
            <p className="mb-4 text-xs text-[var(--text-dim)]">A confirmation will be sent to your new email before it takes effect.</p>
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailSuccess(false) }}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              />
              <input
                type="password"
                placeholder="Current password"
                value={currentPasswordForEmail}
                onChange={(e) => { setCurrentPasswordForEmail(e.target.value); setEmailSuccess(false) }}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              />
            </div>
            {emailError && <p className="mt-2 text-xs text-[var(--blue)]">{emailError}</p>}
            {emailSuccess && <p className="mt-2 text-xs text-[var(--violet)]">Confirmation sent — check your email.</p>}
            <button
              onClick={handleSaveEmail}
              disabled={loading === 'email'}
              className="mt-3 rounded-lg bg-[var(--violet)] px-4 py-2 text-sm font-medium text-[var(--bg)]"
            >
              {loading === 'email' ? 'Saving...' : 'Save email'}
            </button>
          </div>

          {/* Password */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-4 text-sm font-semibold">Change password</h2>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={currentPasswordForPw}
                onChange={(e) => { setCurrentPasswordForPw(e.target.value); setPasswordSuccess(false) }}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordSuccess(false) }}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordSuccess(false) }}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              />
            </div>
            {passwordError && <p className="mt-2 text-xs text-[var(--blue)]">{passwordError}</p>}
            {passwordSuccess && <p className="mt-2 text-xs text-[var(--violet)]">Password changed successfully.</p>}
            <button
              onClick={handleSavePassword}
              disabled={loading === 'password'}
              className="mt-3 rounded-lg bg-[var(--violet)] px-4 py-2 text-sm font-medium text-[var(--bg)]"
            >
              {loading === 'password' ? 'Saving...' : 'Change password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}