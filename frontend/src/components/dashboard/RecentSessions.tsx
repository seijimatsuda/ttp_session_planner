/**
 * RecentSessions component - displays recent sessions on dashboard
 *
 * Shows up to 4 most recent sessions with three states:
 * - Loading: Skeleton cards
 * - Empty: Message with link to create first session
 * - Data: Grid of session cards showing name and date
 */

import { Link } from 'react-router-dom'
import { useSessions } from '@/hooks/useSessions'
import { Skeleton } from '@/components/ui'
import type { Session } from '@/lib/database.types'

const RECENT_ITEMS_LIMIT = 4

interface RecentSessionsProps {
  userId: string
}

/**
 * Recent sessions section for dashboard
 */
export function RecentSessions({ userId }: RecentSessionsProps) {
  const { data: sessions, isLoading } = useSessions(userId)

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: RECENT_ITEMS_LIMIT }).map((_, i) => (
          <SessionCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Empty state
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-3">No sessions yet</p>
        <Link
          to="/sessions/new"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Plan your first session
        </Link>
      </div>
    )
  }

  // Data state - show first 4 sessions
  const recentSessions = sessions.slice(0, RECENT_ITEMS_LIMIT)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {recentSessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  )
}

/**
 * Session card showing name and creation date
 */
function SessionCard({ session }: { session: Session }) {
  // Format date as "Jan 15, 2026"
  const formattedDate = new Date(session.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link to={`/sessions/${session.id}`}>
      <article className="min-h-11 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-900 mb-2 truncate">
          {session.name}
        </h3>
        <p className="text-sm text-gray-500">
          {formattedDate}
        </p>
      </article>
    </Link>
  )
}

/**
 * Skeleton card for loading state
 */
function SessionCardSkeleton() {
  return (
    <div className="min-h-11 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <Skeleton width="70%" height={20} className="mb-2" />
      <Skeleton width={100} height={16} />
    </div>
  )
}
