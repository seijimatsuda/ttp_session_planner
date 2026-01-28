import { useParams, useNavigate } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useDrill } from '@/hooks/useDrills'
import { DrillDetail } from '@/components/drills'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'

/**
 * DrillDetailPage - displays full drill details
 *
 * Features:
 * - Extracts drill ID from URL params (/drills/:id)
 * - Fetches drill data using useDrill hook
 * - Shows loading skeleton while fetching
 * - Shows user-friendly 404 message when drill not found
 * - Renders DrillDetail component on success
 */
export function DrillDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: drill, isLoading, error } = useDrill(id)

  // Loading state
  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Title skeleton */}
          <Skeleton height={40} width={300} />

          {/* Video skeleton */}
          <Skeleton height={400} className="rounded-lg" />

          {/* Metadata skeletons */}
          <div className="space-y-4">
            <Skeleton height={20} width={150} />
            <Skeleton height={20} width={200} />
            <Skeleton height={20} width={180} />
            <Skeleton height={20} width={220} />
            <Skeleton height={20} width={160} />
          </div>
        </div>
      </AppShell>
    )
  }

  // Error or not found state
  if (error || !drill) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Drill Not Found</h1>
            <p className="text-gray-600 mb-6">
              The drill you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/drills')}>
              Back to Drill Library
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  // Success state
  return (
    <AppShell>
      <DrillDetail drill={drill} />
    </AppShell>
  )
}
