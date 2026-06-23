'use client'

import { useState } from 'react'
import { api } from '@/lib/api/client'
import type { Task, Frequency, DayOfWeek } from '@/lib/api/types'

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

interface Props {
  sectionId: string
  token: string
  onCreated: (task: Task) => void
  onClose: () => void
}

export default function AddTaskForm({ sectionId, token, onCreated, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'ONE_TIME' | 'RECURRING'>('ONE_TIME')
  const [dueDate, setDueDate] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('DAILY')
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleDay(day: DayOfWeek) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (type === 'RECURRING' && frequency === 'SPECIFIC_DAYS' && selectedDays.length === 0) {
      setError('Pick at least one day')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const task = await api.createTask(
        sectionId,
        {
          title: title.trim(),
          type,
          dueDate: type === 'ONE_TIME' ? dueDate || null : null,
          frequency: type === 'RECURRING' ? frequency : null,
          daysOfWeek: type === 'RECURRING' && frequency === 'SPECIFIC_DAYS' ? selectedDays : null,
        },
        token
      )
      onCreated(task)
      onClose()
    } catch (err) {
      setError('Failed to create task')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-[#1B1C1F] p-5 sm:rounded-2xl">
        <h3 className="mb-4 text-base font-semibold">New task</h3>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="mb-3 w-full rounded-lg border border-[#2A2B30] bg-[#0D0E11] px-3 py-2 text-sm outline-none"
        />

        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setType('ONE_TIME')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              type === 'ONE_TIME' ? 'bg-[#8B7CF6] text-[#0D0E11]' : 'border border-[#2A2B30] text-[#8B8D93]'
            }`}
          >
            One-time
          </button>
          <button
            type="button"
            onClick={() => setType('RECURRING')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              type === 'RECURRING' ? 'bg-[#8B7CF6] text-[#0D0E11]' : 'border border-[#2A2B30] text-[#8B8D93]'
            }`}
          >
            Recurring
          </button>
        </div>

        {type === 'ONE_TIME' && (
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mb-3 w-full rounded-lg border border-[#2A2B30] bg-[#0D0E11] px-3 py-2 text-sm outline-none"
          />
        )}

        {type === 'RECURRING' && (
          <>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setFrequency('DAILY')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  frequency === 'DAILY' ? 'bg-[#2A2B30] text-[#E8E8EA]' : 'border border-[#2A2B30] text-[#8B8D93]'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFrequency('SPECIFIC_DAYS')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  frequency === 'SPECIFIC_DAYS' ? 'bg-[#2A2B30] text-[#E8E8EA]' : 'border border-[#2A2B30] text-[#8B8D93]'
                }`}
              >
                Specific days
              </button>
            </div>

            {frequency === 'SPECIFIC_DAYS' && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {DAYS.map((day) => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
                      selectedDays.includes(day)
                        ? 'bg-[#8FC1F0] text-[#0D0E11]'
                        : 'border border-[#2A2B30] text-[#8B8D93]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {error && <p className="mb-3 text-sm text-[#8FC1F0]">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-lg bg-[#8B7CF6] px-3 py-2 text-sm font-medium text-[#0D0E11]"
          >
            {saving ? 'Saving...' : 'Add task'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#2A2B30] px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}