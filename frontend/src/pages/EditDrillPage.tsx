import { useParams, useNavigate } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useDrill } from '@/hooks/useDrills'
import { DrillForm } from '@/components/drills/DrillForm'
import { AppShell } from '@/components/layout/AppShell'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'

/**
 * EditDrillPage - allows editing existing drills
 *
 * Features:
 * - Extracts drill ID from URL params (/drills/:id/edit)
 * - Fetches drill data using useDrill hook
 * - Shows loading skeleton while fetching
 * - Shows user-friendly 404 message when drill not found
 * - Renders DrillForm in edit mode with drill prop
 * - Navigates to detail page on successful update
 */
export function EditDrillPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: drill, isLoading, error } = useDrill(id)

  const handleSuccess = (drillId: string) => {
    navigate(`/drills/${drillId}`)
  }

  // Loading state - skeleton matching form layout
  if (isLoading) {
    return (
      <AppShell>
        <Container className="py-8">
          <div className="max-w-2xl mx-auto">
            <Skeleton height={36} width={200} className="mb-6" />

            {/* Form field skeletons */}
            <div className="space-y-6">
              <Skeleton height={44} />
              <Skeleton height={44} />
              <Skeleton height={120} />
              <Skeleton height={44} />
              <Skeleton height={44} />
              <Skeleton height={44} />
              <Skeleton height={44} />
              <Skeleton height={44} />
            </div>
          </div>
        </Container>
      </AppShell>
    )
  }

  // Error or not found state
  if (error || !drill) {
    return (
      <AppShell>
        <Container className="py-8">
          <div className="max-w-2xl mx-auto">
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
        </Container>
      </AppShell>
    )
  }

  // Success state - render form in edit mode
  return (
    <AppShell>
      <Container className="py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Drill</h1>
          <DrillForm drill={drill} onSuccess={handleSuccess} />
        </div>
      </Container>
    </AppShell>
  )
}
