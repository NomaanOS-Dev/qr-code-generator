import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface UsageMeterProps {
  label: string
  current: number
  limit: number
  unit?: string
  className?: string
}

export function UsageMeter({
  label,
  current,
  limit,
  unit = '',
  className,
}: UsageMeterProps) {
  const pct = limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0
  const isNearLimit = pct >= 80
  const isAtLimit = pct >= 100

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            'tabular-nums font-medium',
            isAtLimit && 'text-destructive',
            isNearLimit && !isAtLimit && 'text-amber-600'
          )}
        >
          {current}
          {limit > 0 && ` / ${limit}`} {unit}
        </span>
      </div>
      {limit > 0 && (
        <Progress
          value={pct}
          className={cn(
            'h-1.5',
            isAtLimit && '[&>div]:bg-destructive',
            isNearLimit && !isAtLimit && '[&>div]:bg-amber-500'
          )}
        />
      )}
    </div>
  )
}