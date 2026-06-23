'use client'

import { useState } from 'react'
import { api } from '@/lib/api/client'
import type { Section, Task } from '@/lib/api/types'

interface SectionWithTasks {
  section: Section
  tasks: Task[]
}

interface Props {
  sectionsWithTasks: SectionWithTasks[]
  token: string
  userEmail: string
}

export default function TodayView({ sectionsWithTasks: initial, token, userEmail }: Props) {
  const [sectionsWithTasks, setSectionsWithTasks] = useState(initial)

  async function handleToggle(sectionId: string, taskId: string) {
    // Optimistic update: flip doneToday immediately, before the network call resolves
    setSectionsWithTasks((prev) =>
      prev.map((s) =>
        s.section.id !== sectionId
          ? s
          : {
              ...s,
              tasks: s.tasks.map((t) =>
                t.id === taskId ? { ...t, doneToday: !t.doneToday } : t
              ),
            }
      )
    )

    try {
      await api.toggleTask(sectionId, taskId, token)
    } catch (err) {
      // Revert on failure
      setSectionsWithTasks((prev) =>
        prev.map((s) =>
          s.section.id !== sectionId
            ? s
            : {
                ...s,
                tasks: s.tasks.map((t) =>
                  t.id === taskId ? { ...t, doneToday: !t.doneToday } : t
                ),
              }
        )
      )
      console.error('Toggle failed', err)
    }
  }

  const todayName = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#E8E8EA]">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 md:max-w-4xl">
        <header className="mb-6 flex items-baseline justify-between sm:mb-8">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Yallah, {userEmail.split('@')[0]}
          </h1>
          <span className="text-xs text-[#8B8D93] sm:text-sm">{todayName}</span>
        </header>

        <div className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
          {sectionsWithTasks.map(({ section, tasks }) => (
            <section key={section.id}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-[#8B8D93]">
                  {section.name}
                </h2>
              </div>

              <div className="rounded-xl border border-[#2A2B30] bg-[#1B1C1F] overflow-hidden">
                {tasks.length === 0 && (
                  <p className="px-4 py-4 text-sm text-[#8B8D93]">No tasks yet</p>
                )}
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleToggle(section.id, task.id)}
                    className="flex w-full items-center gap-3 border-b border-[#2A2B30] px-4 py-3 text-left last:border-b-0 active:bg-[#222327]"
                  >
                    <span
                      className={`flex h-[18px] w-[18px] min-w-[18px] items-center justify-center rounded-full border ${
                        task.doneToday
                          ? 'bg-[#8B7CF6] border-[#8B7CF6]'
                          : 'border-[#2A2B30]'
                      }`}
                    >
                      {task.doneToday && (
                        <span className="text-[10px] font-bold text-[#0D0E11]">✓</span>
                      )}
                    </span>
                    <span
                      className={`flex-1 text-sm ${
                        task.doneToday ? 'text-[#8B8D93] line-through' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}