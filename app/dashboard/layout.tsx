import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { createClient } from '@/lib/supabase/server'
import { getPlanContext } from '@/lib/plan-guard'
import { getUserWorkspaces, getCurrentWorkspace } from '@/lib/workspaces'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

// ✅ REQUIRED for Next.js 16 + Cache Components when using `await connection()`
export const instant = false

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const [ctx, workspaces, currentWorkspace] = await Promise.all([
    getPlanContext(),
    getUserWorkspaces(),
    getCurrentWorkspace(),
  ])

  return (
    <NuqsAdapter>
      <div className="min-h-screen flex bg-muted/30">
        <DashboardSidebar
          user={user}
          profile={profile}
          plan={ctx?.plan ?? 'free'}
          qrCodeCount={ctx?.qrCodeCount ?? 0}
          qrCodeLimit={ctx?.limits.maxQrCodes ?? 0}
          workspaces={workspaces}
          activeWorkspaceId={currentWorkspace?.id ?? null}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader
            user={user}
            profile={profile}
            plan={ctx?.plan ?? 'free'}
            workspaces={workspaces}
            activeWorkspaceId={currentWorkspace?.id ?? null}
          />
          <main className="flex-1 p-6 overflow-x-hidden" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </NuqsAdapter>
  )
}