'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface ManageSubscriptionProps {
  status: string
  currentPeriodEnd: string | null
}

export function ManageSubscription({
  status,
  currentPeriodEnd,
}: ManageSubscriptionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  if (status === 'cancelling') {
    return (
      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
        Your subscription is set to cancel on{' '}
        {currentPeriodEnd
          ? new Date(currentPeriodEnd).toLocaleDateString()
          : 'the end of this billing period'}
        . You&apos;ll be downgraded to Free after that.
      </div>
    )
  }

  if (status !== 'active') {
    return null
  }

  function handleCancel() {
    startTransition(async () => {
      const res = await fetch('/api/billing/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to cancel')
        return
      }
      toast.success(data.message)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Base UI DialogTrigger → `render` */}
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            Manage subscription
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Cancel your subscription?
          </DialogTitle>
          <DialogDescription>
            Your plan will remain active until the end of the current billing
            period. After that, you&apos;ll be downgraded to the Free plan and
            lose access to paid features.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">What happens:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>You keep your paid features until period end</li>
            <li>
              QR codes beyond the Free limit stay active but can&apos;t be
              edited
            </li>
            <li>Analytics history is preserved for 7 days on Free</li>
          </ul>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Keep subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Yes, cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}