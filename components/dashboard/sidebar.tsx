'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SignOutButton } from '@/components/auth/signout-button'
import { Badge } from '@/components/ui/badge'
import { WorkspaceSwitcher } from './workspace-switcher'
import {
  QrCode,
  Plus,
  BarChart3,
  LayoutTemplate,
  Globe,
  CreditCard,
  Users,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { WorkspaceWithMembership } from '@/types/workspaces'

interface SidebarProps {
  user: User
  profile: { full_name: string | null; email: string } | null
  plan: string
  qrCodeCount?: number
  qrCodeLimit?: number
  customDomainCount?: number
  customDomainLimit?: number
  workspaces: WorkspaceWithMembership[]
  activeWorkspaceId: string | null
}

const navigation = [
  { name: 'My QR Codes', href: '/dashboard', icon: QrCode },
  { name: 'Create QR', href: '/dashboard/create', icon: Plus },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Templates', href: '/dashboard/templates', icon: LayoutTemplate },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Domains', href: '/dashboard/domains', icon: Globe },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
]

/**
 * Small usage bar used for both QR codes and custom domains.
 * Colours shift from primary → amber → destructive as usage climbs.
 */
function UsageBar({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number
}) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const isNearLimit = pct >= 80
  const isAtLimit = pct >= 100

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span
          className={cn(
            'tabular-nums',
            isAtLimit && 'text-destructive font-medium'
          )}
        >
          {used} / {limit}
        </span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isAtLimit
              ? 'bg-destructive'
              : isNearLimit
                ? 'bg-amber-500'
                : 'bg-primary'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function DashboardSidebar({
  user,
  profile,
  plan,
  qrCodeCount = 0,
  qrCodeLimit = 0,
  customDomainCount = 0,
  customDomainLimit = 0,
  workspaces,
  activeWorkspaceId,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col bg-background border-r">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <QrCode className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">ScanFlow</span>
        </Link>
      </div>

      <div className="px-2 py-3 border-b">
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeId={activeWorkspaceId}
        />
      </div>

      <div className="px-4 py-3 border-b space-y-3">
        <div className="flex items-center justify-between">
          <Badge
            variant={plan === 'free' ? 'secondary' : 'default'}
            className="capitalize"
          >
            {plan} plan
          </Badge>
          <Link
            href="/dashboard/billing"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Manage
          </Link>
        </div>

        {qrCodeLimit > 0 && (
          <UsageBar label="QR codes" used={qrCodeCount} limit={qrCodeLimit} />
        )}

        {customDomainLimit > 0 && (
          <UsageBar
            label="Custom domains"
            used={customDomainCount}
            limit={customDomainLimit}
          />
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <div className="px-3 py-2">
          <p className="text-sm font-medium truncate">
            {profile?.full_name ?? 'User'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {profile?.email ?? user.email}
          </p>
        </div>
        <SignOutButton />
      </div>
    </aside>
  )
}