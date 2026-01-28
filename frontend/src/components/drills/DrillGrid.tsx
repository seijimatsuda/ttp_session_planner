/**
 * DrillGrid component - responsive grid layout for drill library
 *
 * Handles three states:
 * 1. Loading - shows skeleton cards
 * 2. Empty - shows contextual empty state
 * 3. Data - shows drill cards in responsive grid
 */

import type { Drill } from '@/lib/database.types'
import { Skeleton } from '@/components/ui/Skeleton'
import { DrillCard } from './DrillCard'
import { DrillEmptyState } from './DrillEmptyState'

interface DrillGridProps {
  drills: Drill[]
  isLoading: boolean
  hasActiveFilters: boolean
}

/**
 * Skeleton card matching DrillCard layout
 */
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

/**
 * Responsive grid for displaying drills with loading and empty states
 */
export function DrillGrid({
  drills,
  isLoading,
  hasActiveFilters,
}: DrillGridProps) {
  // Loading state - show 8 skeleton cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <DrillCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  // Empty state - no drills match filters
  if (drills.length === 0) {
    return <DrillEmptyState hasFilters={hasActiveFilters} />
  }

  // Data state - render drill cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {drills.map((drill) => (
        <DrillCard key={drill.id} drill={drill} />
      ))}
    </div>
  )
}
