'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
    inviteMember,
    updateMemberRole,
    removeMember,
    cancelInvite,
} from '@/app/actions/workspaces'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UpgradePrompt } from '@/components/billing/upgrade-prompt'
import {
    ROLE_LABELS,
    ROLE_DESCRIPTIONS,
    type WorkspaceRole,
} from '@/types/workspaces'
import type { WorkspaceWithMembership } from '@/types/workspaces'
import type { Plan } from '@/lib/plans'
import { PLAN_NAMES } from '@/lib/plans'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
    UserPlus,
    Loader2,
    MoreHorizontal,
    Clock,
    Mail,
    Shield,
    Crown,
    Users,
    Copy,
    X,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Member {
    id: string
    user_id: string | null
    invited_email: string | null
    role: string
    status: string
    invite_expires_at: string | null
    created_at: string
    profiles: {
        id: string
        full_name: string | null
        email: string
        avatar_url: string | null
    } | null
}

interface TeamManagementClientProps {
    workspace: WorkspaceWithMembership
    members: Member[]
    myRole: WorkspaceRole
    plan: Plan
    memberLimit: number
    activeCount: number
}

function getInitials(name: string | null, email: string): string {
    if (name) {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }
    return email.slice(0, 2).toUpperCase()
}

function RoleIcon({ role }: { role: WorkspaceRole }) {
    if (role === 'owner') return <Crown className="h-3.5 w-3.5" />
    if (role === 'admin') return <Shield className="h-3.5 w-3.5" />
    return <Users className="h-3.5 w-3.5" />
}

export function TeamManagementClient({
    workspace,
    members,
    myRole,
    plan,
    memberLimit,
    activeCount,
}: TeamManagementClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [inviteOpen, setInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<WorkspaceRole>('member')
    const [inviting, setInviting] = useState(false)
    const [inviteLink, setInviteLink] = useState<string | null>(null)

    const canInvite = ['owner', 'admin'].includes(myRole)
    const atLimit = activeCount >= memberLimit
    const isFreePlan = plan === 'free'
    const requiredPlan: Plan =
        plan === 'free' ? 'pro' : plan === 'starter' ? 'pro' : 'agency'

    const activeMembers = members.filter((m) => m.status === 'active')
    const pendingMembers = members.filter((m) => m.status === 'pending')

    async function handleInvite() {
        if (!inviteEmail.trim()) return
        setInviting(true)
        const result = await inviteMember(workspace.id, inviteEmail, inviteRole)
        setInviting(false)
        if (result.error) {
            toast.error(result.error)
            return
        }
        toast.success('Invite created')
        setInviteLink(result.inviteUrl ?? null)
        setInviteEmail('')
        router.refresh()
    }

    function handleCopyInviteLink() {
        if (!inviteLink) return
        navigator.clipboard.writeText(inviteLink)
        toast.success('Invite link copied')
    }

    function handleChangeRole(memberId: string, role: WorkspaceRole) {
        startTransition(async () => {
            const result = await updateMemberRole(memberId, role)
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success('Role updated')
            router.refresh()
        })
    }

    function handleRemove(memberId: string) {
        startTransition(async () => {
            const result = await removeMember(memberId)
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success('Member removed')
            router.refresh()
        })
    }

    function handleCancelInvite(memberId: string) {
        startTransition(async () => {
            const result = await cancelInvite(memberId)
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success('Invite cancelled')
            router.refresh()
        })
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold">Team</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage who has access to {workspace.name}
                    </p>
                </div>
                {canInvite && !isFreePlan && !atLimit && (
                    <>
                        <Button onClick={() => setInviteOpen(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite member
                        </Button>
                        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Invite a team member</DialogTitle>
                                    <DialogDescription>
                                        They&apos;ll receive a link to join {workspace.name}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="invite-email">Email address</Label>
                                        <Input
                                            id="invite-email"
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="teammate@example.com"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="invite-role">Role</Label>
                                        <Select
                                            value={inviteRole}
                                            onValueChange={(v) => setInviteRole(v as WorkspaceRole)}
                                        >
                                            <SelectTrigger id="invite-role">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                                {myRole === 'owner' && (
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            {ROLE_DESCRIPTIONS[inviteRole]}
                                        </p>
                                    </div>
                                    {inviteLink && (
                                        <div className="rounded-md bg-muted p-3 space-y-2">
                                            <p className="text-xs font-medium">
                                                Share this link with your teammate:
                                            </p>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={inviteLink}
                                                    readOnly
                                                    className="font-mono text-xs"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={handleCopyInviteLink}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setInviteOpen(false)
                                            setInviteLink(null)
                                            setInviteEmail('')
                                        }}
                                        disabled={inviting}
                                    >
                                        Close
                                    </Button>
                                    {!inviteLink && (
                                        <Button
                                            onClick={handleInvite}
                                            disabled={inviting || !inviteEmail.trim()}
                                        >
                                            {inviting && (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            )}
                                            Send invite
                                        </Button>
                                    )}
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>

            {isFreePlan && (
                <UpgradePrompt
                    currentPlan={plan}
                    requiredPlan="pro"
                    feature="Team collaboration"
                    variant="inline"
                />
            )}

            {!isFreePlan && atLimit && (
                <UpgradePrompt
                    currentPlan={plan}
                    requiredPlan={requiredPlan}
                    feature={`You've reached your ${PLAN_NAMES[plan]} plan limit (${memberLimit} members)`}
                    variant="inline"
                />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>
                        Members ({activeCount}/{memberLimit})
                    </CardTitle>
                    <CardDescription>
                        {PLAN_NAMES[plan]} plan allows {memberLimit} team member
                        {memberLimit !== 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {activeMembers.map((member) => {
                        const profile = member.profiles
                        const isOwner = member.role === 'owner'
                        const canManage =
                            canInvite &&
                            !isOwner &&
                            !(myRole === 'admin' && member.role === 'admin')

                        return (
                            <div key={member.id} className="flex items-center gap-3 py-2">
                                <Avatar>
                                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                                    <AvatarFallback>
                                        {getInitials(
                                            profile?.full_name ?? null,
                                            profile?.email ?? ''
                                        )}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                        {profile?.full_name ?? 'User'}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {profile?.email}
                                    </p>
                                </div>

                                <Badge
                                    variant={isOwner ? 'default' : 'secondary'}
                                    className="flex items-center gap-1"
                                >
                                    <RoleIcon role={member.role as WorkspaceRole} />
                                    {ROLE_LABELS[member.role as WorkspaceRole]}
                                </Badge>

                                {canManage && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            render={
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onSelect={() => handleChangeRole(member.id, 'member')}
                                                disabled={member.role === 'member' || isPending}
                                            >
                                                Set as Member
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={() => handleChangeRole(member.id, 'viewer')}
                                                disabled={member.role === 'viewer' || isPending}
                                            >
                                                Set as Viewer
                                            </DropdownMenuItem>
                                            {myRole === 'owner' && (
                                                <DropdownMenuItem
                                                    onSelect={() => handleChangeRole(member.id, 'admin')}
                                                    disabled={member.role === 'admin' || isPending}
                                                >
                                                    Set as Admin
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onSelect={() => handleRemove(member.id)}
                                                disabled={isPending}
                                            >
                                                Remove from team
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {pendingMembers.length > 0 && canInvite && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending invites ({pendingMembers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingMembers.map((member) => (
                            <div key={member.id} className="flex items-center gap-3 py-2">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                        {member.invited_email}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Invited {format(new Date(member.created_at), 'MMM d')} as{' '}
                                        {ROLE_LABELS[member.role as WorkspaceRole]} · Expires{' '}
                                        {member.invite_expires_at
                                            ? format(new Date(member.invite_expires_at), 'MMM d')
                                            : 'never'}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelInvite(member.id)}
                                    disabled={isPending}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}