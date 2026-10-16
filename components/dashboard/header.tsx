'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  QrCode,
  Plus,
  BarChart3,
  Globe,
  CreditCard,
  Menu,
  LayoutTemplate,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SignOutButton } from '@/components/auth/signout-button'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
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

export function DashboardHeader({ user, profile, plan }: HeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-primary-foreground" />
                </div>
                ScanFlow
              </SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <Badge
                variant={plan === 'free' ? 'secondary' : 'default'}
                className="w-full justify-center py-1 capitalize mb-4"
              >
                {plan} plan
              </Badge>
              <nav className="space-y-1">
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
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-4 pt-4 border-t">
                <SignOutButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search (desktop) */}
      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search QR codes..."
            className="w-full h-9 pl-9 pr-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        <Button asChild size="sm">
          <Link href="/dashboard/create">
            <Plus className="h-4 w-4 mr-1" />
            Create QR
          </Link>
        </Button>
      </div>
    </header>
  )
}