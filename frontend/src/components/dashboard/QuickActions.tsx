/**
 * QuickActions component - quick action cards for dashboard
 *
 * Displays two prominent cards for primary user actions:
 * - Add Drill: Navigate to drill creation page
 * - New Session: Navigate to session planner page
 *
 * Cards maintain 44px minimum touch targets for iOS/iPad accessibility.
 */

import { Link } from 'react-router-dom'

/**
 * Quick action cards for dashboard primary actions
 */
export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Add Drill card */}
      <Link to="/drills/new">
        <div className="min-h-11 p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg text-blue-600">
            {/* Video camera icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Add Drill</h3>
            <p className="text-sm text-gray-600 mt-1">
              Create a new training drill with video
            </p>
          </div>
        </div>
      </Link>

      {/* New Session card */}
      <Link to="/sessions/new">
        <div className="min-h-11 p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-green-300 transition-all flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-green-50 rounded-lg text-green-600">
            {/* Grid/calendar icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">New Session</h3>
            <p className="text-sm text-gray-600 mt-1">
              Plan a training session with drills
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}
