import type { Session } from '@/lib/database.types'
import { Button } from '@/components/ui'

interface SessionListItemProps {
  session: Session
  onLoad: () => void
  onDelete: () => void
}

/**
 * SessionListItem displays a single session card with Load and Delete actions.
 *
 * Features:
 * - Shows session name and creation date
 * - Load button for navigating to the session
 * - Delete button for triggering delete confirmation
 * - Card styling with hover effects
 * - Mobile-friendly layout with 44px touch targets
 */
export function SessionListItem({ session, onLoad, onDelete }: SessionListItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-150 bg-white">
      {/* Session info */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-900 mb-1">{session.name}</h3>
        <p className="text-sm text-gray-500">
          Created {new Date(session.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onLoad} variant="primary" className="flex-1 min-w-[100px]">
          Load
        </Button>
        <Button
          onClick={onDelete}
          variant="ghost"
          className="flex-1 min-w-[100px] text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
