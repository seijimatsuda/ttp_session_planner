import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { DraggableDrillCard } from './DraggableDrillCard'
import type { Drill } from '@/lib/database.types'

interface DrillLibrarySidebarProps {
  drills: Drill[]
  selectedDrillId: string | null
  onDrillClick: (drillId: string) => void
  isLoading: boolean
}

export function DrillLibrarySidebar({
  drills,
  selectedDrillId,
  onDrillClick,
  isLoading,
}: DrillLibrarySidebarProps) {
  return (
    <div className="w-80 flex flex-col h-full border-r border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Drill Library</h2>
        {!isLoading && <p className="text-sm text-gray-500 mt-1">{drills.length} drills</p>}
      </div>

      {/* Scrollable drill list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {isLoading ? (
            // Loading state
            <>
              <Skeleton height={80} />
              <Skeleton height={80} />
              <Skeleton height={80} />
              <Skeleton height={80} />
            </>
          ) : drills.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600 font-medium mb-2">No drills yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Create your first drill to get started
              </p>
              <Link
                to="/drills/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Drill
              </Link>
            </div>
          ) : (
            // Drill list
            drills.map((drill) => (
              <DraggableDrillCard
                key={drill.id}
                drill={drill}
                isSelected={drill.id === selectedDrillId}
                onClick={onDrillClick}
              />
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      {!isLoading && drills.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-600 text-center">
            Drag a drill to the grid, or click to select then click a cell
          </p>
        </div>
      )}
    </div>
  )
}
