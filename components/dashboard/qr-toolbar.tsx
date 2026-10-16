'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LayoutGrid, List, X } from 'lucide-react'
import { SearchInput } from './search-input'
import { cn } from '@/lib/utils'

export type QrStatus = 'all' | 'active' | 'inactive'
export type QrSort = 'recent' | 'oldest' | 'name' | 'scans'
export type QrView = 'grid' | 'list'

interface QrToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  status: QrStatus
  onStatusChange: (v: QrStatus) => void
  sort: QrSort
  onSortChange: (v: QrSort) => void
  view: QrView
  onViewChange: (v: QrView) => void
  totalCount: number
  filteredCount: number
  onClearFilters: () => void
  hasActiveFilters: boolean
}

const STATUS_TABS: { value: QrStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const SORT_OPTIONS: { value: QrSort; label: string }[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'scans', label: 'Most scans' },
]

export function QrToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  totalCount,
  filteredCount,
  onClearFilters,
  hasActiveFilters,
}: QrToolbarProps) {
  return (
    <div className="space-y-4">
      {/* Row 1: Search + Sort + View toggle */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search by name, URL, or slug..."
          className="flex-1 md:max-w-md"
        />

        <div className="flex items-center gap-2 ml-auto">
          <Select value={sort} onValueChange={(v) => onSortChange(v as QrSort)}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center rounded-md border p-0.5 bg-background">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewChange('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewChange('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Row 2: Status tabs + result count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {STATUS_TABS.map((tab) => {
            const isActive = status === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {filteredCount === totalCount
              ? `${totalCount} ${totalCount === 1 ? 'code' : 'codes'}`
              : `${filteredCount} of ${totalCount}`}
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-7 px-2"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}