/**
 * DrillFilters component - search and category filtering controls for drill library
 *
 * Provides search input with debouncing and category filter buttons.
 * Used in DrillLibraryPage to control which drills are displayed.
 */

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DRILL_CATEGORIES } from '@/components/drills/DrillForm.schema'
import type { DrillCategory } from '@/lib/database.types'

interface DrillFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  categoryFilter: DrillCategory | "all"
  onCategoryChange: (category: DrillCategory | "all") => void
}

/**
 * Filter controls for drill library
 */
export function DrillFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
}: DrillFiltersProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Search input */}
      <Input
        label="Search drills"
        type="search"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={categoryFilter === "all" ? "primary" : "ghost"}
          onClick={() => onCategoryChange("all")}
        >
          All
        </Button>

        {DRILL_CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={categoryFilter === category ? "primary" : "ghost"}
            onClick={() => onCategoryChange(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  )
}
