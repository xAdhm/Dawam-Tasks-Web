export function daysUntil(dateStr: string): number {
  const now = new Date()
  const due = new Date(dateStr)
  const diffMs = due.getTime() - now.getTime()
  return Math.floor(diffMs / 86400000)
}

export function dueLabel(dateStr: string): string {
  const due = new Date(dateStr)
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMs < 0) {
    const absDays = Math.abs(diffDays)
    if (absDays === 0) return 'Overdue today'
    return `${absDays}d overdue`
  }
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return `${diffDays}d`
}

export function dueUrgency(dateStr: string): 'overdue' | 'soon' | 'near' | 'far' {
  const due = new Date(dateStr)
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffHours = diffMs / 3600000

  if (diffMs < 0) return 'overdue'
  if (diffHours <= 24) return 'soon'
  if (diffHours <= 72) return 'near'
  return 'far'
}

export const urgencyClasses: Record<string, string> = {
  overdue: 'bg-[var(--blue-soft)] text-[var(--blue)]',
  soon: 'bg-[var(--blue)] text-[var(--bg)]',
  near: 'bg-[var(--border)] text-[var(--text-dim)]',
  far: 'bg-[var(--border)] text-[var(--text-dim)]',
}