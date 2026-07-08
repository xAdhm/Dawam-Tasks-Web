import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarView from '@/components/CalendarView'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: { session } } = await supabase.auth.getSession()
  const token = session!.access_token

  const displayName = user.user_metadata?.display_name || user.email!.split('@')[0]

  return (
    <CalendarView
      token={token}
      displayName={displayName}
    />
  )
}