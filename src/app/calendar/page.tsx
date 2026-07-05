import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { api } from '@/lib/api/client'
import CalendarView from '@/components/CalendarView'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: { session } } = await supabase.auth.getSession()
  const token = session!.access_token

  const displayName = user.user_metadata?.display_name || user.email!.split('@')[0]

  // Fetch current month
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

  const calendarData = await api.getCalendar(start, end, token)

  return (
    <CalendarView
      calendarData={calendarData}
      token={token}
      displayName={displayName}
      initialYear={now.getFullYear()}
      initialMonth={now.getMonth()}
    />
  )
}