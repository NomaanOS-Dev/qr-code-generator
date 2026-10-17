'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setActiveWorkspace, createWorkspace } from '@/app/actions/workspaces'
import { ROLE_LABELS } from '@/types/workspaces'
import type { WorkspaceWithMembership } from '@/types/workspaces'
import { toast } from 'sonner'
import {
  ChevronsUpDown,
  Plus,
  Check,
  Building2,
  Users,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceWithMembership[]
  activeId: string | null
}

export function WorkspaceSwitcher({
  workspaces,
  activeId,
}: WorkspaceSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0]

  if (!active) {
    return (
      <>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create workspace
        </Button>
        {renderCreateDialog()}
      </>
    )
  }

  function handleSwitch(workspaceId: string) {
    if (workspaceId === activeId) return
    startTransition(async () => {
      const result = await setActiveWorkspace(workspaceId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const result = await createWorkspace(newName)
    setCreating(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Workspace created')
    setCreateOpen(false)
    setNewName('')
    router.refresh()
  }

  function renderCreateDialog() {
    return (
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a workspace</DialogTitle>
            <DialogDescription>
              Workspaces keep QR codes, members, and analytics separate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-workspace-name">Workspace name</Label>
            <Input
              id="new-workspace-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Acme Agency, My Restaurant"
              maxLength={60}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreate()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
            >
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <DropdownMenu>
        {/* Base UI trigger → render, not asChild */}
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="w-full justify-between px-3 h-auto py-2"
              disabled={isPending}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0 text-left flex-1">
                  <p className="text-sm font-medium truncate">{active.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABELS[active.membership.role]} ·{' '}
                    {active.member_count}{' '}
                    {active.member_count === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
            </Button>
          }
        />

        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onSelect={() => handleSwitch(ws.id)}
                className={cn(
                  'cursor-pointer',
                  ws.id === activeId && 'bg-accent'
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{ws.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_LABELS[ws.membership.role]}
                    </p>
                  </div>
                  {ws.id === activeId && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => setCreateOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              New workspace
            </DropdownMenuItem>
            {/* Base UI item with Link → render */}
            <DropdownMenuItem
              render={
                <Link href="/dashboard/team" className="cursor-pointer">
                  <Users className="h-4 w-4 mr-2" />
                  Manage team
                </Link>
              }
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {renderCreateDialog()}
    </>
  )
}