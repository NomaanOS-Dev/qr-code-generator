import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { QRCodeSVG } from 'qrcode.react'
import { Plus, QrCode, ExternalLink, BarChart3 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const metadata = {
  title: 'My QR Codes — ScanFlow',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select(`
      id,
      name,
      slug,
      destination_url,
      foreground_color,
      background_color,
      logo_path,
      is_active,
      created_at,
      qr_scans (count)
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">My QR Codes</h1>
          <p className="text-muted-foreground mt-1">
            {qrCodes?.length ?? 0} {qrCodes?.length === 1 ? 'code' : 'codes'} · Manage
            and track all your dynamic QR codes
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create">
            <Plus className="h-4 w-4 mr-2" />
            Create QR Code
          </Link>
        </Button>
      </div>

      {!qrCodes || qrCodes.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No QR codes yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first dynamic QR code to get started.
          </p>
          <Button asChild>
            <Link href="/dashboard/create">
              <Plus className="h-4 w-4 mr-2" />
              Create your first QR code
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map((qr) => {
            const scanCount = Array.isArray(qr.qr_scans)
              ? qr.qr_scans[0]?.count ?? 0
              : 0

            return (
              <Card key={qr.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold truncate">
                      {qr.name}
                    </CardTitle>
                    <Badge
                      variant={qr.is_active ? 'default' : 'secondary'}
                      className="shrink-0"
                    >
                      {qr.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="p-1.5 rounded-md shrink-0"
                      style={{ backgroundColor: qr.background_color }}
                    >
                      <QRCodeSVG
                        value={`${appUrl}/r/${qr.slug}`}
                        size={64}
                        fgColor={qr.foreground_color}
                        bgColor={qr.background_color}
                        level="H"
                        imageSettings={
                          qr.logo_path
                            ? {
                                src: qr.logo_path,
                                height: 12,
                                width: 12,
                                excavate: true,
                              }
                            : undefined
                        }
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-2xl font-bold leading-none">
                          {scanCount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          scans
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        Created{' '}
                        {formatDistanceToNow(new Date(qr.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1.5">
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                    <p className="text-xs font-mono truncate flex-1">
                      {qr.destination_url}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/dashboard/${qr.id}`}>View details</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/dashboard/${qr.id}/analytics`}>
                        Analytics
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}