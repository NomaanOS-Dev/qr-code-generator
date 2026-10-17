import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { countryFlag, countryName, deviceLabel } from '@/lib/analytics'
import { format, formatDistanceToNow } from 'date-fns'
import { Activity, Smartphone, Monitor, Tablet, HelpCircle } from 'lucide-react'
import type { RecentScan } from '@/lib/analytics'

interface RecentScansProps {
  scans: RecentScan[]
  showQrName?: boolean
}

function DeviceIcon({ type }: { type: string | null }) {
  const cls = 'h-3.5 w-3.5'
  if (type === 'mobile') return <Smartphone className={cls} />
  if (type === 'desktop') return <Monitor className={cls} />
  if (type === 'tablet') return <Tablet className={cls} />
  return <HelpCircle className={cls} />
}

export function RecentScans({ scans, showQrName = true }: RecentScansProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent scans
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Latest activity across your QR codes
        </p>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No scans yet. Share your QR codes to start tracking.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border -mx-2">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between gap-3 py-2.5 px-2 hover:bg-muted/30 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xl leading-none shrink-0">
                    {countryFlag(scan.country_code ?? '')}
                  </span>
                  <div className="min-w-0 flex-1">
                    {showQrName && (
                      <Link
                        href={`/dashboard/${scan.qr_code_id}/analytics`}
                        className="text-sm font-medium hover:text-primary truncate block"
                      >
                        {scan.qr_code_name}
                      </Link>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <DeviceIcon type={scan.device_type} />
                        {deviceLabel(scan.device_type ?? 'unknown')}
                      </span>
                      {scan.country_code && (
                        <>
                          <span>·</span>
                          <span className="truncate">
                            {countryName(scan.country_code)}
                          </span>
                        </>
                      )}
                      {scan.referrer_domain && (
                        <>
                          <span>·</span>
                          <span className="truncate">
                            via {scan.referrer_domain}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(scan.scanned_at), {
                      addSuffix: true,
                    })}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {format(new Date(scan.scanned_at), 'MMM d, HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}