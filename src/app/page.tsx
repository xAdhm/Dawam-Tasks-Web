import { createClient } from '@/lib/supabase/server'
import { api } from '@/lib/api/client'
import Navbar from '@/components/Navbar'
import TodayView from '@/components/TodayView'
import LandingPage from '@/components/LandingPage'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; passwordReset?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <LandingPage />
  }

  const { welcome, passwordReset } = await searchParams
  const bannerType = welcome === 'true' ? 'welcome' : passwordReset === 'true' ? 'passwordReset' : null

  const { data: { session } } = await supabase.auth.getSession()
  const token = session!.access_token

  const displayName = user.user_metadata?.display_name || user.email!.split('@')[0]

  const sections = await api.getSections(token)

  const sectionsWithTasks = await Promise.all(
    sections.map(async (section) => ({
      section,
      tasks: await api.getTasks(section.id, token),
    }))
  )

  return (
    <>
      <Navbar userEmail={user.email!} displayName={displayName} />
      <TodayView
        sectionsWithTasks={sectionsWithTasks}
        token={token}
        userEmail={user.email!}
        displayName={displayName}
        bannerType={bannerType}
      />
    </>
  )
}