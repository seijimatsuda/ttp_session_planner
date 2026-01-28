/**
 * VirtualDrillGrid - virtualized grid for 100+ drills
 *
 * Uses TanStack Virtual for performance with large drill collections.
 * Renders only visible rows, dramatically reducing DOM nodes.
 */

import { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Drill } from '@/lib/database.types'
import { DrillCard } from './DrillCard'
import { DrillEmptyState } from './DrillEmptyState'
import { Skeleton } from '@/components/ui/Skeleton'

interface VirtualDrillGridProps {
  drills: Drill[]
  isLoading: boolean
  hasActiveFilters: boolean
}

// Number of columns based on breakpoints (mirrors DrillGrid)
// We'll use a fixed 4 columns for virtualization simplicity
// Responsive behavior handled via CSS on parent container
const COLUMNS = 4
const ROW_HEIGHT = 280  // Approximate height of DrillCard + gap
const OVERSCAN = 2      // Render 2 extra rows above/below viewport

function DrillCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <Skeleton className="aspect-video" />
      <div className="p-4">
        <Skeleton width="60%" height={20} className="mb-2" />
        <Skeleton width={80} height={24} />
      </div>
    </div>
  )
}

export function VirtualDrillGrid({
  drills,
  isLoading,
  hasActiveFilters,
}: VirtualDrillGridProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Group drills into rows for grid virtualization
  const rows = useMemo(() => {
    const result: Drill[][] = []
    for (let i = 0; i < drills.length; i += COLUMNS) {
      result.push(drills.slice(i, i + COLUMNS))
    }
    return result
  }, [drills])

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <DrillCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  // Empty state
  if (drills.length === 0) {
    return <DrillEmptyState hasFilters={hasActiveFilters} />
  }

  // For small lists (< 50), use regular grid (virtualization overhead not worth it)
  if (drills.length < 50) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {drills.map((drill) => (
          <DrillCard key={drill.id} drill={drill} />
        ))}
      </div>
    )
  }

  // Virtualized grid for large lists
  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-300px)] overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {rows[virtualRow.index].map((drill) => (
                <DrillCard key={drill.id} drill={drill} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
