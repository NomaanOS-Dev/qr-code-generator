'use client'

import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, QrCode } from 'lucide-react'
import type { TopQrCode } from '@/lib/analytics'

interface TopCodesChartProps {
  codes: TopQrCode[]
}

const COLORS = [
  'rgb(59, 130, 246)', // blue-500
  'rgb(139, 92, 246)', // violet-500
  'rgb(236, 72, 153)', // pink-500
  'rgb(245, 158, 11)', // amber-500
  'rgb(16, 185, 129)', // emerald-500
]

export function TopCodesChart({ codes }: TopCodesChartProps) {
  // Shorten long names for the chart
  const chartData = codes.map((code) => ({
    ...code,
    shortName:
      code.name.length > 20 ? code.name.slice(0, 18) + '…' : code.name,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top performing QR codes</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Your 5 most scanned codes of all time
        </p>
      </CardHeader>
      <CardContent>
        {codes.length === 0 ? (
          <div className="text-center py-8">
            <QrCode className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No QR codes yet. Create one to see analytics.
            </p>
          </div>
        ) : (
          <>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                    width={130}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null
                      const item = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                          <p className="text-xs text-muted-foreground">
                            {item.name}
                          </p>
                          <p className="text-sm font-semibold tabular-nums">
                            {item.scans} scans
                          </p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="scans" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-1">
              {chartData.slice(0, 3).map((code, i) => (
                <Link
                  key={code.id}
                  href={`/dashboard/${code.id}/analytics`}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground tabular-nums w-4">
                      #{i + 1}
                    </span>
                    <span className="text-sm truncate">{code.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold tabular-nums">
                      {code.scans}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}