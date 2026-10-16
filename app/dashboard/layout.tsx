import { redirect } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <NuqsAdapter>
      <div className="min-h-screen flex bg-muted/30">
        <DashboardSidebar
          user={user}
          profile={profile}
          plan={subscription?.plan ?? 'free'}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader
            user={user}
            profile={profile}
            plan={subscription?.plan ?? 'free'}
          />
          <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </NuqsAdapter>
  )
}