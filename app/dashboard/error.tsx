'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard error]', error)
  }, [error])

  return (
    <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">This page hit a snag</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          We couldn't load this part of your dashboard. Try refreshing, or go
          back to your QR codes.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground/70">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button onClick={reset} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
        <Button asChild>
          <Link href="/dashboard">
            <Home className="h-4 w-4 mr-2" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}