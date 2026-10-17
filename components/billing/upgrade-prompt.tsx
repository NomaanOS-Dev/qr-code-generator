'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sparkles, Lock, ArrowRight } from 'lucide-react'
import { PLAN_NAMES, type Plan } from '@/lib/plans'

interface UpgradePromptProps {
  currentPlan: Plan
  requiredPlan: Plan
  feature?: string
  variant?: 'inline' | 'modal-trigger' | 'gate'
  onDismiss?: () => void
}

const PLAN_FEATURES: Record<Plan, string[]> = {
  free: ['2 QR codes', '7-day analytics', 'Basic colors'],
  starter: ['10 QR codes', '30-day analytics', 'Logo upload'],
  pro: ['50 QR codes', 'Custom domains', 'CSV export', '3 team members'],
  agency: ['500 QR codes', 'Client workspaces', 'API access', '10 team members'],
}

export function UpgradePrompt({
  currentPlan,
  requiredPlan,
  feature,
  variant = 'inline',
  onDismiss,
}: UpgradePromptProps) {
  const [open, setOpen] = useState(false)

  const message = feature
    ? `${feature} requires the ${PLAN_NAMES[requiredPlan]} plan.`
    : `Upgrade to ${PLAN_NAMES[requiredPlan]} to unlock more.`

  const content = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium">{message}</p>
          <p className="text-sm text-muted-foreground">
            You're on the {PLAN_NAMES[currentPlan]} plan.
          </p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button variant="outline" size="sm" asChild>
          <Link href="/pricing">View plans</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/pricing">
            Upgrade <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )

  // Inline banner
  if (variant === 'inline') {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        {content}
      </div>
    )
  }

  // Blurred lock overlay for gated features
  if (variant === 'gate') {
    return (
      <div className="relative rounded-lg border-2 border-dashed p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{feature ?? 'This feature'} is locked</p>
            <p className="text-sm text-muted-foreground mt-1">
              Available on {PLAN_NAMES[requiredPlan]} and higher
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/pricing">Upgrade to unlock</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Modal trigger
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Lock className="h-3.5 w-3.5 mr-1.5" />
        Unlock {feature ?? 'this feature'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to {PLAN_NAMES[requiredPlan]}</DialogTitle>
            <DialogDescription>
              {feature
                ? `${feature} isn't available on your current plan.`
                : 'You need a higher plan to access this feature.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm font-medium mb-2">
              What you'll unlock on {PLAN_NAMES[requiredPlan]}:
            </p>
            <ul className="space-y-1">
              {PLAN_FEATURES[requiredPlan].map((f) => (
                <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Not now
            </Button>
            <Button asChild>
              <Link href="/pricing">View plans</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}