---
phase: 06-core-ui-components
plan: 01
subsystem: ui
tags: [clsx, tailwind-merge, sonner, react-error-boundary, react-hook-form, zod]

# Dependency graph
requires:
  - phase: 01-project-setup-infrastructure
    provides: React with TypeScript and Tailwind CSS setup
provides:
  - cn() utility for Tailwind class merging
  - Toast notification system via Sonner
  - Error boundary with user-friendly fallback UI
  - Form library foundation (react-hook-form + zod)
affects:
  - 06-core-ui-components (subsequent plans will use cn() and feedback components)
  - All future UI phases

# Tech tracking
tech-stack:
  added:
    - sonner (toast notifications)
    - react-loading-skeleton (loading states)
    - react-hook-form (form management)
    - zod (schema validation)
    - "@hookform/resolvers" (zod integration)
    - react-error-boundary (error handling)
    - clsx (class composition)
    - tailwind-merge (Tailwind conflict resolution)
  patterns:
    - cn() utility pattern for class merging
    - AppErrorBoundary wrapper pattern for error handling
    - Feedback components barrel export pattern

key-files:
  created:
    - frontend/src/lib/utils.ts
    - frontend/src/components/feedback/Toaster.tsx
    - frontend/src/components/feedback/ErrorFallback.tsx
    - frontend/src/components/feedback/index.ts
  modified:
    - frontend/package.json

key-decisions:
  - "cn() combines clsx + tailwind-merge for conflict-free class merging"
  - "Sonner Toaster positioned top-right with 4s duration"
  - "ErrorFallback safely extracts error message from unknown error type"
  - "AppErrorBoundary logs errors to console for debugging"

patterns-established:
  - "cn() utility: Always use cn() for combining Tailwind classes"
  - "Feedback components: Import from components/feedback barrel"
  - "Error handling: getErrorMessage() helper for safe error extraction"

# Metrics
duration: 3min
completed: 2026-01-27
---

# Phase 06 Plan 01: UI Foundation Dependencies Summary

**Installed 8 UI libraries and created cn() utility with feedback components (Toaster, ErrorFallback, AppErrorBoundary)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-27T23:42:22Z
- **Completed:** 2026-01-27T23:45:34Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Installed all 8 UI component libraries (sonner, react-loading-skeleton, react-hook-form, zod, @hookform/resolvers, react-error-boundary, clsx, tailwind-merge)
- Created cn() utility function that combines clsx conditional classes with tailwind-merge conflict resolution
- Created Toaster component with Sonner integration and project-specific config
- Created ErrorFallback and AppErrorBoundary components for graceful error handling

## Task Commits

Each task was committed atomically:

1. **Task 1: Install UI component library dependencies** - `ae25247` (chore)
2. **Task 2: Create cn() utility function** - `04bb943` (feat)
3. **Task 3: Create feedback components** - `6011e1a` (feat)

## Files Created/Modified

- `frontend/package.json` - Added 8 UI library dependencies
- `frontend/src/lib/utils.ts` - cn() utility combining clsx + tailwind-merge
- `frontend/src/components/feedback/Toaster.tsx` - Sonner wrapper with project config
- `frontend/src/components/feedback/ErrorFallback.tsx` - Error boundary UI with Try Again button
- `frontend/src/components/feedback/index.ts` - Barrel export for feedback components

## Decisions Made

- **cn() implementation:** Uses clsx for conditional class composition then tailwind-merge for conflict resolution - standard pattern from shadcn/ui
- **Toaster positioning:** Top-right with richColors and closeButton enabled, 4 second duration
- **Error type handling:** Added getErrorMessage() helper to safely extract message from unknown error type (TypeScript strict mode requirement)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript strict mode error for unknown error type**
- **Found during:** Task 3 (feedback components)
- **Issue:** FallbackProps types error as `unknown`, direct `.message` access fails in strict mode
- **Fix:** Added getErrorMessage() helper function with instanceof check
- **Files modified:** frontend/src/components/feedback/ErrorFallback.tsx
- **Verification:** TypeScript compilation passes for feedback components
- **Committed in:** 6011e1a (amended Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for TypeScript strict mode compatibility. No scope creep.

## Issues Encountered

- Pre-existing TypeScript errors in useDrills.ts and useSessions.ts (not related to this plan) - these files have type issues with `{}` return types from service functions that need to be addressed in a future plan

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- cn() utility ready for use in all future component files
- Toaster component ready to add to App.tsx root
- AppErrorBoundary ready to wrap app components
- Form libraries (react-hook-form, zod, @hookform/resolvers) ready for form components
- react-loading-skeleton ready for loading state components

---
*Phase: 06-core-ui-components*
*Completed: 2026-01-27*
