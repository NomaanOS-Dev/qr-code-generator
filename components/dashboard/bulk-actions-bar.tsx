'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Power,
  PowerOff,
  Trash2,
  X,
  Loader2,
  Download,
} from 'lucide-react'

interface BulkActionsBarProps {
  count: number
  isPending: boolean
  isZipping?: boolean
  onActivate: () => void
  onDeactivate: () => void
  onDelete: () => void
  onDownloadZip: () => void
  onClear: () => void
}

export function BulkActionsBar({
  count,
  isPending,
  isZipping = false,
  onActivate,
  onDeactivate,
  onDelete,
  onDownloadZip,
  onClear,
}: BulkActionsBarProps) {
  if (count === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-2 rounded-full border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-2 shadow-lg">
        <Badge variant="secondary" className="rounded-full">
          {count} selected
        </Badge>

        <div className="h-5 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onDownloadZip}
          disabled={isPending || isZipping}
          className="rounded-full"
        >
          {isZipping ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          ZIP
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onActivate}
          disabled={isPending}
          className="rounded-full"
        >
          <Power className="h-4 w-4 mr-2" />
          Activate
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDeactivate}
          disabled={isPending}
          className="rounded-full"
        >
          <PowerOff className="h-4 w-4 mr-2" />
          Deactivate
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={isPending}
          className="rounded-full text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>

        <div className="h-5 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="rounded-full h-8 w-8"
          disabled={isPending || isZipping}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}