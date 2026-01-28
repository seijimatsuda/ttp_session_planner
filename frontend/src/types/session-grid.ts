/**
 * Session grid types and utilities
 *
 * 4 rows x 3 columns grid structure for session planner.
 * Rows represent drill categories, columns are sequential slots.
 */

// Re-export database types for convenience
export type { GridCell, GridData } from '../lib/database.types'

/**
 * Row keys aligned with drill categories
 */
export const ROW_KEYS = ['activation', 'dribbling', 'passing', 'shooting'] as const

/**
 * Number of columns in grid (3 slots per category)
 */
export const COL_COUNT = 3

/**
 * Row key type derived from ROW_KEYS constant
 */
export type RowKey = typeof ROW_KEYS[number]

/**
 * Cell key type in format: "rowKey-colIndex"
 * Examples: "activation-0", "dribbling-2", "shooting-1"
 */
export type CellKey = `${RowKey}-${0 | 1 | 2}`

/**
 * Generate a cell key from row and column indices
 */
export function getCellKey(row: RowKey, col: number): CellKey {
  if (col < 0 || col >= COL_COUNT) {
    throw new Error(`Column index must be 0-${COL_COUNT - 1}, got ${col}`)
  }
  return `${row}-${col as 0 | 1 | 2}`
}

/**
 * Create an empty grid with all cells initialized to null
 */
export function createEmptyGridData(): import('../lib/database.types').GridData {
  const cells: Record<string, import('../lib/database.types').GridCell> = {}

  for (const row of ROW_KEYS) {
    for (let col = 0; col < COL_COUNT; col++) {
      const key = getCellKey(row, col)
      cells[key] = { drillId: null }
    }
  }

  return { cells }
}
