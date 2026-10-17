'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Monitor, Tablet, HelpCircle } from 'lucide-react'
import { deviceLabel, type DeviceBreakdown } from '@/lib/analytics'

interface DeviceChartProps {
  data: DeviceBreakdown[]
}

const DEVICE_COLORS: Record<string, string> = {
  mobile: 'rgb(59, 130, 246)',
  desktop: 'rgb(139, 92, 246)',
  tablet: 'rgb(245, 158, 11)',
  smarttv: 'rgb(236, 72, 153)',
  console: 'rgb(16, 185, 129)',
  wearable: 'rgb(168, 85, 247)',
  unknown: 'rgb(148, 163, 184)',
}

function DeviceIcon({ type }: { type: string }) {
  const cls = 'h-3.5 w-3.5'
  if (type === 'mobile') return <Smartphone className={cls} />
  if (type === 'desktop') return <Monitor className={cls} />
  if (type === 'tablet') return <Tablet className={cls} />
  return <HelpCircle className={cls} />
}

export function DeviceChart({ data }: DeviceChartProps) {
  const total = data.reduce((sum, d) => sum + d.scans, 0)
  const chartData = data.map((d) => ({
    name: deviceLabel(d.device_type),
    value: d.scans,
    type: d.device_type,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Device breakdown</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          What devices scanned your QR codes
        </p>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No scan data yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          DEVICE_COLORS[entry.type] ?? DEVICE_COLORS.unknown
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0)
                        return null
                      const item = payload[0].payload as {
                        name: string
                        value: number
                      }
                      const pct = ((item.value / total) * 100).toFixed(1)
                      return (
                        <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                          <p className="text-xs text-muted-foreground">
                            {item.name}
                          </p>
                          <p className="text-sm font-semibold tabular-nums">
                            {item.value.toLocaleString()} ({pct}%)
                          </p>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {chartData.map((entry) => {
                const pct = ((entry.value / total) * 100).toFixed(1)
                return (
                  <div
                    key={entry.type}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            DEVICE_COLORS[entry.type] ?? DEVICE_COLORS.unknown,
                        }}
                      />
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <DeviceIcon type={entry.type} />
                        <span className="truncate">{entry.name}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-medium">
                        {entry.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}