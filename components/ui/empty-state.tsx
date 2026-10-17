import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  secondaryActionLabel?: string
  secondaryActionHref?: string
  className?: string
  variant?: 'default' | 'compact'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  className,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg text-center',
        variant === 'compact' ? 'p-8' : 'p-12',
        className
      )}
    >
      <div
        className={cn(
          'rounded-lg bg-muted flex items-center justify-center mx-auto mb-4',
          variant === 'compact' ? 'h-10 w-10' : 'h-12 w-12'
        )}
      >
        <Icon
          className={cn(
            'text-muted-foreground',
            variant === 'compact' ? 'h-5 w-5' : 'h-6 w-6'
          )}
        />
      </div>

      <h3
        className={cn(
          'font-semibold mb-1',
          variant === 'compact' ? 'text-base' : 'text-lg'
        )}
      >
        {title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {actionHref ? (
            <Button asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : actionLabel && onAction ? (
            <Button onClick={onAction}>{actionLabel}</Button>
          ) : null}

          {secondaryActionHref && secondaryActionLabel && (
            <Button variant="outline" asChild>
              <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}