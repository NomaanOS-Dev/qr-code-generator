export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer'
export type MemberStatus = 'active' | 'pending' | 'revoked'

export interface Workspace {
  id: string
  name: string
  slug: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string | null
  invited_email: string | null
  invited_by: string | null
  role: WorkspaceRole
  status: MemberStatus
  invite_token: string | null
  invite_expires_at: string | null
  created_at: string
}

export interface WorkspaceWithMembership extends Workspace {
  membership: {
    role: WorkspaceRole
    status: MemberStatus
  }
  member_count: number
}

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
}

export const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  owner: 'Full control including billing and deletion',
  admin: 'Manage members and all QR codes',
  member: 'Create and edit QR codes',
  viewer: 'View-only access',
}

export const ROLE_PERMISSIONS = {
  owner: [
    'manage_workspace',
    'manage_billing',
    'manage_members',
    'create_qr',
    'edit_qr',
    'delete_qr',
    'view_analytics',
  ],
  admin: [
    'manage_members',
    'create_qr',
    'edit_qr',
    'delete_qr',
    'view_analytics',
  ],
  member: ['create_qr', 'edit_qr', 'view_analytics'],
  viewer: ['view_analytics'],
} as const

export type Permission = (typeof ROLE_PERMISSIONS)['owner'][number]

export function hasPermission(
  role: WorkspaceRole,
  permission: Permission
): boolean {
  return (ROLE_PERMISSIONS[role] as readonly Permission[]).includes(permission)
}