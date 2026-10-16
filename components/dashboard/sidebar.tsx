'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SignOutButton } from '@/components/auth/signout-button'
import { Badge } from '@/components/ui/badge'
import {
  QrCode,
  Plus,
  BarChart3,
  FolderOpen,
  LayoutTemplate,
  Globe,
  CreditCard,
  Settings,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface SidebarProps {
  user: User
  profile: { full_name: string | null; email: string } | null
  plan: string
}

const navigation = [
  { name: 'My QR Codes', href: '/dashboard', icon: QrCode },
  { name: 'Create QR', href: '/dashboard/create', icon: Plus },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Templates', href: '/dashboard/templates', icon: LayoutTemplate },
  { name: 'Domains', href: '/dashboard/domains', icon: Globe },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
]

export function DashboardSidebar({ user, profile, plan }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col bg-background border-r">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <QrCode className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">ScanFlow</span>
        </Link>
      </div>

      {/* Plan Badge */}
      <div className="px-4 py-3 border-b">
        <Badge
          variant={plan === 'free' ? 'secondary' : 'default'}
          className="w-full justify-center py-1 capitalize"
        >
          {plan} plan
        </Badge>
      </div>

      {/* Navigation */}
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

      {/* User section */}
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