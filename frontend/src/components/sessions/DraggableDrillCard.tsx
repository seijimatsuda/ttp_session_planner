import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { Drill } from '@/lib/database.types'

interface DraggableDrillCardProps {
  drill: Drill
  isSelected: boolean
  onClick: (drillId: string) => void
}

export function DraggableDrillCard({ drill, isSelected, onClick }: DraggableDrillCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: drill.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick(drill.id)}
      className={cn(
        'p-4 rounded-lg border bg-white shadow-sm transition-all touch-action-manipulation',
        'hover:shadow-md',
        // Dragging state
        isDragging && 'opacity-50 cursor-grabbing',
        !isDragging && 'cursor-grab',
        // Selected state
        isSelected && 'ring-2 ring-blue-500 bg-blue-50'
      )}
    >
      <h3 className="font-medium text-gray-900 text-sm mb-1">{drill.name}</h3>
      {drill.category && (
        <p className="text-xs text-gray-500 capitalize">{drill.category}</p>
      )}
      {drill.num_players && (
        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <span>{drill.num_players}</span>
        </div>
      )}
    </div>
  )
}
