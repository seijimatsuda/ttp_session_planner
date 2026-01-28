/**
 * Session Planner Page
 *
 * Complete session planner with drag-and-drop grid for organizing drills into a 4x3 grid.
 * Supports both desktop drag-and-drop and iPad touch interactions, plus click-to-place alternative.
 */

import { useState, useMemo } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { useAuth } from '@/contexts/AuthContext'
import { useDrills } from '@/hooks/useDrills'
import { useSessionSensors } from '@/hooks/useSessionSensors'
import { useSessionGrid } from '@/hooks/useSessionGrid'
import { SessionGrid, DrillLibrarySidebar, DraggableDrillCard } from '@/components/sessions'
import { AppShell } from '@/components/layout/AppShell'
import { Container } from '@/components/layout/Container'
import type { CellKey } from '@/types/session-grid'

export function SessionPlannerPage() {
  const { user } = useAuth()
  const { data: drills = [], isLoading } = useDrills(user?.id)
  const sensors = useSessionSensors()

  const {
    gridData,
    selectedDrillId,
    placeDrill,
    removeDrill,
    selectDrill,
    handleCellClick,
  } = useSessionGrid()

  // Track active drag for DragOverlay
  const [activeDrillId, setActiveDrillId] = useState<string | null>(null)

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

  return (
    <AppShell>
      <Container as="main" className="py-6">
        <h1 className="text-2xl font-bold mb-6">Session Planner</h1>

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
                targetedCellKey={selectedDrillId ? 'any-empty' : null}
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
      </Container>
    </AppShell>
  )
}
