import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { api } from '@/lib/api/client'
import TodayView from '@/components/TodayView'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: { session } } = await supabase.auth.getSession()
  const token = session!.access_token

  const sections = await api.getSections(token)

  const sectionsWithTasks = await Promise.all(
    sections.map(async (section) => ({
      section,
      tasks: await api.getTasks(section.id, token),
    }))
  )

  return <TodayView sectionsWithTasks={sectionsWithTasks} token={token} userEmail={user.email!} />
}