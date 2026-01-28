/**
 * RecentDrills component - displays recent drills on dashboard
 *
 * Shows up to 4 most recent drills with three states:
 * - Loading: Skeleton cards matching DrillCard dimensions
 * - Empty: Message with link to create first drill
 * - Data: Grid of DrillCard components
 */

import { Link } from 'react-router-dom'
import { useDrills } from '@/hooks/useDrills'
import { DrillCard } from '@/components/drills/DrillCard'
import { Skeleton } from '@/components/ui'

const RECENT_ITEMS_LIMIT = 4

interface RecentDrillsProps {
  userId: string
}

/**
 * Recent drills section for dashboard
 */
export function RecentDrills({ userId }: RecentDrillsProps) {
  const { data: drills, isLoading } = useDrills(userId)

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: RECENT_ITEMS_LIMIT }).map((_, i) => (
          <DrillCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Empty state
  if (!drills || drills.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-3">No drills yet</p>
        <Link
          to="/drills/new"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Create your first drill
        </Link>
      </div>
    )
  }

  // Data state - show first 4 drills
  const recentDrills = drills.slice(0, RECENT_ITEMS_LIMIT)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {recentDrills.map((drill) => (
        <DrillCard key={drill.id} drill={drill} />
      ))}
    </div>
  )
}

/**
 * Skeleton card matching DrillCard dimensions
 */
function DrillCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Aspect-video thumbnail area */}
      <div className="aspect-video">
        <Skeleton height="100%" />
      </div>
      {/* Content area matching DrillCard padding */}
      <div className="p-4">
        <Skeleton width="60%" height={20} className="mb-2" />
        <Skeleton width={80} height={24} />
      </div>
    </div>
  )
}
