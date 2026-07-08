'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { api } from '@/lib/api/client'
import type { Task } from '@/lib/api/types'
import { dueLabel, dueUrgency } from '@/lib/dueDate'
import TopBar from './TopBar'
import Sidebar from './Sidebar'

interface Props {
  calendarData: Record<string, Task[]>
  token: string
  displayName: string
  initialYear: number
  initialMonth: number
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAYS_OF_WEEK_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_OF_WEEK_MIN = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const urgencyClasses: Record<string, string> = {
  overdue: 'bg-[var(--blue-soft)] text-[var(--blue)]',
  soon: 'bg-[var(--blue)] text-[var(--bg)]',
  near: 'bg-[var(--border)] text-[var(--text-dim)]',
  far: 'bg-[var(--border)] text-[var(--text-dim)]',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function CalendarView({ calendarData: initial, token, displayName, initialYear, initialMonth }: Props) {
  const [calendarData, setCalendarData] = useState(initial)
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [view, setView] = useState<'month' | 'week'>('month')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  async function fetchMonth(y: number, m: number) {
    setLoading(true)
    const start = new Date(y, m, 1).toISOString().slice(0, 10)
    const end = new Date(y, m + 1, 0).toISOString().slice(0, 10)
    try {
      const data = await api.getCalendar(start, end, token)
      setCalendarData(data)
    } catch (err) {
      console.error('Failed to fetch calendar', err)
    } finally {
      setLoading(false)
    }
  }

  function prevMonth() {
    const newMonth = month === 0 ? 11 : month - 1
    const newYear = month === 0 ? year - 1 : year
    setMonth(newMonth)
    setYear(newYear)
    fetchMonth(newYear, newMonth)
  }

  function nextMonth() {
    const newMonth = month === 11 ? 0 : month + 1
    const newYear = month === 11 ? year + 1 : year
    setMonth(newMonth)
    setYear(newYear)
    fetchMonth(newYear, newMonth)
  }

  async function handleToggle(task: Task) {
    const taskId = task.id
    const sectionId = task.sectionId

    setCalendarData((prev) => {
      const next: Record<string, Task[]> = {}
      for (const key in prev) {
        const tasks = prev[key]
        const hasTask = tasks.some((t) => t.id === taskId)
        next[key] = hasTask
          ? tasks.map((t) => t.id === taskId ? { ...t, doneToday: !t.doneToday } : t)
          : tasks
      }
      return next
    })

    try {
      await api.toggleTask(sectionId, taskId, token)
    } catch (err) {
      setCalendarData((prev) => {
        const next: Record<string, Task[]> = {}
        for (const key in prev) {
          const tasks = prev[key]
          const hasTask = tasks.some((t) => t.id === taskId)
          next[key] = hasTask
            ? tasks.map((t) => t.id === taskId ? { ...t, doneToday: !t.doneToday } : t)
            : tasks
        }
        return next
      })
      console.error('Toggle failed', err)
    }
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const selectedTasks = selectedDate ? (calendarData[selectedDate] || []) : []

  const todayDate = new Date()
  const startOfWeek = new Date(todayDate)
  startOfWeek.setDate(todayDate.getDate() - todayDate.getDay())
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  function getDayStatus(dateKey: string, tasks: Task[]) {
    const dayDate = new Date(dateKey + 'T00:00:00')
    const isPast = dayDate < today
    const isToday = dateKey === todayKey
    const hasIncomplete = tasks.some((t) => !t.doneToday)
    const hasOverdue = isPast && !isToday && hasIncomplete && tasks.length > 0
    return { isPast, isToday, hasIncomplete, hasOverdue }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <TopBar onMenuClick={() => setSidebarOpen(true)} hidden={sidebarOpen} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} displayName={displayName} />

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 md:max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="text-[var(--text-dim)] hover:text-[var(--text)]">←</button>
            <h1 className="text-xl font-semibold">{MONTHS[month]} {year}</h1>
            <button onClick={nextMonth} className="text-[var(--text-dim)] hover:text-[var(--text)]">→</button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs font-semibold">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1.5 ${view === 'month' ? 'bg-[var(--violet)] text-[var(--bg)]' : 'text-[var(--text-dim)]'}`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1.5 ${view === 'week' ? 'bg-[var(--violet)] text-[var(--bg)]' : 'text-[var(--text-dim)]'}`}
              >
                Week
              </button>
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm"
              suppressHydrationWarning
            >
              {theme === 'dark' ? '☼' : '☾'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mb-4 text-center text-sm text-[var(--text-dim)]">Loading...</div>
        )}

        {/* Month view */}
        {view === 'month' && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="grid grid-cols-7 border-b border-[var(--border)]">
              {DAYS_OF_WEEK_SHORT.map((d) => (
                <div key={d} className="hidden py-2 text-center text-xs font-semibold text-[var(--text-dim)] sm:block">{d}</div>
              ))}
              {DAYS_OF_WEEK_MIN.map((d, i) => (
                <div key={i} className="py-2 text-center text-xs font-semibold text-[var(--text-dim)] sm:hidden">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="border-b border-r border-[var(--border)] p-1 sm:p-2 min-h-[60px] sm:min-h-[80px]" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dateKey = formatDateKey(year, month, day)
                const tasks = calendarData[dateKey] || []
                const isSelected = dateKey === selectedDate
                const { isToday, hasOverdue, isPast } = getDayStatus(dateKey, tasks)
                const dimmed = isPast && !isToday

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                    className={`cursor-pointer border-b border-r border-[var(--border)] p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] transition-colors ${
                      isSelected ? 'bg-[var(--violet)]/10' :
                      hasOverdue ? 'bg-[var(--blue-soft)]' :
                      'hover:bg-[var(--border)]/30'
                    } ${dimmed ? 'opacity-60' : ''}`}
                  >
                    <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday ? 'bg-[var(--violet)] text-[var(--bg)]' :
                      hasOverdue ? 'text-[var(--blue)]' :
                      'text-[var(--text)]'
                    }`}>
                      {day}
                    </div>

                    {tasks.length > 0 && (
                      <div className="flex flex-wrap gap-0.5">
                        {tasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              task.doneToday ? 'bg-[var(--text-dim)]' :
                              hasOverdue ? 'bg-[var(--blue)]' :
                              'bg-[var(--violet)]'
                            }`}
                          />
                        ))}
                        {tasks.length > 3 && (
                          <span className="text-[8px] text-[var(--text-dim)]">+{tasks.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Week view */}
        {view === 'week' && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="grid grid-cols-7 border-b border-[var(--border)]">
              {weekDays.map((d, i) => {
                const dateKey = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
                const isToday = dateKey === todayKey
                const isSelected = dateKey === selectedDate
                const tasks = calendarData[dateKey] || []
                const { hasOverdue } = getDayStatus(dateKey, tasks)

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                    className={`cursor-pointer p-2 sm:p-3 text-center transition-colors ${
                      isSelected ? 'bg-[var(--violet)]/10' :
                      hasOverdue ? 'bg-[var(--blue-soft)]' :
                      'hover:bg-[var(--border)]/30'
                    }`}
                  >
                    <div className="text-[10px] font-semibold text-[var(--text-dim)] mb-1">
                      {DAYS_OF_WEEK_SHORT[i]}
                    </div>
                    <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      isToday ? 'bg-[var(--violet)] text-[var(--bg)]' :
                      hasOverdue ? 'text-[var(--blue)]' :
                      'text-[var(--text)]'
                    }`}>
                      {d.getDate()}
                    </div>
                    {tasks.length > 0 && (
                      <div className="mt-1 flex justify-center gap-0.5">
                        {tasks.slice(0, 3).map((t) => (
                          <div key={t.id} className={`h-1.5 w-1.5 rounded-full ${
                            t.doneToday ? 'bg-[var(--text-dim)]' :
                            hasOverdue ? 'bg-[var(--blue)]' :
                            'bg-[var(--violet)]'
                          }`} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="divide-y divide-[var(--border)]">
              {weekDays.map((d, i) => {
                const dateKey = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
                const tasks = calendarData[dateKey] || []
                if (tasks.length === 0) return null
                const isToday = dateKey === todayKey
                const { hasOverdue } = getDayStatus(dateKey, tasks)

                return (
                  <div key={i} className="p-3 sm:p-4">
                    <div className={`mb-2 text-xs font-semibold ${
                      isToday ? 'text-[var(--violet)]' :
                      hasOverdue ? 'text-[var(--blue)]' :
                      'text-[var(--text-dim)]'
                    }`}>
                      {DAYS_OF_WEEK_SHORT[i]} {d.getDate()}
                    </div>
                    <div className="space-y-1">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(task)}
                            className={`flex h-[16px] w-[16px] min-w-[16px] items-center justify-center rounded-full border ${
                              task.doneToday ? 'bg-[var(--violet)] border-[var(--violet)]' : 'border-[var(--border)]'
                            }`}
                          >
                            {task.doneToday && <span className="text-[9px] font-bold text-[var(--bg)]">✓</span>}
                          </button>
                          <span className={`flex-1 text-sm ${task.doneToday ? 'text-[var(--text-dim)] line-through' : ''}`}>
                            {task.title}
                          </span>
                          {task.dueDate && (
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${urgencyClasses[dueUrgency(task.dueDate)]}`}>
                              {dueLabel(task.dueDate)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Selected day panel */}
        {selectedDate && (
          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, {
                  weekday: 'long', month: 'long', day: 'numeric'
                })}
              </h2>
              <button onClick={() => setSelectedDate(null)} className="text-xs text-[var(--text-dim)] hover:text-[var(--text)]">✕</button>
            </div>

            {selectedTasks.length === 0 ? (
              <p className="text-sm text-[var(--text-dim)]">No tasks this day.</p>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(task)}
                      className={`flex h-[18px] w-[18px] min-w-[18px] items-center justify-center rounded-full border ${
                        task.doneToday ? 'bg-[var(--violet)] border-[var(--violet)]' : 'border-[var(--border)]'
                      }`}
                    >
                      {task.doneToday && <span className="text-[10px] font-bold text-[var(--bg)]">✓</span>}
                    </button>
                    <span className={`flex-1 text-sm ${task.doneToday ? 'text-[var(--text-dim)] line-through' : ''}`}>
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${urgencyClasses[dueUrgency(task.dueDate)]}`}>
                        {dueLabel(task.dueDate)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}