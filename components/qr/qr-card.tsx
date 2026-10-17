'use client'

import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ExternalLink,
  BarChart3,
  MoreHorizontal,
  Link2,
  Power,
  PowerOff,
  Trash2,
  Eye,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface QrCardData {
  id: string
  name: string
  slug: string
  destination_url: string
  foreground_color: string
  background_color: string
  logo_path: string | null
  is_active: boolean
  created_at: string
  scanCount: number
}

interface QrCardProps {
  qr: QrCardData
  appUrl: string
  view?: 'grid' | 'list'
  selected?: boolean
  onSelectChange?: (selected: boolean) => void
  onToggleActive?: (id: string, isActive: boolean) => void
  onDelete?: (id: string, name: string) => void
}

export function QrCard({
  qr,
  appUrl,
  view = 'grid',
  selected = false,
  onSelectChange,
  onToggleActive,
  onDelete,
}: QrCardProps) {
  const shortUrl = `${appUrl}/r/${qr.slug}`

  const qrSvg = (
    <QRCodeSVG
      value={shortUrl}
      size={view === 'list' ? 56 : 72}
      fgColor={qr.foreground_color}
      bgColor={qr.background_color}
      level="H"
      imageSettings={
        qr.logo_path
          ? {
              src: qr.logo_path,
              height: view === 'list' ? 11 : 14,
              width: view === 'list' ? 11 : 14,
              excavate: true,
            }
          : undefined
      }
    />
  )

  const checkbox = onSelectChange && (
    <Checkbox
      checked={selected}
      onCheckedChange={(v) => onSelectChange(v === true)}
      aria-label={`Select ${qr.name}`}
      onClick={(e) => e.stopPropagation()}
    />
  )

  const actionsMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => e.preventDefault()}
          />
        }
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          render={
            <Link href={`/dashboard/${qr.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View details
            </Link>
          }
        />
        <DropdownMenuItem
          render={
            <Link href={`/dashboard/${qr.id}/analytics`}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          }
        />
        <DropdownMenuItem
          onClick={() => onToggleActive?.(qr.id, !qr.is_active)}
        >
          {qr.is_active ? (
            <>
              <PowerOff className="h-4 w-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <Power className="h-4 w-4 mr-2" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete?.(qr.id, qr.name)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (view === 'list') {
    return (
      <Card
        className={cn(
          'transition-all hover:shadow-md',
          selected && 'ring-2 ring-primary'
        )}
      >
        <CardContent className="p-4 flex items-center gap-4">
          {checkbox}

          <Link
            href={`/dashboard/${qr.id}`}
            className="flex items-center gap-4 flex-1 min-w-0"
          >
            <div
              className="p-1.5 rounded-md shrink-0"
              style={{ backgroundColor: qr.background_color }}
            >
              {qrSvg}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{qr.name}</h3>
                <Badge
                  variant={qr.is_active ? 'default' : 'secondary'}
                  className="shrink-0"
                >
                  {qr.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link2 className="h-3 w-3" />
                <span className="font-mono truncate">
                  {qr.destination_url}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(qr.created_at), {
                    addSuffix: true,
                  })}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  {qr.scanCount} scans
                </span>
              </div>
            </div>
          </Link>

          {actionsMenu}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-md',
        selected && 'ring-2 ring-primary'
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {checkbox}
            <div className="min-w-0 flex-1">
              <Link href={`/dashboard/${qr.id}`}>
                <h3 className="font-semibold truncate hover:text-primary transition-colors">
                  {qr.name}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(qr.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={qr.is_active ? 'default' : 'secondary'}>
              {qr.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {actionsMenu}
          </div>
        </div>

        <Link
          href={`/dashboard/${qr.id}`}
          className="flex items-center gap-3"
        >
          <div
            className="p-1.5 rounded-md shrink-0"
            style={{ backgroundColor: qr.background_color }}
          >
            {qrSvg}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold leading-none">
                {qr.scanCount}
              </span>
              <span className="text-xs text-muted-foreground">scans</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="font-mono truncate">{qr.destination_url}</span>
            </div>
          </div>
        </Link>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/dashboard/${qr.id}`}>View details</Link>
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" asChild>
            <Link href={`/dashboard/${qr.id}/analytics`}>Analytics</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}