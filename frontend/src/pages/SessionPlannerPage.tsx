/**
 * Session Planner Page
 *
 * Complete session planner with drag-and-drop grid for organizing drills into a 4x3 grid.
 * Supports both desktop drag-and-drop and iPad touch interactions, plus click-to-place alternative.
 */

import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { useAuth } from '@/contexts/AuthContext'
import { useDrills } from '@/hooks/useDrills'
import { useSessionSensors } from '@/hooks/useSessionSensors'
import { useSessionGrid } from '@/hooks/useSessionGrid'
import { useSession } from '@/hooks/useSessions'
import { SessionGrid, DrillLibrarySidebar, DraggableDrillCard, SaveSessionDialog } from '@/components/sessions'
import { AppShell } from '@/components/layout/AppShell'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import type { CellKey } from '@/types/session-grid'
import type { GridData } from '@/lib/database.types'

export function SessionPlannerPage() {
  const { user } = useAuth()
  const { id: sessionId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Fetch session data when editing
  const { data: existingSession, isLoading: isLoadingSession } = useSession(sessionId)

  const { data: drills = [], isLoading } = useDrills(user?.id)
  const sensors = useSessionSensors()

  const {
    gridData,
    setGridData,
    selectedDrillId,
    placeDrill,
    removeDrill,
    selectDrill,
    handleCellClick,
  } = useSessionGrid({
    initialGridData: existingSession?.grid_data as unknown as GridData | undefined,
  })

  // Update grid when session loads (for when grid was created before data arrived)
  useEffect(() => {
    if (existingSession?.grid_data) {
      setGridData(existingSession.grid_data as unknown as GridData)
    }
  }, [existingSession, setGridData])

  // Track active drag for DragOverlay
  const [activeDrillId, setActiveDrillId] = useState<string | null>(null)

  // Save dialog state
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)

  // Handle successful save
  const handleSaveSuccess = (savedSessionId: string) => {
    // If this was a new session, navigate to the edit URL so subsequent saves update instead of create
    if (!sessionId) {
      navigate(`/sessions/${savedSessionId}/edit`, { replace: true })
    }
  }

  // Determine edit mode and page title
  const isEditMode = !!sessionId
  const pageTitle = isEditMode
    ? existingSession?.name ? `Edit: ${existingSession.name}` : 'Edit Session'
    : 'New Session'

  // Create drill lookup map for efficient access
  const drillMap = useMemo(
    () => new Map(drills.map((d) => [d.id, d])),
    [drills]
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveDrillId(event.active.id as string)
    // Clear click-to-place selection when starting drag
    selectDrill(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveDrillId(null)

    if (over) {
      // Place drill in cell
      placeDrill(over.id as CellKey, active.id as string)
    }
  }

  function handleDrillClick(drillId: string) {
    // Toggle selection for click-to-place
    selectDrill(selectedDrillId === drillId ? null : drillId)
  }

  // Show loading state when fetching session data
  if (isLoadingSession && sessionId) {
    return (
      <AppShell>
        <Container as="main" className="py-6">
          <div className="text-gray-500">Loading session...</div>
        </Container>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <Container as="main" className="py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
          <Button onClick={() => setIsSaveDialogOpen(true)}>
            {isEditMode ? 'Update Session' : 'Save Session'}
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6">
            {/* Grid area */}
            <div className="flex-1">
              <SessionGrid
                gridData={gridData}
                drills={drillMap}
                onCellClick={handleCellClick}
                onRemoveDrill={removeDrill}
                targetedCellKey={null}
              />
            </div>

            {/* Sidebar */}
            <DrillLibrarySidebar
              drills={drills}
              selectedDrillId={selectedDrillId}
              onDrillClick={handleDrillClick}
              isLoading={isLoading}
            />
          </div>

          {/* Drag overlay for smooth visuals */}
          <DragOverlay>
            {activeDrillId ? (
              <DraggableDrillCard
                drill={drillMap.get(activeDrillId)!}
                isSelected={false}
                onClick={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Instruction text */}
        <p className="mt-4 text-sm text-gray-500">
          Drag drills from the library into grid cells, or click a drill then click a cell to place it.
        </p>

        {/* Save session dialog */}
        <SaveSessionDialog
          isOpen={isSaveDialogOpen}
          onClose={() => setIsSaveDialogOpen(false)}
          gridData={gridData}
          existingSession={existingSession}
          onSuccess={handleSaveSuccess}
        />
      </Container>
    </AppShell>
  )
}
