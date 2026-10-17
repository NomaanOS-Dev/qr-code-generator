import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type {
  WorkspaceRole,
  WorkspaceWithMembership,
  Permission,
} from '@/types/workspaces'
import { hasPermission } from '@/types/workspaces'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'
import { nanoid } from 'nanoid'

/**
 * Normalize a raw workspace row from Supabase into a WorkspaceWithMembership.
 * Coalesces nullable timestamps.
 */
function normalizeWorkspace(
  ws: {
    id: string
    name: string
    slug: string
    owner_id: string
    created_at: string | null
    updated_at: string | null
  },
  membership: { role: WorkspaceRole; status: 'active' | 'pending' | 'revoked' },
  memberCount: number
): WorkspaceWithMembership {
  return {
    id: ws.id,
    name: ws.name,
    slug: ws.slug,
    owner_id: ws.owner_id,
    created_at: ws.created_at ?? new Date().toISOString(),
    updated_at: ws.updated_at ?? new Date().toISOString(),
    membership,
    member_count: memberCount,
  }
}

/**
 * Get all workspaces the current user is a member of.
 */
export async function getUserWorkspaces(): Promise<WorkspaceWithMembership[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: memberships, error } = await supabase
    .from('workspace_members')
    .select(
      `
      workspace_id,
      role,
      status,
      workspaces:workspace_id (
        id,
        name,
        slug,
        owner_id,
        created_at,
        updated_at
      )
    `
    )
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (error || !memberships) return []

  const workspaceIds = memberships.map((m) => m.workspace_id)
  if (workspaceIds.length === 0) return []

  const { data: counts } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .in('workspace_id', workspaceIds)
    .eq('status', 'active')

  const countMap = new Map<string, number>()
  ;(counts ?? []).forEach((row) => {
    countMap.set(row.workspace_id, (countMap.get(row.workspace_id) ?? 0) + 1)
  })

  const result: WorkspaceWithMembership[] = []
  for (const m of memberships) {
    const rawWs = Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces
    if (!rawWs) continue

    result.push(
      normalizeWorkspace(
        rawWs,
        {
          role: m.role as WorkspaceRole,
          status: m.status as 'active' | 'pending' | 'revoked',
        },
        countMap.get(m.workspace_id) ?? 1
      )
    )
  }

  return result
}

/**
 * Get the current workspace (from cookie or first membership).
 * Self-heals by creating a default workspace if none exists.
 */
export async function getCurrentWorkspace(): Promise<WorkspaceWithMembership | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const activeId = cookieStore.get('active_workspace_id')?.value

  let workspaces = await getUserWorkspaces()

  // Self-heal: if user has no workspace, create one
  if (workspaces.length === 0) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle()

    const displayName =
      profile?.full_name || profile?.email?.split('@')[0] || 'My'
    const wsName = `${displayName}'s Workspace`
    const wsSlug = `ws-${nanoid(10)}`

    const { data: ws, error: wsErr } = await supabase
      .from('workspaces')
      .insert({ name: wsName, slug: wsSlug, owner_id: user.id })
      .select('id, name, slug, owner_id, created_at, updated_at')
      .single()

    if (wsErr || !ws) {
      console.error('[workspaces] failed to self-heal workspace:', wsErr)
      return null
    }

    await supabase.from('workspace_members').insert({
      workspace_id: ws.id,
      user_id: user.id,
      role: 'owner',
      status: 'active',
    })

    // Reassign orphan QR codes to this workspace
    await supabase
      .from('qr_codes')
      .update({ workspace_id: ws.id })
      .eq('user_id', user.id)
      .is('workspace_id', null)

    workspaces = [
      normalizeWorkspace(
        ws,
        { role: 'owner' as WorkspaceRole, status: 'active' },
        1
      ),
    ]
  }

  if (activeId) {
    const found = workspaces.find((w) => w.id === activeId)
    if (found) return found
  }

  return workspaces[0]
}

/**
 * Check if the current user has a specific permission in a workspace.
 */
export async function canInWorkspace(
  workspaceId: string,
  permission: Permission
): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role, status')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!membership) return false
  return hasPermission(membership.role as WorkspaceRole, permission)
}

/**
 * Get the current user's role in a workspace.
 */
export async function getUserRole(
  workspaceId: string
): Promise<WorkspaceRole | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  return (data?.role as WorkspaceRole) ?? null
}

/**
 * Get team member limit for a plan.
 */
export function getTeamMemberLimit(plan: Plan): number {
  return PLAN_LIMITS[plan].teamMembers
}

/**
 * Count active members in a workspace.
 */
export async function countWorkspaceMembers(
  workspaceId: string
): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('workspace_members')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')

  return count ?? 0
}