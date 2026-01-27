# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** Coaches can quickly build and save training session plans by dragging drills into a visual grid, accessible from any device including iPads on the field.
**Current focus:** Phase 4 - Supabase Storage & Media Upload

## Current Position

Phase: 4 of 16 (Supabase Storage & Media Upload)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-01-27 — Completed 04-02-PLAN.md (Upload Hook)

Progress: [██░░░░░░░░] 25% (3/16 phases completed, 12/48 plans completed)

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 4.3min
- Total execution time: 0.87 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-project-setup-infrastructure | 4 | 28min | 7min |
| 02-authentication-system | 3 | 6min | 2min |
| 03-database-schema-services | 3 | 13min | 4.3min |
| 04-supabase-storage-media-upload | 2 | 4min | 2min |

**Recent Trend:**
- Last 5 plans: 03-02 (4min), 03-03 (6min), 04-01 (2min), 04-02 (2min)
- Trend: Fast execution on straightforward implementation plans

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

### Pending Todos

None yet.

### Blockers/Concerns

- Migration 001_storage_bucket.sql needs to be applied to Supabase before upload functionality can be tested

## Session Continuity

Last session: 2026-01-27
Stopped at: Completed 04-02-PLAN.md (Upload Hook)
Resume file: None

## Production URLs

- Frontend: https://ttp-session-planner.vercel.app
- Backend: https://ttp-session-planner.onrender.com
- Supabase: https://cvzffawyjrgubhkzuwkd.supabase.co
