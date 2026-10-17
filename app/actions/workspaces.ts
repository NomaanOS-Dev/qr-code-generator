'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'
import { getPlanContext } from '@/lib/plan-guard'
import { countWorkspaceMembers, getUserRole, getTeamMemberLimit } from '@/lib/workspaces'
import type { WorkspaceRole } from '@/types/workspaces'
import { ROLE_LABELS } from '@/types/workspaces'

// ============================================================
// Set active workspace (cookie)
// ============================================================
export async function setActiveWorkspace(workspaceId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Verify membership
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!membership) return { error: 'Not a member of this workspace' }

  const cookieStore = await cookies()
  cookieStore.set('active_workspace_id', workspaceId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  return { success: true }
}

// ============================================================
// Create workspace
// ============================================================
export async function createWorkspace(name: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const trimmed = name.trim()
  if (trimmed.length < 2 || trimmed.length > 60) {
    return { error: 'Name must be between 2 and 60 characters' }
  }

  const slug = `ws-${nanoid(10)}`

  const { data: ws, error } = await supabase
    .from('workspaces')
    .insert({ name: trimmed, slug, owner_id: user.id })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Add self as owner member
  await supabase.from('workspace_members').insert({
    workspace_id: ws.id,
    user_id: user.id,
    role: 'owner',
    status: 'active',
  })

  // Set as active
  await setActiveWorkspace(ws.id)

  revalidatePath('/dashboard')
  return { success: true, id: ws.id }
}

// ============================================================
// Rename workspace
// ============================================================
export async function renameWorkspace(workspaceId: string, name: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const role = await getUserRole(workspaceId)
  if (role !== 'owner') return { error: 'Only owners can rename workspaces' }

  const trimmed = name.trim()
  if (trimmed.length < 2 || trimmed.length > 60) {
    return { error: 'Name must be between 2 and 60 characters' }
  }

  const { error } = await supabase
    .from('workspaces')
    .update({ name: trimmed })
    .eq('id', workspaceId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/team')
  return { success: true }
}

// ============================================================
// Invite member
// ============================================================
export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceRole
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const myRole = await getUserRole(workspaceId)
  if (!myRole || !['owner', 'admin'].includes(myRole)) {
    return { error: 'Only owners and admins can invite members' }
  }

  const trimmedEmail = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { error: 'Invalid email address' }
  }

  // Role escalation check: admins can't create owners/admins
  if (myRole === 'admin' && (role === 'owner' || role === 'admin')) {
    return { error: 'Admins can only invite members and viewers' }
  }

  // Check plan limit
  const ctx = await getPlanContext()
  if (!ctx) return { error: 'Not authenticated' }

  const memberLimit = getTeamMemberLimit(ctx.plan)
  const currentCount = await countWorkspaceMembers(workspaceId)

  if (currentCount >= memberLimit) {
    return {
      error: `Your ${ctx.plan} plan allows ${memberLimit} team members. Upgrade to invite more.`,
    }
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('workspace_members')
    .select('id, status')
    .eq('workspace_id', workspaceId)
    .or(`invited_email.eq.${trimmedEmail},user_id.not.is.null`)
    .eq('invited_email', trimmedEmail)
    .maybeSingle()

  if (existing) {
    return {
      error:
        existing.status === 'pending'
          ? 'An invite is already pending for this email'
          : 'This user is already a member',
    }
  }

  const inviteToken = nanoid(32)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { error } = await supabase.from('workspace_members').insert({
    workspace_id: workspaceId,
    invited_email: trimmedEmail,
    invited_by: user.id,
    role,
    status: 'pending',
    invite_token: inviteToken,
    invite_expires_at: expiresAt.toISOString(),
  })

  if (error) return { error: error.message }

  // TODO: Send email with invite link (Day 15 or later)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${appUrl}/invite/${inviteToken}`
  console.log(`[invite] ${trimmedEmail} → ${inviteUrl}`)

  revalidatePath('/dashboard/team')
  return { success: true, inviteUrl }
}

// ============================================================
// Accept invite
// ============================================================
export async function acceptInvite(token: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in to accept an invite' }

  const { data: invite } = await supabase
    .from('workspace_members')
    .select('id, workspace_id, role, status, invite_expires_at, invited_email')
    .eq('invite_token', token)
    .maybeSingle()

  if (!invite) return { error: 'Invite not found' }
  if (invite.status !== 'pending') return { error: 'Invite already used' }

  if (
    invite.invite_expires_at &&
    new Date(invite.invite_expires_at) < new Date()
  ) {
    return { error: 'Invite has expired' }
  }

  // Check email match
  if (invite.invited_email !== user.email?.toLowerCase()) {
    return {
      error: `This invite was sent to ${invite.invited_email}. Please log in with that email.`,
    }
  }

  const { error } = await supabase
    .from('workspace_members')
    .update({
      user_id: user.id,
      status: 'active',
      invite_token: null,
      invite_expires_at: null,
    })
    .eq('id', invite.id)

  if (error) return { error: error.message }

  await setActiveWorkspace(invite.workspace_id)

  revalidatePath('/dashboard')
  return { success: true, workspaceId: invite.workspace_id }
}

// ============================================================
// Update member role
// ============================================================
export async function updateMemberRole(
  memberId: string,
  newRole: WorkspaceRole
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, user_id')
    .eq('id', memberId)
    .maybeSingle()

  if (!member) return { error: 'Member not found' }

  const myRole = await getUserRole(member.workspace_id)
  if (!myRole || !['owner', 'admin'].includes(myRole)) {
    return { error: 'Only owners and admins can update roles' }
  }

  if (member.role === 'owner') {
    return { error: 'Cannot change the owner role' }
  }

  if (myRole === 'admin' && (newRole === 'owner' || newRole === 'admin')) {
    return { error: 'Admins cannot promote to admin or owner' }
  }

  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('id', memberId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/team')
  return { success: true }
}

// ============================================================
// Remove member
// ============================================================
export async function removeMember(memberId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, user_id')
    .eq('id', memberId)
    .maybeSingle()

  if (!member) return { error: 'Member not found' }

  if (member.role === 'owner') {
    return { error: 'Cannot remove the workspace owner' }
  }

  const myRole = await getUserRole(member.workspace_id)
  if (!myRole || !['owner', 'admin'].includes(myRole)) {
    return { error: 'Only owners and admins can remove members' }
  }

  if (myRole === 'admin' && member.role === 'admin') {
    return { error: 'Admins cannot remove other admins' }
  }

  const { error } = await supabase
    .from('workspace_members')
    .update({ status: 'revoked' })
    .eq('id', memberId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/team')
  return { success: true }
}

// ============================================================
// Cancel pending invite
// ============================================================
export async function cancelInvite(memberId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('id', memberId)
    .maybeSingle()

  if (!member) return { error: 'Invite not found' }

  const myRole = await getUserRole(member.workspace_id)
  if (!myRole || !['owner', 'admin'].includes(myRole)) {
    return { error: 'Only owners and admins can cancel invites' }
  }

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', memberId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/team')
  return { success: true }
}