import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ScanLine,
  Calendar,
  CalendarDays,
  BarChart3,
} from 'lucide-react'
import type { ScanSummary, TrendData } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  summary: ScanSummary
  trend: TrendData
  days: number
}

export function SummaryCards({ summary, trend, days }: SummaryCardsProps) {
  const periodLabel =
    days === 7
      ? 'last 7 days'
      : days === 30
        ? 'last 30 days'
        : days === 90
          ? 'last 90 days'
          : 'last year'

  const trendLabel = `vs previous ${periodLabel.replace('last ', '')}`

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total (all-time) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total scans
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">
            {summary.total.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </CardContent>
      </Card>

      {/* Period total with trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Last {days}d
          </CardTitle>
          <TrendIcon direction={trend.direction} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">
            {trend.current.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendBadge trend={trend} />
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          </div>
        </CardContent>
      </Card>

      {/* Today */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Today
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">
            {summary.today.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Since midnight UTC
          </p>
        </CardContent>
      </Card>

      {/* This month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            This month
          </CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">
            {summary.month.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.week.toLocaleString()} this week
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TrendIcon({ direction }: { direction: TrendData['direction'] }) {
  if (direction === 'up') {
    return <TrendingUp className="h-4 w-4 text-emerald-500" />
  }
  if (direction === 'down') {
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

function TrendBadge({ trend }: { trend: TrendData }) {
  const { direction, deltaPercent } = trend

  return (
    <Badge
      variant="secondary"
      className={cn(
        'text-[10px] font-medium px-1.5 py-0',
        direction === 'up' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        direction === 'down' && 'bg-red-500/10 text-red-700 dark:text-red-400',
        direction === 'flat' && 'text-muted-foreground'
      )}
    >
      {direction === 'up' && '▲'}
      {direction === 'down' && '▼'}
      {direction === 'flat' && '—'}{' '}
      {direction !== 'flat' && `${Math.abs(deltaPercent)}%`}
    </Badge>
  )
}