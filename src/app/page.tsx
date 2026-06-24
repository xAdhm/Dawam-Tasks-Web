import { createClient } from '@/lib/supabase/server'
import { api } from '@/lib/api/client'
import Navbar from '@/components/Navbar'
import TodayView from '@/components/TodayView'
import LandingPage from '@/components/LandingPage'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <LandingPage />
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

  return (
    <>
      <Navbar userEmail={user.email!} />
      <TodayView sectionsWithTasks={sectionsWithTasks} token={token} userEmail={user.email!} />
    </>
  )
}