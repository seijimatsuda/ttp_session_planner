/**
 * DrillCard component - displays individual drill in library grid
 *
 * Shows drill thumbnail (or placeholder), name, and category badge.
 * Entire card is clickable and links to drill detail page.
 */

import { Link } from 'react-router-dom'
import { getProxyMediaUrl } from '@/lib/media'
import type { Drill } from '@/lib/database.types'

interface DrillCardProps {
  drill: Drill
}

/**
 * Card component for displaying a drill in the library grid
 */
export function DrillCard({ drill }: DrillCardProps) {
  return (
    <Link to={`/drills/${drill.id}`}>
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Thumbnail area */}
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          {drill.video_file_path ? (
            <img
              src={getProxyMediaUrl('drills', drill.video_file_path)}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            // Placeholder icon when no video
            <svg
              className="w-12 h-12 text-gray-400"
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
          )}
        </div>

        {/* Content area */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{drill.name}</h3>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category badge */}
            {drill.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {drill.category}
              </span>
            )}

            {/* Number of players badge */}
            {drill.num_players && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                {drill.num_players} {drill.num_players === 1 ? 'player' : 'players'}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
