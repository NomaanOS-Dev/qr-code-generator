'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import type { ScanPoint } from '@/lib/analytics'

interface ScansChartProps {
  data: ScanPoint[]
  days: number
}

export function ScansChart({ data, days }: ScansChartProps) {
  const chartData = data.map((point) => ({
    date: point.bucket,
    scans: point.scans,
    label: format(parseISO(point.bucket), 'MMM d'),
  }))

  const total = data.reduce((sum, p) => sum + p.scans, 0)
  const average = data.length > 0 ? Math.round(total / data.length) : 0
  const peak =
    data.length > 0
      ? data.reduce(
          (max, p) => (p.scans > max.scans ? p : max),
          data[0]
        )
      : { bucket: '', scans: 0 }

  const tickInterval = days <= 7 ? 0 : days <= 30 ? 4 : days <= 90 ? 10 : 30

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-wrap gap-2">
        <div>
          <CardTitle className="text-lg">Scans over time</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Daily scan activity for the last {days} days
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Avg / day</p>
            <p className="font-semibold tabular-nums">{average}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Peak</p>
            <p className="font-semibold tabular-nums">{peak.scans}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="rgb(59, 130, 246)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="rgb(59, 130, 246)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={tickInterval}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                dy={5}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                width={40}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{
                  stroke: 'hsl(var(--primary))',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const item = payload[0].payload as {
                    label: string
                    scans: number
                  }
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold tabular-nums">
                        {item.scans} {item.scans === 1 ? 'scan' : 'scans'}
                      </p>
                    </div>
                  )
                }}
              />
              <Line
                type="monotone"
                dataKey="scans"
                stroke="rgb(59, 130, 246)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: 'rgb(59, 130, 246)' }}
                fill="url(#scansGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}