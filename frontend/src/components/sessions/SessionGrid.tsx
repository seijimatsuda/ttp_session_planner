import { GridCell } from './GridCell'
import { ROW_KEYS, COL_COUNT, getCellKey } from '@/types/session-grid'
import type { GridData, Drill } from '@/lib/database.types'
import type { CellKey } from '@/types/session-grid'

interface SessionGridProps {
  gridData: GridData
  drills: Map<string, Drill>
  onCellClick: (cellKey: CellKey) => void
  onRemoveDrill: (cellKey: CellKey) => void
  targetedCellKey: CellKey | null
}

export function SessionGrid({
  gridData,
  drills,
  onCellClick,
  onRemoveDrill,
  targetedCellKey,
}: SessionGridProps) {
  return (
    <div className="grid grid-cols-[auto_repeat(3,1fr)] gap-3 w-full">
      {ROW_KEYS.map((row) => (
        <div key={row} className="contents">
          {/* Row label */}
          <div className="flex items-center justify-end pr-4 text-sm font-medium text-gray-700 capitalize">
            {row}
          </div>

          {/* Grid cells for this row */}
          {Array.from({ length: COL_COUNT }, (_, col) => {
            const cellKey = getCellKey(row, col)
            const cell = gridData.cells[cellKey]
            const drill = cell?.drillId ? drills.get(cell.drillId) ?? null : null

            return (
              <GridCell
                key={cellKey}
                cellKey={cellKey}
                drill={drill}
                onRemove={onRemoveDrill}
                onClick={onCellClick}
                isTargeted={targetedCellKey === cellKey}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
