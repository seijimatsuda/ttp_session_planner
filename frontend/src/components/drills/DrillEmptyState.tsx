/**
 * DrillEmptyState component - contextual empty state for drill library
 *
 * Shows different messages based on whether filters are active:
 * - No filters: "No drills yet" with CTA to create first drill
 * - With filters: "No drills found" with suggestion to adjust filters
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'

interface DrillEmptyStateProps {
  /** Whether filters are currently active (search, category, etc.) */
  hasFilters: boolean
}

/**
 * Empty state component for drill library grid
 */
export function DrillEmptyState({ hasFilters }: DrillEmptyStateProps) {
  const navigate = useNavigate()

  const handleCreateDrill = () => {
    navigate('/drills/new')
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon area */}
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <svg
          className="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {hasFilters ? (
            // Search icon for "no matches" state
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          ) : (
            // Video icon for "no drills" state
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          )}
        </svg>
      </div>

      {/* Heading */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {hasFilters ? 'No drills found' : 'No drills yet'}
      </h3>

      {/* Description */}
      <p className="text-gray-600 max-w-sm mb-6">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'Get started by creating your first drill. Add videos, descriptions, and tags to build your library.'}
      </p>

      {/* CTA button - only show when no filters active */}
      {!hasFilters && (
        <Button onClick={handleCreateDrill}>
          Create your first drill
        </Button>
      )}
    </div>
  )
}
