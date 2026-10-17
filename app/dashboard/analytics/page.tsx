import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDashboardAnalytics } from '@/lib/analytics-dashboard'
import { getPlanContext } from '@/lib/plan-guard'
import { getCurrentWorkspace } from '@/lib/workspaces'
import { SummaryCards } from '@/components/analytics/summary-cards'
import { ScansChart } from '@/components/analytics/scans-chart'
import { TopCodesChart } from '@/components/analytics/top-codes-chart'
import { DeviceChart } from '@/components/analytics/device-chart'
import { CountryChart } from '@/components/analytics/country-chart'
import { RecentScans } from '@/components/analytics/recent-scans'
import { DateRangeSelector } from '@/components/analytics/date-range-selector'
import { ExportButton } from '@/components/analytics/export-button'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { BarChart3, Plus } from 'lucide-react'

// ✅ REQUIRED for Next.js 16 + Cache Components when using `await connection()`
export const instant = false

export const metadata = {
  title: 'Analytics — ScanFlow',
}

interface PageProps {
  searchParams: Promise<{ days?: string }>
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  await connection()

  const { days: daysParam } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const workspace = await getCurrentWorkspace()
  if (!workspace) redirect('/dashboard')

  const ctx = await getPlanContext()
  if (!ctx) redirect('/login')

  const days = Math.min(
    Math.max(parseInt(daysParam ?? '30', 10) || 30, 1),
    365
  )
  const canExport = Boolean(ctx.limits.csvExport)

  const analytics = await getDashboardAnalytics(user.id, workspace.id, days)
  const hasAnyData = analytics.summary.total > 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track how your QR codes perform in {workspace.name}.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangeSelector />
          <ExportButton qrCodeId={null} days={days} canExport={canExport} />
        </div>
      </div>

      {!hasAnyData ? (
        <EmptyState
          icon={BarChart3}
          title="No scan data yet"
          description="Once people start scanning your QR codes, you'll see detailed analytics here."
          actionLabel="Create a QR code"
          actionHref="/dashboard/create"
          secondaryActionLabel="View dashboard"
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
            <TopCodesChart codes={analytics.topCodes} />
            <DeviceChart data={analytics.devices} />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <CountryChart data={analytics.countries} />
            <RecentScans scans={analytics.recent} showQrName />
          </div>
        </>
      )}
    </div>
  )
}