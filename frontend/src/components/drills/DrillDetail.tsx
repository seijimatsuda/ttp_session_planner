/**
 * DrillDetail component - displays full drill information on detail page
 *
 * Shows drill video (with iOS-compatible playsInline), name, metadata fields,
 * and provides foundation for edit/delete actions in future plans.
 */

import { getProxyMediaUrl } from '@/lib/media'
import type { Drill } from '@/lib/database.types'

interface DrillDetailProps {
  drill: Drill
}

/**
 * Full detail view for a single drill
 */
export function DrillDetail({ drill }: DrillDetailProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Drill name heading */}
      <h1 className="text-3xl font-bold text-gray-900">{drill.name}</h1>

      {/* Video player */}
      {drill.video_file_path && (
        <div className="bg-black rounded-lg overflow-hidden">
          <video
            src={getProxyMediaUrl('drills', drill.video_file_path)}
            controls
            playsInline
            preload="metadata"
            className="w-full"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Metadata section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        {/* Category */}
        {drill.category && (
          <div>
            <span className="text-sm font-medium text-gray-500">Category</span>
            <p className="mt-1 text-gray-900 capitalize">{drill.category}</p>
          </div>
        )}

        {/* Number of players */}
        {drill.num_players && (
          <div>
            <span className="text-sm font-medium text-gray-500">Number of Players</span>
            <p className="mt-1 text-gray-900">
              {drill.num_players} {drill.num_players === 1 ? 'player' : 'players'}
            </p>
          </div>
        )}

        {/* Equipment */}
        {drill.equipment && drill.equipment.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-500">Equipment</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {drill.equipment.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {drill.tags && drill.tags.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-500">Tags</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {drill.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reference URL */}
        {drill.video_url && (
          <div>
            <span className="text-sm font-medium text-gray-500">Reference URL</span>
            <a
              href={drill.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-blue-600 hover:text-blue-800 hover:underline break-all"
            >
              {drill.video_url}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
