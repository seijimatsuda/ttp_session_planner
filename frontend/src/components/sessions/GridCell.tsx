import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { Drill } from '@/lib/database.types'
import type { CellKey } from '@/types/session-grid'

interface GridCellProps {
  cellKey: CellKey
  drill: Drill | null
  onRemove: (cellKey: CellKey) => void
  onClick: (cellKey: CellKey) => void
  isTargeted: boolean
}

export function GridCell({ cellKey, drill, onRemove, onClick, isTargeted }: GridCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: cellKey,
  })

  return (
    <div
      ref={setNodeRef}
      onClick={() => onClick(cellKey)}
      className={cn(
        'min-h-24 rounded-lg border-2 p-3 transition-colors cursor-pointer',
        // Empty state
        !drill && 'border-dashed border-gray-300 bg-white hover:border-gray-400',
        // Has drill
        drill && 'border-solid border-gray-300 bg-white',
        // Dragging over
        isOver && 'border-blue-500 bg-blue-50',
        // Targeted for click-to-place
        isTargeted && 'ring-2 ring-blue-500'
      )}
    >
      {drill ? (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{drill.name}</p>
            {drill.category && (
              <p className="text-xs text-gray-500 mt-1 capitalize">{drill.category}</p>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(cellKey)
            }}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Remove drill"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Drop drill here
        </div>
      )}
    </div>
  )
}
