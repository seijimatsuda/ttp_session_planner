/**
 * DrillLibraryPage - main drill library with search and filtering
 *
 * Features:
 * - Search input with 300ms debounce
 * - Category filter buttons (instant)
 * - Responsive grid (1-4 columns)
 * - Loading skeletons
 * - Contextual empty states
 */

import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDrills } from '@/hooks/useDrills'
import { useDebounce } from '@/hooks/useDebounce'
import type { DrillCategory } from '@/lib/database.types'
import { AppShell } from '@/components/layout/AppShell'
import { Container } from '@/components/layout/Container'
import { DrillFilters, DrillGrid } from '@/components/drills'

/**
 * Main drill library page
 */
export function DrillLibraryPage() {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<DrillCategory | "all">("all")

  // Data fetching
  const { user } = useAuth()
  const { data: drills, isLoading } = useDrills(user?.id)

  // Debounced search for performance
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Client-side filtering using useMemo for performance
  const filteredDrills = useMemo(() => {
    if (!drills) return []

    return drills.filter(drill => {
      const matchesCategory = categoryFilter === "all" || drill.category === categoryFilter
      const matchesSearch = drill.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [drills, categoryFilter, debouncedSearch])

  // Check if filters are active for empty state
  const hasActiveFilters = searchTerm !== "" || categoryFilter !== "all"

  return (
    <AppShell>
      <Container>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Drill Library</h1>

        <DrillFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />

        <DrillGrid
          drills={filteredDrills}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
        />
      </Container>
    </AppShell>
  )
}
