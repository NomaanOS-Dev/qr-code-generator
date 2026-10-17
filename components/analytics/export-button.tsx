'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { exportScansCsv } from '@/app/actions/analytics'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'

interface ExportButtonProps {
  qrCodeId?: string | null
  days: number
  canExport: boolean
}

export function ExportButton({
  qrCodeId = null,
  days,
  canExport,
}: ExportButtonProps) {
  const [isPending, startTransition] = useTransition()

  if (!canExport) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard/billing">
          <Lock className="h-4 w-4 mr-2" />
          Export CSV (Pro)
        </Link>
      </Button>
    )
  }

  function handleExport() {
    startTransition(async () => {
      const result = await exportScansCsv({ qrCodeId, days })
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (!result.csv || !result.filename) {
        toast.error('Failed to generate CSV')
        return
      }

      const blob = new Blob([result.csv], {
        type: 'text/csv;charset=utf-8;',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('CSV exported')
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Export CSV
    </Button>
  )
}