'use client'

import { useState } from 'react'
import { api } from '@/lib/api/client'
import type { Task, Frequency, DayOfWeek } from '@/lib/api/types'
import DateTimePicker from './DateTimePicker'

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

interface Props {
  sectionId: string
  token: string
  task?: Task
  onCreated?: (task: Task) => void
  onUpdated?: (task: Task) => void
  onClose: () => void
}

export default function AddTaskForm({ sectionId, token, task, onCreated, onUpdated, onClose }: Props) {
  const isEditing = !!task

  const [title, setTitle] = useState(task?.title ?? '')
  const [type, setType] = useState<'ONE_TIME' | 'RECURRING'>(task?.type ?? 'ONE_TIME')
  const [dueDateTime, setDueDateTime] = useState(
    task?.dueDate ? task.dueDate.slice(0, 16) : ''
  )
  const [frequency, setFrequency] = useState<Frequency>(task?.frequency ?? 'DAILY')
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(task?.daysOfWeek ?? [])
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

    const payload = {
      title: title.trim(),
      type,
      dueDate: type === 'ONE_TIME' ? (dueDateTime ? `${dueDateTime}:00` : null) : null,
      frequency: type === 'RECURRING' ? frequency : null,
      daysOfWeek: type === 'RECURRING' && frequency === 'SPECIFIC_DAYS' ? selectedDays : null,
    }

    try {
      if (isEditing && task) {
        const updated = await api.updateTask(sectionId, task.id, payload, token)
        onUpdated?.(updated)
      } else {
        const created = await api.createTask(sectionId, payload, token)
        onCreated?.(created)
      }
      onClose()
    } catch (err) {
      setError(isEditing ? 'Failed to update task' : 'Failed to create task')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-[var(--surface)] p-5 sm:rounded-2xl">
        <h3 className="mb-4 text-base font-semibold">{isEditing ? 'Edit task' : 'New task'}</h3>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="mb-3 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
        />

        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setType('ONE_TIME')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              type === 'ONE_TIME' ? 'bg-[var(--violet)] text-[var(--bg)]' : 'border border-[var(--border)] text-[var(--text-dim)]'
            }`}
          >
            One-time
          </button>
          <button
            type="button"
            onClick={() => setType('RECURRING')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              type === 'RECURRING' ? 'bg-[var(--violet)] text-[var(--bg)]' : 'border border-[var(--border)] text-[var(--text-dim)]'
            }`}
          >
            Recurring
          </button>
        </div>

        {type === 'ONE_TIME' && (
          <DateTimePicker value={dueDateTime} onChange={setDueDateTime} />
        )}

        {type === 'RECURRING' && (
          <>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setFrequency('DAILY')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  frequency === 'DAILY' ? 'bg-[var(--border)] text-[var(--text)]' : 'border border-[var(--border)] text-[var(--text-dim)]'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFrequency('SPECIFIC_DAYS')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  frequency === 'SPECIFIC_DAYS' ? 'bg-[var(--border)] text-[var(--text)]' : 'border border-[var(--border)] text-[var(--text-dim)]'
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
                        ? 'bg-[var(--blue)] text-[var(--bg)]'
                        : 'border border-[var(--border)] text-[var(--text-dim)]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {error && <p className="mb-3 text-sm text-[var(--blue)]">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-lg bg-[var(--violet)] px-3 py-2 text-sm font-medium text-[var(--bg)]"
          >
            {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Add task'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}