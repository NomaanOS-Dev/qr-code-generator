'use client'

import { useQueryState, parseAsInteger } from 'nuqs'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const RANGES = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 365, label: '1 year' },
] as const

export function DateRangeSelector() {
  const [days, setDays] = useQueryState(
    'days',
    parseAsInteger.withDefault(30).withOptions({ shallow: false })
  )

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
      <div className="pl-2 pr-1 text-muted-foreground">
        <Calendar className="h-4 w-4" />
      </div>
      {RANGES.map((range) => (
        <Button
          key={range.value}
          variant={days === range.value ? 'secondary' : 'ghost'}
          size="sm"
          className={cn('h-7 px-3 text-xs')}
          onClick={() => setDays(range.value)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  )
}