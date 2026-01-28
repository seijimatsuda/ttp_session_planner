/**
 * Session grid state management hook
 *
 * Manages local grid state with place/remove/select operations.
 * Persistence to Supabase will be added in Phase 11 (Save & Load Sessions).
 */

import { useState } from 'react'
import type { GridData } from '../lib/database.types'
import type { CellKey } from '../types/session-grid'
import { createEmptyGridData } from '../types/session-grid'

interface UseSessionGridOptions {
  initialGridData?: GridData
}

export function useSessionGrid(options: UseSessionGridOptions = {}) {
  const [gridData, setGridData] = useState<GridData>(
    options.initialGridData ?? createEmptyGridData()
  )
  const [selectedDrillId, setSelectedDrillId] = useState<string | null>(null)

  /**
   * Place a drill in a specific cell
   */
  const placeDrill = (cellKey: CellKey, drillId: string) => {
    setGridData((prev) => ({
      ...prev,
      cells: {
        ...prev.cells,
        [cellKey]: { drillId },
      },
    }))
  }

  /**
   * Remove a drill from a specific cell
   */
  const removeDrill = (cellKey: CellKey) => {
    setGridData((prev) => ({
      ...prev,
      cells: {
        ...prev.cells,
        [cellKey]: { drillId: null },
      },
    }))
  }

  /**
   * Select a drill for click-to-place mode
   */
  const selectDrill = (drillId: string | null) => {
    setSelectedDrillId(drillId)
  }

  /**
   * Handle cell click - places selected drill if one is selected
   */
  const handleCellClick = (cellKey: CellKey) => {
    if (selectedDrillId) {
      placeDrill(cellKey, selectedDrillId)
      setSelectedDrillId(null) // Clear selection after placement
    }
  }

  return {
    gridData,
    setGridData,
    selectedDrillId,
    placeDrill,
    removeDrill,
    selectDrill,
    handleCellClick,
  }
}
