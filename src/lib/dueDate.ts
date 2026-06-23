export function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

export function dueLabel(dateStr: string): string {
  const d = daysUntil(dateStr)
  if (d < 0) return `${Math.abs(d)}d overdue`
  if (d === 0) return 'Today'
  if (d === 1) return 'Tomorrow'
  return `${d}d`
}

export function dueUrgency(dateStr: string): 'overdue' | 'soon' | 'near' | 'far' {
  const d = daysUntil(dateStr)
  if (d < 0) return 'overdue'
  if (d <= 1) return 'soon'
  if (d <= 3) return 'near'
  return 'far'
}

export const urgencyClasses: Record<string, string> = {
  overdue: 'bg-[#8FC1F0]/20 text-[#8FC1F0]',
  soon: 'bg-[#8FC1F0] text-[#0D0E11]',
  near: 'bg-[#2A2B30] text-[#8B8D93]',
  far: 'bg-[#2A2B30] text-[#8B8D93]',
}