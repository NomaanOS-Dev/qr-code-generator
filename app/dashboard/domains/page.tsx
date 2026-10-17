import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanContext } from '@/lib/plan-guard'
import { getCurrentWorkspace, getUserRole } from '@/lib/workspaces'
import { DomainsClient } from '@/components/domains/domains-client'
import { UpgradePrompt } from '@/components/billing/upgrade-prompt'
import type { CustomDomain, DomainStatus } from '@/types/domains'

// ✅ REQUIRED for Next.js 16 + Cache Components when using `await connection()`
export const instant = false

export const metadata = {
  title: 'Custom Domains — ScanFlow',
}

export default async function DomainsPage() {
  await connection()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const workspace = await getCurrentWorkspace()
  if (!workspace) redirect('/dashboard')

  const myRole = await getUserRole(workspace.id)
  if (!myRole) redirect('/dashboard')

  const ctx = await getPlanContext()
  if (!ctx) redirect('/login')

  // Plan gate
  if (!ctx.limits.customDomains) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Custom Domains</h1>
          <p className="text-muted-foreground mt-1">
            Serve your QR codes from your own domain.
          </p>
        </div>
        <UpgradePrompt
          currentPlan={ctx.plan}
          requiredPlan="pro"
          feature="Custom domains"
          variant="gate"
        />
      </div>
    )
  }

  // Fetch domains for this workspace
  const { data: rows } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: false })

  // ✅ FIX: Cast the generic DB `string` to our strict `DomainStatus` type
  const domains: CustomDomain[] = (rows ?? []).map((row) => ({
    ...row,
    status: row.status as DomainStatus,
  }))

  const canManage = ['owner', 'admin'].includes(myRole)

  return (
    <DomainsClient
      workspace={workspace}
      domains={domains}
      canManage={canManage}
    />
  )
}