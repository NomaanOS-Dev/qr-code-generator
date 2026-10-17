import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe } from 'lucide-react'
import {
  countryFlag,
  countryName,
  type CountryBreakdown,
} from '@/lib/analytics'

interface CountryChartProps {
  data: CountryBreakdown[]
}

export function CountryChart({ data }: CountryChartProps) {
  const total = data.reduce((sum, c) => sum + c.scans, 0)
  const max = Math.max(...data.map((c) => c.scans), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Countries</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Where your scans come from
        </p>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="text-center py-12">
            <Globe className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No country data yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((entry) => {
              const pct = (entry.scans / total) * 100
              const barWidth = (entry.scans / max) * 100

              return (
                <div key={entry.country_code}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg leading-none">
                        {countryFlag(entry.country_code)}
                      </span>
                      <span className="truncate">
                        {countryName(entry.country_code)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 tabular-nums">
                      <span className="font-medium">
                        {entry.scans.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}