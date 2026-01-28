# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** Coaches can quickly build and save training session plans by dragging drills into a visual grid, accessible from any device including iPads on the field.
**Current focus:** Phase 15 - Performance Optimization

## Current Position

Phase: 15 of 16 (Performance Optimization)
Plan: 3 of 3 in current phase (15-01, 15-02 complete)
Status: Ready to execute 15-03
Last activity: 2026-01-28 — Completed Phase 14 (iOS/iPad Optimization)

Progress: [█████████░] 94% (14/16 phases completed, 47/48 plans completed)

## Performance Metrics

**Velocity:**
- Total plans completed: 45
- Average duration: 3.5min
- Total execution time: 2.7 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-project-setup-infrastructure | 4 | 28min | 7min |
| 02-authentication-system | 3 | 6min | 2min |
| 03-database-schema-services | 3 | 13min | 4.3min |
| 04-supabase-storage-media-upload | 3 | 9min | 3min |
| 05-ios-media-proxy | 2 | 5min | 2.5min |
| 06-core-ui-components | 4 | 41min | 10.3min |
| 07-add-drill-feature | 3 | 10min | 3.3min |
| 08-drill-library | 2 | 3.8min | 1.9min |
| 09-drill-detail-edit | 2 | 7.7min | 3.9min |
| 10-session-planner-grid | 3 | 12min | 4min |
| 11-save-load-sessions | 4 | 12.4min | 3.1min |
| 12-dashboard | 2 | 4min | 2min |
| 13-error-handling-loading-states | 2 | 3.7min | 1.85min |
| 14-ios-ipad-optimization | 2 | 10.4min | 5.2min |
| 15-performance-optimization | 2 | 6min | 3min |
| 16-final-testing-launch | 1 | 6min | 6min |

**Recent Trend:**
- Last 5 plans: 11-04 (3min), 14-02 (5min), 15-01 (3min), 15-02 (3min), 16-01 (6min)
- Trend: Pre-deployment verification complete - BLOCKED on backend storage access issue

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Tech Stack: React 18+ with Vite, TypeScript strict, Tailwind CSS (baked into constraints)
- Backend: Express.js with TypeScript for iOS video proxy pattern
- Database: Supabase PostgreSQL with RLS for multi-tenant isolation
- iOS Strategy: Backend proxy for video streaming to handle Range requests (rebuild context)
- Tailwind CSS v4 approach: Use @import syntax, no config files needed (01-01)
- TypeScript strict mode enabled from start for maximum type safety (01-01)
- Express 5 for native async error handling (01-02)
- ES modules with NodeNext resolution for modern Node.js patterns (01-02)
- Separated app.ts and server.ts for testability and modularity (01-02)
- Dual Supabase client pattern: Admin client (bypasses RLS) for privileged ops, user factory (respects RLS) for tenant isolation (01-03)
- Connection verification via expected error codes for non-existent tables (01-03)
- Synchronous onAuthStateChange callback to avoid Supabase client deadlocks (02-01)
- isLoading state starts true to prevent flash of unauthenticated content (02-01)
- AuthProvider wraps entire app for global auth state access via useAuth hook (02-01)
- ProtectedRoute uses Outlet pattern for React Router v6 nested routes (02-02)
- LoginPage preserves intended destination via location.state.from (02-02)
- SignupPage handles both email confirmation enabled/disabled flows (02-02)
- All auth forms use controlled components with React useState (02-02)
- RLS policies use (SELECT auth.uid()) wrapper for 94-99% performance improvement over bare auth.uid() (03-01)
- Category validation via CHECK constraint for flexibility over PostgreSQL enum types (03-01)
- JSONB for session grid_data for flexible schema evolution without migrations (03-01)
- Denormalized creator_email field for display without auth.users joins (03-01)
- Service functions accept Supabase client as parameter for flexibility (authenticated or admin ops) (03-02)
- All service functions throw errors for React Query error handling (03-02)
- QueryClient configured with 1-minute stale time and single retry (03-02)
- QueryProvider wraps AuthProvider in component hierarchy (03-02)
- Query key factories exported for external cache manipulation (03-03)
- Mutations invalidate user-scoped list queries on success (03-03)
- Delete mutations invalidate all lists (userId unavailable in onSuccess) (03-03)
- Hooks use enabled flag for conditional fetching (03-03)
- Private storage bucket with signed URLs for secure media access (04-01)
- owner_id for SELECT/DELETE, foldername for INSERT in storage RLS (04-01)
- TypeScript constants mirror SQL migration arrays for single source of truth (04-01)
- TUS endpoint URL constructed from VITE_SUPABASE_URL project ID extraction (04-02)
- 6MB chunk size for Supabase TUS compatibility standard (04-02)
- Upload ref pattern for abort capability during in-progress uploads (04-02)
- Bucket created via Dashboard UI due to SQL migration permission limitations (04-03)
- Shared viewing RLS: All authenticated users can view files, only owner can INSERT/DELETE (04-03)
- playsInline attribute on video elements for iOS compatibility (04-03)
- Express 5 named wildcards: /:bucket/*path required for path-to-regexp v8 compatibility (05-01)
- 1MB chunk size for video streaming with stream.pipeline() for safe error handling (05-01)
- 1 hour signed URL expiry for long videos and paused playback (05-01)
- CORS exposedHeaders for media endpoints: Content-Range, Accept-Ranges, Content-Length (05-01)
- getProxyMediaUrl validates file extension with console.warn for Safari debugging (05-02)
- cn() combines clsx + tailwind-merge for conflict-free Tailwind class merging (06-01)
- Sonner Toaster positioned top-right with richColors, closeButton, 4s duration (06-01)
- AppErrorBoundary logs errors to console with componentStack for debugging (06-01)
- min-h-11 min-w-11 for 44px touch targets on mobile menu buttons (06-03)
- Body scroll lock when mobile sidebar open for UX (06-03)
- Polymorphic 'as' prop on Container for semantic HTML flexibility (06-03)
- 44px (min-h-11) touch targets on ALL Button and Input elements for iOS/iPad accessibility (06-02)
- forwardRef pattern for ref forwarding on primitive components (06-02)
- Barrel exports from components/ui/index.ts for clean imports (06-02)
- @/* path alias configured in tsconfig.app.json and vite.config.ts (06-02)
- Provider hierarchy: AppErrorBoundary > SkeletonProvider > App > Toaster (06-04)
- Page layout pattern: AppShell with sidebar/header props, Container for content (06-04)
- Custom Zod transform for num_players to avoid z.coerce.number() pitfall (converts empty string to 0) (07-01)
- TagInput keyboard shortcuts: Enter/Tab to add, Backspace on empty to remove last (07-01)
- DRILL_CATEGORIES const array matches database CHECK constraint values (07-01)
- Separate media state from form state to track upload progress independently (07-02)
- Form disable logic: isSubmitting || isPending || isUploading for safe submissions (07-02)
- valueAsNumber register option for number inputs to handle HTML coercion (07-02)
- Zod enum uses message parameter, not errorMap function (07-02)
- Zod array .default() makes fields required - use form defaultValues instead (07-02)
- useDebounce returns same generic type as input for type safety (08-01)
- DrillCard shows num_players badge when available for quick reference (08-01)
- Empty state distinguishes no-drills vs no-matches with hasFilters prop (08-01)
- SVG icons inline for simplicity, no icon library dependency (08-01)
- useMemo for filtering - recomputes only when drills, categoryFilter, or debouncedSearch changes (08-02)
- Search uses debounced value (300ms) but category is instant for better UX (08-02)
- Grid shows 8 skeleton cards during loading for consistent layout (08-02)
- Responsive grid breakpoints: md:2col, lg:3col, xl:4col (08-02)
- Headless UI installed early for future delete dialog (09-01)
- playsInline (capital I) attribute for iOS video inline playback (09-01)
- Route /drills/:id placed after /drills/new for correct specificity (09-01)
- Detail page pattern: useParams → hook → loading/error/success states (09-01)
- Edit mode detection via optional drill prop (isEditMode = !!drill) for form reusability (09-02)
- Form defaultValues conditionally set based on drill prop presence (09-02)
- Edit mode does NOT reset form after success (navigates instead) (09-02)
- Route ordering: /drills/new → /drills/:id/edit → /drills/:id → /drills for correct specificity (09-02)
- DeleteDrillDialog isDeleting prop keeps dialog open during mutation (09-03)
- onDelete re-throws errors to prevent dialog close on failure (09-03)
- Dialog confirmation pattern: isOpen state + onClose/onConfirm callbacks (09-03)
- Separate MouseSensor + TouchSensor instead of PointerSensor for better activation control (10-01)
- MouseSensor requires 10px drag distance to prevent accidental drags on clicks (10-01)
- TouchSensor requires 250ms hold with 5px tolerance for iPad-friendly interactions (10-01)
- Session grid structure: 4 rows (drill categories) x 3 columns (sequential slots) = 12 cells (10-01)
- Cell keys follow template literal pattern: 'rowKey-colIndex' (e.g., 'activation-0') (10-01)
- Grid state management is local-only in Phase 10; Supabase persistence deferred to Phase 11 (10-01)
- GridCell onClick handler supports click-to-place mode for non-drag interactions (10-02)
- DraggableDrillCard shows num_players badge when available for quick drill reference (10-02)
- SessionGrid uses CSS grid template grid-cols-[auto_repeat(3,1fr)] for flexible row labels + fixed 3 columns (10-02)
- DrillLibrarySidebar includes instruction text for both drag-and-drop and click-to-place interactions (10-02)
- Remove button uses e.stopPropagation() to prevent cell onClick when removing drills (10-02)
- getUserFriendlyError() centralizes error message conversion to user-friendly text (13-01)
- Error helper handles Supabase auth errors, network errors, and provides fallback messages (13-01)
- Toast notifications (via Sonner) are primary error display mechanism across the app (13-01)
- Auth pages use toast.error(getUserFriendlyError(error)) pattern for consistent error handling (13-02)
- Auth success actions show toast.success before navigation for user feedback (13-02)
- Email confirmation message kept inline in SignupPage (needs persistent visibility vs transient toast) (13-02)
- Button component loading prop handles spinner + disabled state automatically (13-02)
- MediaUpload shows toast.success for upload/delete success and toast.error for failures (13-03)
- Headless UI Dialog for accessible modal primitives (focus trap, ESC, ARIA) (11-01)
- ConfirmDialog component pattern: isOpen/onClose/onConfirm props with loading state support (11-01)
- confirmVariant prop supports both danger and primary styles for flexibility (11-01)
- Cancel button calls onClose for consistent close behavior (11-01)
- SessionList shows 3 skeleton cards during loading for consistent grid layout preview (11-02)
- Empty state navigates to /sessions/new with clear call-to-action message (11-02)
- Delete button uses ghost variant with red text for subtle danger styling (11-02)
- SessionListItem cards show name and creation date with Load/Delete actions (11-02)
- Sessions list uses responsive grid: md:2col, lg:3col for optimal card display (11-02)
- Load action navigates to /sessions/:id/edit (future session editor route) (11-02)
- RECENT_ITEMS_LIMIT = 4 for visual balance on 4-column grid (12-01)
- Quick action cards use colored icon backgrounds (blue/green) for visual distinction (12-01)
- Inline SessionCard in RecentSessions rather than separate file (simpler for now) (12-01)
- Empty states use bg-gray-50 for subtle visual boundary (12-01)
- Sidebar navigation converted from anchor tags to Link components for SPA routing (12-02)
- Settings link removed from sidebar (not implemented in current scope) (12-02)
- DashboardEmptyState created but not wired - individual component empty states handle new user guidance (12-02)
- Tailwind min-h-11 (44px) for iOS touch target compliance across all interactive elements (14-01)
- Negative margins (-mr-2) compensate for 44px touch targets in tight layouts like tag lists (14-01)
- inline-flex items-center min-h-11 pattern for inline link touch targets (maintains text flow) (14-01)
- MediaUpload video preview uses getProxyMediaUrl for iOS Range request compatibility (14-02)
- Image previews continue using signed URLs (no Range requests needed) (14-02)
- After saving new session, navigate to /sessions/:id/edit so subsequent saves update instead of creating duplicates (11-04)
- Double cast (as unknown as GridData) for Json to GridData type conversion due to Supabase type system (11-04)
- useEffect to update grid when session data loads asynchronously (11-04)
- 5-minute staleTime for drills - change infrequently, safe to cache longer (15-02)
- 2-minute staleTime for session list - change more frequently during active planning (15-02)
- 1-minute staleTime for single session - may change during editing scenarios (15-02)
- Explicit width/height (320x180) on images for 16:9 aspect ratio, prevents CLS (15-02)
- loading="lazy" on below-fold images for bandwidth reduction (15-02)
- Pre-deployment verification pattern: Document critical blockers with specific resolution steps rather than attempting workarounds (16-01)
- CORS configuration verified separately from Range requests to isolate working vs broken infrastructure components (16-01)
- Test with real production files rather than mock data for realistic verification (16-01)

### Pending Todos

None yet.

### Blockers/Concerns

**CRITICAL BLOCKER (16-01):** Backend cannot access Supabase storage - production backend returns 404 for all media proxy requests. File exists in storage and is accessible via signed URL, but backend service role key may not be configured in Render environment. Must verify SUPABASE_SERVICE_ROLE_KEY in Render dashboard before proceeding to browser testing. iOS video playback requires Range request support which depends on backend proxy functioning.

## Session Continuity

Last session: 2026-01-28
Stopped at: Phase 14 complete, Phase 15 has 15-03 remaining, Phase 16 BLOCKED
Resume file: None

## Production URLs

- Frontend: https://ttp-session-planner.vercel.app
- Backend: https://ttp-session-planner.onrender.com
- Supabase: https://cvzffawyjrgubhkzuwkd.supabase.co
