# Phase 8: Drill Library - Research

**Researched:** 2026-01-27
**Domain:** React list/grid UI with search and filtering
**Confidence:** HIGH

## Summary

This phase implements a drill library view with grid layout, search, and category filtering. The research focused on React patterns for combining multiple filters, Tailwind CSS responsive grid layouts, debouncing search inputs, and empty state design.

The standard approach is client-side filtering using React Query's existing data fetch (useDrills hook already exists from Phase 3), with local state managing search/filter criteria. Filtering happens in the component using JavaScript's filter method on the cached data rather than making new API requests for each filter change. This is appropriate because drill libraries are typically small datasets (dozens to hundreds of items).

For UI, the pattern is a responsive CSS Grid using Tailwind's `grid-cols-{n}` utilities with breakpoint variants (mobile-first: 1 column → 2 → 3 → 4 columns). Search uses a debounced input (300-500ms) to avoid excessive re-renders. Category filters use button groups or select elements. Empty states follow the "instruction + delight" pattern with clear next actions.

**Primary recommendation:** Use client-side filtering with useMemo for derived filtered data, Tailwind responsive grid with grid-cols breakpoints, custom useDebounce hook for search, and Button component for category filters matching the existing design system.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18+ | Component framework | Already in use (Phase 1) |
| TypeScript | 5+ | Type safety | Already in use (Phase 1) |
| Tailwind CSS | 3+ | Responsive grid layout | Already in use (Phase 1) |
| React Query | 5+ (TanStack) | Data fetching and caching | Already in use (Phase 3) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge | Latest | Class name composition | Already in use via cn() utility (Phase 6) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side filtering | Server-side filtering | Server-side reduces bandwidth for large datasets (1000+ items) but adds API complexity. Client-side is simpler and faster for small datasets (typical drill libraries have 50-200 items). |
| CSS Grid | Flexbox with flex-wrap | Grid provides better control for card layouts, Flexbox can have uneven spacing on last row. Grid is modern standard for this use case. |
| Custom debounce | Library like lodash.debounce | Custom hook is lighter (10 lines), no extra dependency. Lodash adds 70KB+ if not already used. |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── pages/
│   └── DrillLibrary.tsx           # Main library page component
├── components/
│   ├── drills/
│   │   ├── DrillCard.tsx          # Individual drill card
│   │   ├── DrillGrid.tsx          # Grid wrapper with responsive layout
│   │   ├── DrillFilters.tsx       # Search + category filter controls
│   │   └── DrillEmptyState.tsx    # Empty state when no results
│   └── ui/
│       └── Skeleton.tsx           # Already exists (Phase 6)
└── hooks/
    ├── useDrills.ts               # Already exists (Phase 3)
    └── useDebounce.ts             # New: debounce hook for search
```

### Pattern 1: Client-Side Filtering with useMemo
**What:** Derive filtered data using useMemo to avoid unnecessary re-renders
**When to use:** When working with cached data from React Query (data already fetched)
**Example:**
```typescript
// Source: Multiple community sources verified with React docs patterns
function DrillLibrary() {
  const { data: drills, isLoading } = useDrills(userId);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DrillCategory | "all">("all");

  // Debounce search term to avoid excessive filtering
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Derive filtered data - only recalculates when dependencies change
  const filteredDrills = useMemo(() => {
    if (!drills) return [];

    return drills.filter(drill => {
      // Category filter
      const matchesCategory = categoryFilter === "all" || drill.category === categoryFilter;

      // Search filter (case-insensitive)
      const matchesSearch = drill.name.toLowerCase().includes(debouncedSearch.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [drills, categoryFilter, debouncedSearch]);

  return (
    <div>
      <DrillFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />
      <DrillGrid drills={filteredDrills} isLoading={isLoading} />
    </div>
  );
}
```

### Pattern 2: Debounced Search Input
**What:** Custom hook that returns debounced value after user stops typing
**When to use:** Any search input to avoid excessive re-renders and filtering operations
**Example:**
```typescript
// Source: Community pattern verified across multiple sources
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timer
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up on value change or unmount
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedSearch = useDebounce(searchTerm, 300);
```

### Pattern 3: Responsive Grid Layout (Tailwind)
**What:** Mobile-first responsive grid using Tailwind breakpoint utilities
**When to use:** Card/tile layouts that should adapt to screen size
**Example:**
```tsx
// Source: Tailwind CSS official documentation
function DrillGrid({ drills, isLoading }: DrillGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {isLoading ? (
        // Skeleton cards
        Array.from({ length: 8 }).map((_, i) => (
          <DrillCardSkeleton key={i} />
        ))
      ) : drills.length === 0 ? (
        <DrillEmptyState />
      ) : (
        drills.map(drill => (
          <DrillCard key={drill.id} drill={drill} />
        ))
      )}
    </div>
  );
}
```

**Breakpoint strategy:**
- Base (mobile): 1 column (`grid-cols-1`)
- md (768px+): 2 columns (`md:grid-cols-2`)
- lg (1024px+): 3 columns (`lg:grid-cols-3`)
- xl (1280px+): 4 columns (`xl:grid-cols-4`)

### Pattern 4: Drill Card Component
**What:** Individual card with thumbnail, title, category, and metadata
**When to use:** Displaying each drill in the grid
**Example:**
```tsx
// Source: Accessibility patterns from inclusive-components.design/cards
interface DrillCardProps {
  drill: Drill;
}

export function DrillCard({ drill }: DrillCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative">
        {drill.video_url ? (
          <img
            src={getProxyMediaUrl('drills', drill.video_url)}
            alt=""  // Decorative - title provides context
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <VideoIcon className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{drill.name}</h3>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
            {drill.category}
          </span>
          {drill.num_players && (
            <span>{drill.num_players} players</span>
          )}
        </div>
      </div>
    </article>
  );
}
```

### Pattern 5: Filter Controls
**What:** Search input + category filter buttons in a single component
**When to use:** Top of the drill library page
**Example:**
```tsx
// Source: Community patterns for filter UI
interface DrillFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: DrillCategory | "all";
  onCategoryChange: (category: DrillCategory | "all") => void;
}

export function DrillFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange
}: DrillFiltersProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Search */}
      <Input
        label="Search drills"
        type="search"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={categoryFilter === "all" ? "primary" : "ghost"}
          onClick={() => onCategoryChange("all")}
        >
          All
        </Button>
        {DRILL_CATEGORIES.map(category => (
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
  );
}
```

### Pattern 6: Empty State Design
**What:** Helpful message and call-to-action when no drills match filters
**When to use:** When filtered results are empty
**Example:**
```tsx
// Source: Empty state best practices from NN/g and Mobbin
export function DrillEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <SearchIcon className="w-8 h-8 text-gray-400" />
      </div>

      {/* Message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {hasFilters ? "No drills found" : "No drills yet"}
      </h3>
      <p className="text-gray-600 max-w-sm mb-6">
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Get started by creating your first drill."}
      </p>

      {/* Action */}
      {!hasFilters && (
        <Button onClick={() => navigate("/drills/new")}>
          Create your first drill
        </Button>
      )}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Filtering from filtered state:** Don't filter using the filteredDrills state - always filter from the original drills data source. This causes the filter to break when clearing search.
- **useEffect for derived state:** Don't use useEffect to update filteredDrills state when search changes - use useMemo instead. useEffect adds unnecessary re-renders and timing issues.
- **No debounce on search:** Don't call filter on every keystroke without debouncing - causes performance issues and excessive re-renders (especially with large lists).
- **Mutating state directly:** Don't use array.filter() then mutate the result - filter() already returns a new array, so this is safe, but avoid methods like .sort() without spreading first.
- **Hardcoded grid columns:** Don't use fixed grid-cols-3 without responsive variants - will break on mobile. Always use mobile-first breakpoint pattern.
- **Missing empty states:** Don't show an empty grid with no message - users won't know if it's loading, error, or legitimately empty.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debouncing search input | Custom setTimeout logic scattered in component | useDebounce hook | Centralized logic, handles cleanup, prevents memory leaks, reusable across components |
| Responsive grid layout | Custom media queries and flexbox | Tailwind grid-cols with breakpoints | Built-in, tested across devices, mobile-first by default, less CSS to maintain |
| Search string matching | Custom regex or indexOf | .toLowerCase().includes() | Simple, fast, works for basic search, handles special chars |
| Skeleton loading | Custom animated divs | Existing Skeleton component (Phase 6) | Consistent loading states, accessible, matches design system |
| Filter button group | Custom state management for active button | Controlled Button components with variant prop | Leverages existing Button variants, accessible, consistent with design system |

**Key insight:** Most drill libraries have small datasets (50-200 items), making client-side filtering simpler and faster than server-side. React Query already caches the data, so filtering is just a JavaScript array operation. Only move to server-side if datasets grow to 1000+ items or search needs full-text search capabilities.

## Common Pitfalls

### Pitfall 1: Filtering from Filtered State (State Mutation Bug)
**What goes wrong:** When implementing search, developers filter using the `filteredDrills` state instead of the original `drills` data. This works initially but breaks when clearing the search - the filter has permanently removed items from state.

**Why it happens:** Confusion between "current filtered view" and "source of truth". The filtered result gets treated as the new source of truth.

**How to avoid:**
- Always filter from the original data source (React Query's drills)
- Use useMemo to derive filteredDrills from drills + filter criteria
- Never update the original drills array based on filter state

**Warning signs:**
- Search works once but clearing search doesn't restore items
- Changing filters shows fewer results than expected
- Refreshing the page "fixes" the missing items

**Example fix:**
```typescript
// BAD: Filtering from filtered state
const [filteredDrills, setFilteredDrills] = useState(drills);
const handleSearch = (term: string) => {
  const filtered = filteredDrills.filter(d => d.name.includes(term));
  setFilteredDrills(filtered); // BUG: Loses data on each filter
};

// GOOD: Always filter from original source
const filteredDrills = useMemo(() => {
  return drills.filter(d => d.name.includes(searchTerm));
}, [drills, searchTerm]);
```

### Pitfall 2: No Debounce on Search Input (Performance Issue)
**What goes wrong:** Filtering runs on every keystroke, causing the UI to freeze or lag when typing quickly, especially with 100+ items or complex filter logic.

**Why it happens:** Developers connect onChange directly to filter state without debouncing. Each keystroke triggers:
1. State update
2. Component re-render
3. useMemo recalculation (filtering all items)
4. Grid re-render (potentially 100+ DrillCard components)

For fast typing (5 chars in 1 second), this is 5 full re-render cycles when only the final state matters.

**How to avoid:**
- Use useDebounce hook with 300-500ms delay
- Only filter when user pauses typing
- Show instant feedback in input, debounced filtering in results

**Warning signs:**
- Input feels laggy when typing
- Browser console shows multiple renders per keystroke
- Performance profiler shows high JavaScript execution time

**Recommended delay:**
- Desktop: 300-500ms (users type quickly)
- Mobile: 250-350ms (typing is slower, expect shorter words)

### Pitfall 3: Missing Empty States for Different Scenarios
**What goes wrong:** Showing blank screen or generic "no results" without distinguishing between "no drills created yet" vs "no matches for current filters" vs "loading error".

**Why it happens:** Developers focus on the "happy path" (data exists) and add empty state as an afterthought with a single condition.

**How to avoid:**
- Check multiple conditions: isLoading, error, drills.length === 0, filteredDrills.length === 0
- Different messages for different scenarios:
  - First-time use (no drills): Encourage creating first drill
  - No matches (filtered): Suggest adjusting filters
  - Error state: Show error message and retry action
  - Loading: Show skeleton cards

**Warning signs:**
- Users report "broken" page when filters don't match anything
- No visual feedback during loading
- Confusion between "nothing found" and "loading"

**Example conditions:**
```typescript
if (isLoading) return <SkeletonGrid />;
if (error) return <ErrorState error={error} />;
if (!drills || drills.length === 0) return <EmptyState type="no-drills" />;
if (filteredDrills.length === 0) return <EmptyState type="no-matches" />;
return <DrillGrid drills={filteredDrills} />;
```

### Pitfall 4: Non-Responsive Grid Layout
**What goes wrong:** Using fixed grid-cols-3 or grid-cols-4 without responsive breakpoints causes cards to be tiny on mobile (unusable) or too large on desktop (wasted space).

**Why it happens:** Developers test on desktop only and assume grid will "just work" on mobile. Tailwind's grid-cols-{n} applies to ALL breakpoints unless overridden.

**How to avoid:**
- Always start mobile-first with grid-cols-1
- Add breakpoint variants for larger screens (md:grid-cols-2 lg:grid-cols-3)
- Test on actual mobile device or Chrome DevTools device emulation
- Consider touch target sizes (cards should be tappable, not tiny)

**Warning signs:**
- Cards are too small to read on mobile
- Horizontal scrolling on mobile
- Lots of empty space on wide screens
- Text truncation or overlap

**Mobile-first pattern:**
```tsx
// Start with 1 column (mobile), scale up at breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

### Pitfall 5: Incorrect Category Filter Type (TypeScript)
**What goes wrong:** Category filter state is typed as `DrillCategory` but needs to support "all" option, causing TypeScript errors or runtime bugs when selecting "All".

**Why it happens:** Forgetting that filter state needs an additional value beyond the database enum. The database has 4 categories, but the UI needs 5 states (4 categories + "all").

**How to avoid:**
- Type filter state as `DrillCategory | "all"`
- Handle "all" case explicitly in filter logic
- Don't add "all" to DRILL_CATEGORIES constant (it's not a DB value)

**Warning signs:**
- TypeScript error: Type '"all"' is not assignable to type 'DrillCategory'
- Runtime error when clicking "All" button
- Filter doesn't reset when selecting "All"

**Example:**
```typescript
// GOOD: Separate UI state from DB constraint
const [categoryFilter, setCategoryFilter] = useState<DrillCategory | "all">("all");

const filteredDrills = useMemo(() => {
  return drills.filter(drill => {
    if (categoryFilter === "all") return true;
    return drill.category === categoryFilter;
  });
}, [drills, categoryFilter]);
```

### Pitfall 6: Case-Sensitive Search
**What goes wrong:** Search for "passing" doesn't find drills named "Passing Drill" because the search is case-sensitive.

**Why it happens:** Using `string.includes()` without converting both strings to same case first.

**How to avoid:**
- Convert both search term and drill name to lowercase before comparing
- `drill.name.toLowerCase().includes(searchTerm.toLowerCase())`

**Warning signs:**
- User reports "search doesn't work"
- Search works for some drills but not others
- Results depend on exact capitalization

### Pitfall 7: Missing Accessible Labels on Card Images
**What goes wrong:** Screen readers announce each thumbnail as "image" without context, or announce the file path as alt text.

**Why it happens:** Either missing alt attribute or using non-empty alt for decorative images. The drill name already provides context, so the thumbnail is decorative.

**How to avoid:**
- Use empty alt attribute (`alt=""`) for decorative thumbnails
- The card title provides the accessible name
- If image is clickable link, the link text provides context

**Warning signs:**
- Screen reader announces "image, drill-video-123.mp4"
- Duplicate announcements of drill name (from both image alt and heading)
- Accessibility audits flag missing or redundant alt text

## Code Examples

Verified patterns from official sources:

### useDebounce Hook Implementation
```typescript
// Source: Community pattern, verified across multiple sources
import { useState, useEffect } from 'react';

/**
 * Debounces a value by delaying updates until user stops changing it
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * // debouncedSearch only updates 300ms after user stops typing
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Complete DrillLibrary Page Component
```typescript
// Source: Synthesized from React Query + Tailwind best practices
import { useState, useMemo } from "react";
import { useDrills } from "@/hooks/useDrills";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import type { DrillCategory } from "@/lib/database.types";
import { DrillFilters } from "@/components/drills/DrillFilters";
import { DrillGrid } from "@/components/drills/DrillGrid";
import { AppShell } from "@/components/layout/AppShell";
import { Container } from "@/components/layout/Container";

export function DrillLibraryPage() {
  const { user } = useAuth();
  const { data: drills, isLoading, error } = useDrills(user?.id);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DrillCategory | "all">("all");

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredDrills = useMemo(() => {
    if (!drills) return [];

    return drills.filter(drill => {
      const matchesCategory = categoryFilter === "all" || drill.category === categoryFilter;
      const matchesSearch = drill.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [drills, categoryFilter, debouncedSearch]);

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
          error={error}
          hasActiveFilters={searchTerm !== "" || categoryFilter !== "all"}
        />
      </Container>
    </AppShell>
  );
}
```

### Responsive Grid with Loading States
```typescript
// Source: Tailwind CSS official docs + React patterns
interface DrillGridProps {
  drills: Drill[];
  isLoading: boolean;
  error: Error | null;
  hasActiveFilters: boolean;
}

export function DrillGrid({ drills, isLoading, error, hasActiveFilters }: DrillGridProps) {
  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DrillCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (drills.length === 0) {
    return <DrillEmptyState hasFilters={hasActiveFilters} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {drills.map(drill => (
        <DrillCard key={drill.id} drill={drill} />
      ))}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS Grid with media queries | Tailwind responsive utilities | Tailwind v1.0+ (2019) | Mobile-first by default, no custom CSS needed, consistent breakpoints |
| Lodash debounce | Custom useDebounce hook | React Hooks (2019) | Lighter bundle, proper cleanup, integrated with React lifecycle |
| Server-side filtering for all lists | Client-side for small datasets (<1000 items) | ~2020 with React Query popularity | Simpler implementation, instant filtering, leverages React Query cache |
| Separate loading/error/empty components | Consolidated conditional rendering in grid component | Modern React patterns (2021+) | Single source of truth for display state, easier to maintain |
| Manual filter state management | useMemo for derived filter state | React 16.8+ (Hooks) | Prevents unnecessary re-renders, automatic dependency tracking, eliminates useEffect for derived state |

**Deprecated/outdated:**
- **CSS Grid auto-fill with minmax()**: Still valid but Tailwind's grid-cols with breakpoints is simpler for card layouts and more maintainable in utility-first codebases
- **useEffect for filtered state**: Was common pre-useMemo understanding, now considered anti-pattern for derived state
- **Class-based components for lists**: Functional components with hooks are the standard since React 16.8

## Open Questions

1. **Video thumbnail extraction strategy**
   - What we know: Phase 5 handles video uploads with proxy URLs, but doesn't extract thumbnails
   - What's unclear: Should we extract video thumbnails server-side, use first frame client-side, or allow users to upload custom thumbnails?
   - Recommendation: Phase 8 can use placeholder icon for now. If thumbnails are needed, defer to a future phase to avoid scope creep. Most drill libraries work fine with category icons or placeholder images initially.

2. **Grid vs list view toggle**
   - What we know: Requirements specify grid layout only
   - What's unclear: Is a list view needed for accessibility or user preference?
   - Recommendation: Start with grid only as specified. Monitor user feedback. List view can be added later if needed without architectural changes.

3. **Pagination or infinite scroll**
   - What we know: Requirements don't mention pagination
   - What's unclear: Expected dataset size - are 200+ drills common?
   - Recommendation: Client-side filtering without pagination is fine for 50-200 items. If datasets exceed 500 items, add virtual scrolling (react-window) or pagination in a future phase.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Grid Template Columns](https://tailwindcss.com/docs/grid-template-columns) - Official documentation for responsive grid layouts
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Official breakpoint system documentation
- [React Documentation](https://react.dev) - Official React patterns and hooks

### Secondary (MEDIUM confidence)
- [React and TypeScript: Generic Search, Sort, and Filter](https://chrisfrew.in/blog/react-typescript-generic-search-sort-and-filters/) - TypeScript patterns for search/filter
- [Building a Real-Time Search Filter in React](https://dev.to/alais29dev/building-a-real-time-search-filter-in-react-a-step-by-step-guide-3lmm) - Search implementation patterns
- [How to debounce and throttle in React without losing your mind](https://www.developerway.com/posts/debouncing-in-react) - Debouncing best practices
- [Empty state UX examples and design rules](https://www.eleken.co/blog-posts/empty-state-ux) - Empty state design patterns
- [Empty States – The Most Overlooked Aspect of UX - Toptal](https://www.toptal.com/designers/ux/empty-state-ux-design) - Empty state best practices
- [Inclusive Components: Cards](https://inclusive-components.design/cards/) - Card accessibility patterns
- [React Aria - Accessibility](https://react-spectrum.adobe.com/react-aria/accessibility.html) - ARIA best practices for React
- [CSS Grid auto-fit vs auto-fill - CSS-Tricks](https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/) - Grid layout techniques
- [Filtering and Search, Client-Side vs. Server-Side](https://medium.com/@eminasian/filtering-and-search-client-side-vs-server-side-a9084bbcbf74) - Filtering strategy comparison
- [Deciding Between Client-Side and Server-Side Filtering](https://dev.to/marmariadev/deciding-between-client-side-and-server-side-filtering-22l9) - Filter implementation guidance

### Tertiary (LOW confidence)
- [React Filter UI Common Mistakes](https://dev.to/sidramaqbool/best-practices-for-using-the-filter-method-in-reactjs-3dog) - WebSearch only, practical pitfalls
- [Mastering Responsive Layouts with Tailwind Grid](https://codeparrot.ai/blogs/mastering-responsive-layouts-with-tailwind-grid-in-react) - WebSearch only, grid patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, no new dependencies
- Architecture: HIGH - Patterns verified with official docs (Tailwind, React) and multiple community sources
- Pitfalls: HIGH - Verified through multiple developer experience articles and official anti-pattern documentation
- Code examples: HIGH - Synthesized from official documentation and verified community patterns

**Research date:** 2026-01-27
**Valid until:** ~2026-04-27 (90 days - stable domain, React/Tailwind patterns change slowly)
