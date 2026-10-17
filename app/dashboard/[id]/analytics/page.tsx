import { redirect, notFound } from 'next/navigation'
import { connection } from 'next/server'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSingleQrAnalytics } from '@/lib/analytics-dashboard'
import { getPlanContext } from '@/lib/plan-guard'
import { getCurrentWorkspace } from '@/lib/workspaces'
import { SummaryCards } from '@/components/analytics/summary-cards'
import { ScansChart } from '@/components/analytics/scans-chart'
import { DeviceChart } from '@/components/analytics/device-chart'
import { CountryChart } from '@/components/analytics/country-chart'
import { RecentScans } from '@/components/analytics/recent-scans'
import { DateRangeSelector } from '@/components/analytics/date-range-selector'
import { ExportButton } from '@/components/analytics/export-button'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BarChart3, ExternalLink } from 'lucide-react'

// ✅ REQUIRED for Next.js 16 + Cache Components when using `await connection()`
export const instant = false

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ days?: string }>
}

export const metadata = {
  title: 'QR Analytics — ScanFlow',
}

export default async function QrAnalyticsPage({
  params,
  searchParams,
}: PageProps) {
  await connection()

  const { id } = await params
  const { days: daysParam } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const workspace = await getCurrentWorkspace()
  if (!workspace) redirect('/dashboard')

  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('id, name, slug, destination_url, is_active, created_at')
    .eq('id', id)
    .eq('workspace_id', workspace.id)
    .single()

  if (!qrCode) notFound()

  const ctx = await getPlanContext()
  if (!ctx) redirect('/login')

  const days = Math.min(
    Math.max(parseInt(daysParam ?? '30', 10) || 30, 1),
    365
  )
  const canExport = Boolean(ctx.limits.csvExport)

  const analytics = await getSingleQrAnalytics(
    user.id,
    workspace.id,
    qrCode.id,
    days
  )
  const hasAnyData = analytics.summary.total > 0

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const shortUrl = `${appUrl}/r/${qrCode.slug}`

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 flex-wrap">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href={`/dashboard/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold truncate">{qrCode.name}</h1>
            <Badge variant={qrCode.is_active ? 'default' : 'secondary'}>
              {qrCode.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span className="font-mono truncate">{shortUrl}</span>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangeSelector />
          <ExportButton qrCodeId={qrCode.id} days={days} canExport={canExport} />
        </div>
      </div>

      {!hasAnyData ? (
        <EmptyState
          icon={BarChart3}
          title="No scans yet"
          description="This QR code hasn't been scanned yet. Share it or print it, and scan activity will appear here."
          actionLabel="View QR code"
          actionHref={`/dashboard/${id}`}
          secondaryActionLabel="Back to dashboard"
          secondaryActionHref="/dashboard"
        />
      ) : (
        <>
          <SummaryCards
            summary={analytics.summary}
            trend={analytics.trend}
            days={days}
          />
          <ScansChart data={analytics.timeSeries} days={days} />
          <div className="grid lg:grid-cols-2 gap-4">
            <DeviceChart data={analytics.devices} />
            <CountryChart data={analytics.countries} />
          </div>
          <RecentScans scans={analytics.recent} showQrName={false} />
        </>
      )}
    </div>
  )
}