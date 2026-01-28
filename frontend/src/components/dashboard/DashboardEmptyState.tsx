/**
 * DashboardEmptyState component - welcome state for new users
 *
 * Displays a friendly welcome message with CTAs for users who have
 * no drills or sessions yet. Follows the DrillEmptyState pattern.
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'

/**
 * Empty state component for dashboard when user has no content
 */
export function DashboardEmptyState() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon area */}
      <div className="mb-4 rounded-full bg-blue-50 p-4">
        {/* Clipboard/planning icon */}
        <svg
          className="w-16 h-16 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      </div>

      {/* Heading */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Welcome to Session Planner!
      </h3>

      {/* Description */}
      <p className="text-gray-600 max-w-sm mb-6">
        Get started by creating your first drill or planning a training session.
        Build your library of drills and organize them into sessions.
      </p>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <Button onClick={() => navigate('/drills/new')}>
          Create a drill
        </Button>
        <Button variant="secondary" onClick={() => navigate('/sessions/new')}>
          Plan a session
        </Button>
      </div>
    </div>
  )
}
