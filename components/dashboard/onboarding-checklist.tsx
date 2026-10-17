'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, ChevronRight, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingChecklistProps {
  hasQrCode: boolean
  hasScans: boolean
  hasViewedAnalytics: boolean
  hasLogoOrColor: boolean
}

export function OnboardingChecklist({
  hasQrCode,
  hasScans,
  hasViewedAnalytics,
  hasLogoOrColor,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('onboarding-dismissed') === 'true'
  })

  const items = [
    {
      label: 'Create your first QR code',
      description: 'Get started with a dynamic QR code',
      completed: hasQrCode,
      href: '/dashboard/create',
    },
    {
      label: 'Customize with colors or logo',
      description: 'Make it match your brand',
      completed: hasLogoOrColor,
      href: '/dashboard/create',
    },
    {
      label: 'Scan your QR code',
      description: 'Test it with your phone camera',
      completed: hasScans,
      href: '/dashboard',
    },
    {
      label: 'View your analytics',
      description: 'See where your scans come from',
      completed: hasViewedAnalytics,
      href: '/dashboard/analytics',
    },
  ]

  const completedCount = items.filter((i) => i.completed).length
  const allComplete = completedCount === items.length
  const progress = (completedCount / items.length) * 100

  if (dismissed || allComplete) return null

  function handleDismiss() {
    localStorage.setItem('onboarding-dismissed', 'true')
    setDismissed(true)
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Get started with ScanFlow</CardTitle>
            <CardDescription className="mt-1">
              {completedCount} of {items.length} complete
            </CardDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 -mr-2 -mt-1"
          onClick={handleDismiss}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.label}>
              {item.completed ? (
                <div className="flex items-center gap-3 p-2 opacity-60">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium line-through">
                      {item.label}
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-background transition-colors group'
                  )}
                >
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}