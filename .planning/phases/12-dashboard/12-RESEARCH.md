# Phase 12: Dashboard - Research

**Researched:** 2026-01-27
**Domain:** React Dashboard UI, Empty States, Quick Actions
**Confidence:** HIGH

## Summary

This phase implements the Dashboard landing page that users see after login. The existing codebase already has a placeholder `DashboardPage.tsx` with demo components that needs to be replaced with production functionality: quick action buttons (Add Drill, New Session), and recent items display with proper empty states.

The project has a well-established pattern for data fetching (React Query hooks `useDrills`, `useSessions`), layout (`AppShell` + `Container`), and card components (`DrillCard`). The dashboard should follow these patterns and reuse existing components where possible. The primary work is composing existing primitives into a cohesive dashboard experience with proper loading/empty states.

**Primary recommendation:** Build the dashboard using existing hooks (`useDrills`, `useSessions`), reuse the `DrillCard` component for recent drills, and create a new `DashboardEmptyState` component following the `DrillEmptyState` pattern.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18+ | UI framework | Project foundation |
| React Router | 6+ | Navigation | Already used for `Link`, `useNavigate` |
| TanStack Query | Latest | Data fetching | `useDrills`, `useSessions` hooks exist |
| Tailwind CSS | v4 | Styling | Project standard |
| react-loading-skeleton | Latest | Loading states | Already wrapped in `Skeleton` component |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge | Latest | Class merging | Via `cn()` utility |
| sonner | Latest | Toast notifications | Via existing `toast` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom loading skeleton | Shimmer animation | react-loading-skeleton already integrated, provides consistent UX |
| Manual data fetching | Raw Supabase calls | React Query hooks already exist with caching, invalidation |

**Installation:**
No new packages required - all dependencies exist in the project.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── pages/
│   └── DashboardPage.tsx        # Main dashboard page (replace existing demo)
├── components/
│   ├── dashboard/               # NEW: Dashboard-specific components
│   │   ├── index.ts             # Barrel export
│   │   ├── QuickActions.tsx     # Quick action button grid
│   │   ├── RecentDrills.tsx     # Recent drills section with loading/empty
│   │   ├── RecentSessions.tsx   # Recent sessions section with loading/empty
│   │   └── DashboardEmptyState.tsx  # Empty state for new users
│   ├── drills/
│   │   └── DrillCard.tsx        # REUSE existing card component
│   └── layout/
│       └── AppShell.tsx         # REUSE existing layout
└── hooks/
    ├── useDrills.ts             # REUSE existing hook
    └── useSessions.ts           # REUSE existing hook
```

### Pattern 1: Quick Actions Grid
**What:** Prominent buttons for primary user actions
**When to use:** Dashboard hero area
**Example:**
```typescript
// Pattern: Use react-router-dom Link with button styling
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Link to="/drills/new" className="block">
        <div className="min-h-11 p-6 bg-white rounded-lg border hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900">Add Drill</h3>
          <p className="text-sm text-gray-600">Create a new training drill</p>
        </div>
      </Link>
      {/* Similar for New Session */}
    </div>
  )
}
```

### Pattern 2: Loading/Empty/Data State Machine
**What:** Three-state rendering for data sections
**When to use:** Any section that fetches data
**Example:**
```typescript
// Pattern from existing DrillGrid component
function RecentDrills({ userId }: { userId: string }) {
  const { data: drills, isLoading, error } = useDrills(userId)

  // Loading state
  if (isLoading) {
    return <SkeletonGrid count={4} />
  }

  // Empty state
  if (!drills || drills.length === 0) {
    return <DashboardEmptyState type="drills" />
  }

  // Data state - show only recent (limit to 4)
  const recentDrills = drills.slice(0, 4)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {recentDrills.map(drill => <DrillCard key={drill.id} drill={drill} />)}
    </div>
  )
}
```

### Pattern 3: Section-Based Dashboard Layout
**What:** Dashboard divided into logical sections with headings
**When to use:** Organizing multiple content types
**Example:**
```typescript
// Pattern: Container with sections
<Container size="lg">
  <div className="space-y-8">
    {/* Welcome section */}
    <section>
      <h1 className="text-3xl font-bold">Welcome back, {userName}</h1>
    </section>

    {/* Quick actions section */}
    <section>
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <QuickActions />
    </section>

    {/* Recent drills section */}
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Drills</h2>
        <Link to="/drills" className="text-blue-600 hover:text-blue-800">View all</Link>
      </div>
      <RecentDrills userId={userId} />
    </section>
  </div>
</Container>
```

### Anti-Patterns to Avoid
- **Multiple loading states stacking:** Don't fetch drills and sessions sequentially. Fetch in parallel using separate hooks.
- **Inline empty state messages:** Don't use plain text for empty states. Use the `DashboardEmptyState` component with icon, title, description, CTA.
- **Hardcoded limits:** Don't use magic numbers. Define `RECENT_ITEMS_LIMIT = 4` as a constant.
- **Missing touch targets:** Don't make quick action cards smaller than 44px. Use `min-h-11` consistently.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loading skeleton | Custom shimmer CSS | `Skeleton` from `@/components/ui` | Already styled, themed, consistent |
| Data fetching | useEffect + useState | `useDrills`, `useSessions` hooks | Caching, invalidation, error handling built-in |
| Empty state layout | Plain text + icon | Follow `DrillEmptyState` pattern | Consistent UX, accessible, CTA included |
| Grid layout | Custom flexbox | Tailwind `grid` classes | `md:grid-cols-2 lg:grid-cols-4` matches project standard |
| Page layout | Custom wrapper | `AppShell` + `Container` | Mobile sidebar, header, responsive padding all handled |
| Button styling | Custom button | `Button` component | 44px touch targets, variants, loading state |
| Class merging | String concatenation | `cn()` utility | Resolves Tailwind conflicts properly |

**Key insight:** The project already has well-tested primitives. Dashboard implementation is primarily composition, not creation.

## Common Pitfalls

### Pitfall 1: Forgetting Touch Targets on Quick Action Cards
**What goes wrong:** Quick action cards look nice but fail iOS accessibility tests
**Why it happens:** Cards styled for aesthetics without checking minimum touch area
**How to avoid:** Use `min-h-11` (44px) on all interactive elements
**Warning signs:** Cards shorter than 44px, no hover/focus states

### Pitfall 2: Empty State After First Login Shows Nothing
**What goes wrong:** New user sees blank dashboard with no guidance
**Why it happens:** Only handling the "has data" case, not the empty case
**How to avoid:** Design empty state first - icon, message, CTA to create first drill/session
**Warning signs:** No conditional rendering for `drills.length === 0`

### Pitfall 3: Loading States Cause Layout Shift
**What goes wrong:** Dashboard jumps around as sections load
**Why it happens:** Skeleton doesn't match final content dimensions
**How to avoid:** Skeleton cards should match `DrillCard` dimensions exactly
**Warning signs:** Content shifts when data loads, visible layout reflow

### Pitfall 4: Stale Data After Creating Drill/Session
**What goes wrong:** User creates drill, returns to dashboard, doesn't see it
**Why it happens:** React Query cache not invalidated
**How to avoid:** Already handled - `useCreateDrill` invalidates `drillKeys.list()`
**Warning signs:** Need to refresh page to see new content

### Pitfall 5: Quick Actions Not Using Router Navigation
**What goes wrong:** Quick actions cause full page reload
**Why it happens:** Using `<a href>` instead of `<Link to>`
**How to avoid:** Always use `<Link to>` from react-router-dom for internal navigation
**Warning signs:** Page flashes white on navigation, browser URL bar shows loading

## Code Examples

Verified patterns from the existing codebase:

### Quick Action Card with Touch Target
```typescript
// Pattern: Link wrapper with card styling
// Matches existing sidebar nav pattern in DashboardPage.tsx
import { Link } from 'react-router-dom'

interface QuickActionCardProps {
  to: string
  title: string
  description: string
  icon: React.ReactNode
}

function QuickActionCard({ to, title, description, icon }: QuickActionCardProps) {
  return (
    <Link to={to}>
      <div className="min-h-11 p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  )
}
```

### Dashboard Empty State (following DrillEmptyState pattern)
```typescript
// Pattern: Matches existing DrillEmptyState.tsx structure
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'

function DashboardEmptyState() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 rounded-full bg-blue-50 p-4">
        {/* Soccer/training related icon */}
        <svg className="w-16 h-16 text-blue-500" /* ... */ />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Welcome to Session Planner!
      </h3>
      <p className="text-gray-600 max-w-sm mb-6">
        Get started by creating your first drill or training session.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate('/drills/new')}>
          Create a drill
        </Button>
        <Button variant="secondary" onClick={() => navigate('/sessions/new')}>
          Plan a session
        </Button>
      </div>
    </div>
  )
}
```

### Recent Items with View All Link
```typescript
// Pattern: Section header with link
function RecentItemsHeader({ title, viewAllTo }: { title: string; viewAllTo: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <Link
        to={viewAllTo}
        className="text-sm text-blue-600 hover:text-blue-800 min-h-11 flex items-center"
      >
        View all
      </Link>
    </div>
  )
}
```

### Loading State (reusing existing skeleton pattern)
```typescript
// Pattern: Match DrillGrid skeleton pattern
// Show 4 skeleton cards (RECENT_ITEMS_LIMIT)
const RECENT_ITEMS_LIMIT = 4

function RecentDrillsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: RECENT_ITEMS_LIMIT }).map((_, i) => (
        <DrillCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Reuse DrillCardSkeleton from DrillGrid.tsx
function DrillCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <Skeleton className="aspect-video" />
      <div className="p-4">
        <Skeleton width="60%" height={20} className="mb-2" />
        <Skeleton width={80} height={24} />
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useEffect + fetch | TanStack Query hooks | Already in project | Caching, loading states, error handling automatic |
| CSS grid with media queries | Tailwind responsive grid | Already in project | `md:grid-cols-2` is cleaner |
| Inline loading text | Skeleton placeholders | Already in project | Better perceived performance |
| Manual empty state conditionals | Dedicated empty state components | Already in project | Reusable, consistent UX |

**Deprecated/outdated:**
- None in this phase - project is using modern patterns

## Open Questions

Things that couldn't be fully resolved:

1. **Session card component**
   - What we know: `DrillCard` exists and can be reused for drills
   - What's unclear: Does a `SessionCard` component exist? If not, what should it display?
   - Recommendation: Create a simple `SessionCard` following `DrillCard` pattern, showing session name and creation date

2. **"New Session" route**
   - What we know: Quick action should navigate to "New Session"
   - What's unclear: Does `/sessions/new` route exist? Phase 11 should have created it.
   - Recommendation: Verify route exists; if not, use placeholder that shows toast "Coming soon"

3. **Recent items count**
   - What we know: Dashboard shows "recent" items
   - What's unclear: How many? 4? 6?
   - Recommendation: Use 4 for visual balance on 4-column grid (1 per column at lg breakpoint)

## Sources

### Primary (HIGH confidence)
- Existing codebase: `DashboardPage.tsx`, `DrillCard.tsx`, `DrillEmptyState.tsx`, `DrillGrid.tsx`
- Existing codebase: `useDrills.ts`, `useSessions.ts` hooks
- Existing codebase: `AppShell.tsx`, `Container.tsx`, `Button.tsx` components

### Secondary (MEDIUM confidence)
- [LogRocket: UI best practices for loading, error, and empty states](https://blog.logrocket.com/ui-design-best-practices-loading-error-empty-state-react/) - Empty state patterns
- [Shopify Polaris Empty State](https://polaris-react.shopify.com/components/layout-and-structure/empty-state) - Action-oriented empty states
- [Tailwind CSS Grid Documentation](https://tailwindcss.com/docs/grid-template-columns) - Responsive grid patterns

### Tertiary (LOW confidence)
- [TanStack Query Background Fetching](https://tanstack.com/query/v4/docs/react/guides/background-fetching-indicators) - Loading state indicators

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, no new dependencies
- Architecture: HIGH - Patterns derived from existing codebase components
- Pitfalls: HIGH - Based on common React/dashboard patterns and existing project conventions

**Research date:** 2026-01-27
**Valid until:** 60 days (stable patterns, no external API changes expected)
