'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function to24Hour(hour12: string, ampm: string): string {
  let h = parseInt(hour12)
  if (ampm === 'AM') {
    if (h === 12) h = 0
  } else {
    if (h !== 12) h += 12
  }
  return String(h).padStart(2, '0')
}

function to12Hour(hour24: string): { hour: string; ampm: string } {
  let h = parseInt(hour24)
  const ampm = h < 12 ? 'AM' : 'PM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return { hour: String(h), ampm }
}

export default function DateTimePicker({ value, onChange }: Props) {
  const today = new Date()

  // Parse existing value as UTC, display in local time
  const parsedDate = value ? new Date(value) : null

  const initial12 = parsedDate
    ? to12Hour(String(parsedDate.getHours()).padStart(2, '0'))
    : { hour: '12', ampm: 'PM' }

  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(parsedDate?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsedDate?.getMonth() ?? today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string>(
    parsedDate
      ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
      : ''
  )
  const [hour, setHour] = useState(initial12.hour)
  const [minute, setMinute] = useState(parsedDate ? String(parsedDate.getMinutes()).padStart(2, '0') : '00')
  const [ampm, setAmpm] = useState(initial12.ampm)

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function buildAndEmit(date: string, h: string, m: string, ap: string) {
    if (!date) return
    const hour24 = to24Hour(h, ap)
    // Treat input as local time, convert to UTC ISO string for storage
    const localDate = new Date(`${date}T${hour24}:${m}:00`)
    onChange(localDate.toISOString())
  }

  function handleDayClick(day: number) {
    const month = String(viewMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateStr = `${viewYear}-${month}-${dayStr}`
    setSelectedDate(dateStr)
    buildAndEmit(dateStr, hour, minute, ampm)
  }

  function handleHourChange(h: string) {
    setHour(h)
    buildAndEmit(selectedDate, h, minute, ampm)
  }

  function handleMinuteChange(m: string) {
    setMinute(m)
    if (m.length === 2 && parseInt(m) <= 59) {
      buildAndEmit(selectedDate, hour, m, ampm)
    }
  }

  function handleAmpmToggle(ap: string) {
    setAmpm(ap)
    buildAndEmit(selectedDate, hour, minute, ap)
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function clear() {
    setSelectedDate('')
    setHour('12')
    setMinute('00')
    setAmpm('PM')
    onChange('')
    setOpen(false)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const hours12 = Array.from({ length: 12 }, (_, i) => String(i + 1))

  const todayLocalKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const displayValue = selectedDate
    ? `${selectedDate}  ${hour}:${minute} ${ampm}`
    : ''

  return (
    <div ref={ref} className="relative mb-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-left text-sm outline-none text-[var(--text)]"
      >
        {displayValue || <span className="text-[var(--text-dim)]">Date and time (optional)</span>}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg">
          {/* Month navigation */}
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={prevMonth} className="px-1 text-[var(--text-dim)] hover:text-[var(--text)]">←</button>
            <span className="text-sm font-semibold">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="px-1 text-[var(--text-dim)] hover:text-[var(--text)]">→</button>
          </div>

          {/* Day of week headers */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-[10px] font-semibold text-[var(--text-dim)]">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const month = String(viewMonth + 1).padStart(2, '0')
              const dayStr = String(day).padStart(2, '0')
              const dateStr = `${viewYear}-${month}-${dayStr}`
              const isSelected = dateStr === selectedDate
              const isToday = dateStr === todayLocalKey

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`rounded-md py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-[var(--violet)] text-[var(--bg)]'
                      : isToday
                      ? 'border border-[var(--violet)] text-[var(--violet)]'
                      : 'text-[var(--text)] hover:bg-[var(--border)]'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Time selectors */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-[var(--text-dim)]">Time</span>

            <select
              value={hour}
              onChange={(e) => handleHourChange(e.target.value)}
              className="w-16 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-sm outline-none"
            >
              {hours12.map(h => <option key={h} value={h}>{h}</option>)}
            </select>

            <span className="text-[var(--text-dim)]">:</span>

            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={minute}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                handleMinuteChange(val)
              }}
              onBlur={() => {
                const padded = minute.padStart(2, '0')
                const clamped = Math.min(parseInt(padded) || 0, 59)
                const final = String(clamped).padStart(2, '0')
                setMinute(final)
                buildAndEmit(selectedDate, hour, final, ampm)
              }}
              placeholder="00"
              className="w-14 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-center text-sm outline-none"
            />

            <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleAmpmToggle('AM')}
                className={`px-2.5 py-1.5 ${ampm === 'AM' ? 'bg-[var(--violet)] text-[var(--bg)]' : 'text-[var(--text-dim)]'}`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => handleAmpmToggle('PM')}
                className={`px-2.5 py-1.5 ${ampm === 'PM' ? 'bg-[var(--violet)] text-[var(--bg)]' : 'text-[var(--text-dim)]'}`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={clear}
              className="text-xs text-[var(--text-dim)] hover:text-[var(--text)]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-[var(--violet)] px-3 py-1.5 text-xs font-medium text-[var(--bg)]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}