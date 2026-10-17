import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanContext } from '@/lib/plan-guard'
import {
  getCurrentWorkspace,
  getUserRole,
  getTeamMemberLimit,
} from '@/lib/workspaces'
import { TeamManagementClient } from '@/components/team/team-management-client'

// ✅ REQUIRED for Next.js 16 + Cache Components when using `await connection()`
export const instant = false

export const metadata = {
  title: 'Team — ScanFlow',
}

export default async function TeamPage() {
  await connection()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const workspace = await getCurrentWorkspace()
  if (!workspace) {
    console.warn('[TeamPage] no workspace for user', user.id)
    redirect('/dashboard')
  }

  const myRole = await getUserRole(workspace.id)
  if (!myRole) {
    console.warn('[TeamPage] no role for workspace', workspace.id)
    redirect('/dashboard')
  }

  const ctx = await getPlanContext()
  if (!ctx) redirect('/login')

  const { data: members, error } = await supabase
    .from('workspace_members')
    .select(
      `
      id,
      user_id,
      invited_email,
      role,
      status,
      invite_expires_at,
      created_at,
      profiles!workspace_members_user_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq('workspace_id', workspace.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[TeamPage] members query error:', error)
  }

  const memberLimit = getTeamMemberLimit(ctx.plan)
  const activeCount = (members ?? []).filter(
    (m) => m.status === 'active'
  ).length

  const mappedMembers = (members ?? []).map((m) => ({
    id: m.id,
    user_id: m.user_id,
    invited_email: m.invited_email,
    role: m.role,
    status: m.status,
    invite_expires_at: m.invite_expires_at,
    created_at: m.created_at ?? new Date().toISOString(),
    profiles: Array.isArray(m.profiles) ? m.profiles[0] ?? null : m.profiles,
  }))

  return (
    <TeamManagementClient
      workspace={workspace}
      members={mappedMembers}
      myRole={myRole}
      plan={ctx.plan}
      memberLimit={memberLimit}
      activeCount={activeCount}
    />
  )
}