import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useSessions, useDeleteSession } from '@/hooks/useSessions'
import { ConfirmDialog, Button, Skeleton } from '@/components/ui'
import { SessionListItem } from './SessionListItem'
import type { Session } from '@/lib/database.types'

/**
 * SessionList displays all user sessions with loading, empty, and populated states.
 *
 * Features:
 * - Fetches sessions for authenticated user
 * - Loading state with skeleton cards
 * - Empty state with call-to-action
 * - Responsive grid layout for session cards
 * - Delete confirmation dialog
 * - Optimistic UI updates via React Query
 */
export function SessionList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: sessions, isLoading } = useSessions(user?.id)
  const deleteMutation = useDeleteSession()
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null)

  const handleLoad = (session: Session) => {
    navigate(`/sessions/${session.id}/edit`)
  }

  const handleDelete = (session: Session) => {
    setDeleteTarget(session)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      toast.success('Session deleted')
    } catch (error) {
      toast.error('Failed to delete session')
      // Keep dialog open on error so user can retry
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
            <Skeleton width={180} height={24} className="mb-2" />
            <Skeleton width={120} height={16} className="mb-4" />
            <div className="flex gap-2">
              <Skeleton width={100} height={44} />
              <Skeleton width={100} height={44} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved sessions</h2>
        <p className="text-gray-600 mb-6">
          Create your first session by building a grid in the session planner.
        </p>
        <Button onClick={() => navigate('/sessions/new')}>New Session</Button>
      </div>
    )
  }

  // Populated state
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <SessionListItem
            key={session.id}
            session={session}
            onLoad={() => handleLoad(session)}
            onDelete={() => handleDelete(session)}
          />
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This will permanently delete this session. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
