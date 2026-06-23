'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { api } from '@/lib/api/client'
import type { Section, Task } from '@/lib/api/types'
import { dueLabel, dueUrgency } from '@/lib/dueDate'
import AddTaskForm from './AddTaskForm'

interface SectionWithTasks {
  section: Section
  tasks: Task[]
}

interface Props {
  sectionsWithTasks: SectionWithTasks[]
  token: string
  userEmail: string
}

const urgencyClasses: Record<string, string> = {
  overdue: 'bg-[var(--blue-soft)] text-[var(--blue)]',
  soon: 'bg-[var(--blue)] text-[var(--bg)]',
  near: 'bg-[var(--border)] text-[var(--text-dim)]',
  far: 'bg-[var(--border)] text-[var(--text-dim)]',
}

export default function TodayView({ sectionsWithTasks: initial, token, userEmail }: Props) {
  const [sectionsWithTasks, setSectionsWithTasks] = useState(initial)
  const [addingToSectionId, setAddingToSectionId] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

  async function handleToggle(sectionId: string, taskId: string) {
    setSectionsWithTasks((prev) =>
      prev.map((s) =>
        s.section.id !== sectionId
          ? s
          : { ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, doneToday: !t.doneToday } : t)) }
      )
    )

    try {
      await api.toggleTask(sectionId, taskId, token)
    } catch (err) {
      setSectionsWithTasks((prev) =>
        prev.map((s) =>
          s.section.id !== sectionId
            ? s
            : { ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, doneToday: !t.doneToday } : t)) }
        )
      )
      console.error('Toggle failed', err)
    }
  }

  function handleTaskCreated(sectionId: string, task: Task) {
    setSectionsWithTasks((prev) =>
      prev.map((s) => (s.section.id !== sectionId ? s : { ...s, tasks: [...s.tasks, task] }))
    )
  }

  const todayName = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 md:max-w-4xl">
        <header className="mb-6 flex items-baseline justify-between sm:mb-8">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Yallah, {userEmail.split('@')[0]}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-dim)] sm:text-sm">{todayName}</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm"
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              {theme === 'dark' ? '☼' : '☾'}
            </button>
          </div>
        </header>

        <div className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
          {sectionsWithTasks.map(({ section, tasks }) => (
            <section key={section.id}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">
                  {section.name}
                </h2>
                <button
                  onClick={() => setAddingToSectionId(section.id)}
                  className="rounded-md bg-[var(--violet)]/10 px-2 py-1 text-xs font-semibold text-[var(--violet)]"
                >
                  + Add
                </button>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                {tasks.length === 0 && (
                  <p className="px-4 py-4 text-sm text-[var(--text-dim)]">No tasks yet</p>
                )}
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleToggle(section.id, task.id)}
                    className="flex w-full items-center gap-3 border-b border-[var(--border)] px-4 py-3 text-left last:border-b-0"
                  >
                    <span
                      className={`flex h-[18px] w-[18px] min-w-[18px] items-center justify-center rounded-full border ${
                        task.doneToday ? 'bg-[var(--violet)] border-[var(--violet)]' : 'border-[var(--border)]'
                      }`}
                    >
                      {task.doneToday && (
                        <span className="text-[10px] font-bold text-[var(--bg)]">✓</span>
                      )}
                    </span>
                    <span className={`flex-1 text-sm ${task.doneToday ? 'text-[var(--text-dim)] line-through' : ''}`}>
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
                          urgencyClasses[dueUrgency(task.dueDate)]
                        }`}
                      >
                        {dueLabel(task.dueDate)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {addingToSectionId && (
        <AddTaskForm
          sectionId={addingToSectionId}
          token={token}
          onCreated={(task) => handleTaskCreated(addingToSectionId, task)}
          onClose={() => setAddingToSectionId(null)}
        />
      )}
    </div>
  )
}