# Roadmap: Soccer Session Planner

## Overview

This roadmap spans 16 phases across 3 milestones to deliver a cross-platform web app for soccer coaches to build training session plans. Foundation establishes auth, database, and iOS-compatible media handling. Core Features builds the drill library and session planner. Polish optimizes for production use on iPads in the field.

## Milestones

- [ ] **Milestone 1: Foundation (MVP)** - Phases 1-6 (infrastructure, auth, storage, core UI)
- [ ] **Milestone 2: Core Features** - Phases 7-12 (drill management, session planner, dashboard)
- [ ] **Milestone 3: Polish & Production** - Phases 13-16 (error handling, iOS optimization, performance, launch)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

### Milestone 1: Foundation (MVP)

- [x] **Phase 1: Project Setup & Infrastructure** - Initialize project scaffolding and deployment
- [x] **Phase 2: Authentication System** - User signup, login, session management
- [x] **Phase 3: Database Schema & Services** - PostgreSQL tables, RLS, TypeScript types
- [x] **Phase 4: Supabase Storage & Media Upload** - Upload videos/images with progress tracking
- [x] **Phase 5: iOS Media Proxy** - Backend proxy for Range requests and iOS compatibility
- [x] **Phase 6: Core UI Components** - Reusable components and responsive layout

### Milestone 2: Core Features

- [x] **Phase 7: Add Drill Feature** - Create new drills with metadata and media
- [x] **Phase 8: Drill Library** - Grid view with search and category filtering
- [x] **Phase 9: Drill Detail & Edit** - View full drill details, edit, delete
- [x] **Phase 10: Session Planner Grid** - 4x3 drag-and-drop grid for session planning
- [ ] **Phase 11: Save & Load Sessions** - Persist and retrieve session configurations
- [ ] **Phase 12: Dashboard** - Landing page with quick actions after login

### Milestone 3: Polish & Production

- [x] **Phase 13: Error Handling & Loading States** - Toast notifications, skeletons, user-friendly errors
- [ ] **Phase 14: iOS/iPad Optimization** - Touch targets, drag-and-drop, video playback testing
- [ ] **Phase 15: Performance Optimization** - Query caching, image optimization, lazy loading
- [ ] **Phase 16: Final Testing & Launch** - Cross-browser testing, deployment verification

## Phase Details

### Phase 1: Project Setup & Infrastructure
**Goal**: Development environment ready with frontend, backend, database connected and deployed
**Depends on**: Nothing (first phase)
**Requirements**: None (foundational work)
**Success Criteria** (what must be TRUE):
  1. Frontend React app runs locally with TypeScript and Tailwind
  2. Backend Express server runs locally with TypeScript
  3. Supabase project created with connection working from both frontend and backend
  4. Frontend and backend deploy successfully to Vercel and Render
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold frontend with Vite, React, TypeScript, Tailwind CSS v4
- [x] 01-02-PLAN.md — Scaffold backend with Express.js 5, TypeScript, health endpoint
- [x] 01-03-PLAN.md — Configure Supabase clients for frontend and backend
- [x] 01-04-PLAN.md — Deploy to Vercel and Render, configure CORS

### Phase 2: Authentication System
**Goal**: Users can create accounts, log in, and stay authenticated across sessions
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can sign up with email and password
  2. User can log in with email and password
  3. User session persists across browser refreshes
  4. Unauthenticated users redirected to login when accessing protected routes
  5. User can log out from any page
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Set up AuthContext with session management and React Router v6
- [x] 02-02-PLAN.md — Create LoginPage, SignupPage, and ProtectedRoute components
- [x] 02-03-PLAN.md — Wire routes, add LogoutButton, verify end-to-end auth flow

### Phase 3: Database Schema & Services
**Goal**: Database tables exist with RLS policies and TypeScript-safe query hooks
**Depends on**: Phase 2
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. Drills table exists with RLS preventing cross-user data access
  2. Sessions table exists with RLS preventing cross-user data access
  3. TypeScript types accurately match database schema
  4. React Query hooks available for data fetching with type safety
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Create drills and sessions tables with RLS policies in Supabase
- [x] 03-02-PLAN.md — Create TypeScript types, service layer, and QueryProvider
- [x] 03-03-PLAN.md — Create React Query hooks for drills and sessions

### Phase 4: Supabase Storage & Media Upload
**Goal**: Users can upload drill videos and images with progress tracking
**Depends on**: Phase 3
**Requirements**: MEDIA-01, MEDIA-02, MEDIA-03, MEDIA-06
**Success Criteria** (what must be TRUE):
  1. User can upload videos (MP4, MOV, M4V, WebM) up to 100MB
  2. User can upload images (JPG, PNG, GIF, WebP)
  3. Upload UI shows real-time progress indicator
  4. User can delete uploaded media files
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Create storage bucket, RLS policies, TypeScript types, and storage service
- [x] 04-02-PLAN.md — Install tus-js-client and create useMediaUpload hook with progress tracking
- [x] 04-03-PLAN.md — Create MediaUpload component with progress UI and delete functionality

### Phase 5: iOS Media Proxy (Critical)
**Goal**: Videos play reliably on iOS Safari with scrubbing support
**Depends on**: Phase 4
**Requirements**: MEDIA-04, MEDIA-05
**Success Criteria** (what must be TRUE):
  1. Videos play on iOS Safari without CORS errors
  2. Video scrubbing works on iOS (seeking to arbitrary timestamps)
  3. Backend proxy handles HTTP Range requests correctly
  4. Video URLs routed through backend proxy transparently
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — Implement media proxy route with Range request handling and CORS headers
- [x] 05-02-PLAN.md — Create frontend proxy URL utility and verify iOS Safari playback

### Phase 6: Core UI Components
**Goal**: Reusable component library with responsive layout system
**Depends on**: Phase 5
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. Layout adapts correctly on desktop, tablet, and mobile viewports
  2. All interactive elements have minimum 44px touch targets
  3. Loading states show skeleton placeholders instead of blank screens
  4. Toast notifications appear for success and error feedback
  5. Error messages use user-friendly language
**Plans**: 4 plans

Plans:
- [x] 06-01-PLAN.md — Install UI libraries, create cn() utility, setup toast and error boundary
- [x] 06-02-PLAN.md — Create Button, Input, and Skeleton UI primitive components
- [x] 06-03-PLAN.md — Create AppShell responsive layout and Container components
- [x] 06-04-PLAN.md — Wire providers into App.tsx, create demo page, verify responsive behavior

### Phase 7: Add Drill Feature
**Goal**: Users can create new drills with complete metadata and media
**Depends on**: Phase 6
**Requirements**: DRILL-01, DRILL-02, DRILL-03
**Success Criteria** (what must be TRUE):
  1. User can create drill with name and category (required fields)
  2. User can attach video or image during drill creation
  3. User can add optional metadata (num_players, equipment, tags, reference URL)
  4. Created drill appears immediately in user's drill library
**Plans**: 3 plans

Plans:
- [x] 07-01-PLAN.md — Create Zod schema, types, defaults, and TagInput component
- [x] 07-02-PLAN.md — Create DrillForm with MediaUpload integration and AddDrillPage with routing
- [x] 07-03-PLAN.md — Verify complete drill creation flow end-to-end

### Phase 8: Drill Library
**Goal**: Users can browse, search, and filter their drill collection
**Depends on**: Phase 7
**Requirements**: DRILL-04, DRILL-05, DRILL-06
**Success Criteria** (what must be TRUE):
  1. Drills display in responsive grid layout with thumbnail previews
  2. User can search drills by name with instant filtering
  3. User can filter drills by category (Activation, Dribbling, Passing, Shooting)
  4. Empty state shown when no drills match filters
**Plans**: 2 plans

Plans:
- [x] 08-01-PLAN.md — Create useDebounce hook, DrillCard, and DrillEmptyState components
- [x] 08-02-PLAN.md — Create DrillFilters, DrillGrid, DrillLibraryPage with search and filtering

### Phase 9: Drill Detail & Edit
**Goal**: Users can view full drill information and modify existing drills
**Depends on**: Phase 8
**Requirements**: DRILL-07, DRILL-08, DRILL-09
**Success Criteria** (what must be TRUE):
  1. User can view full drill details including media playback
  2. User can edit any field of existing drill
  3. User can delete drill with confirmation dialog
  4. Media playback works in detail view with iOS compatibility
**Plans**: 3 plans

Plans:
- [x] 09-01-PLAN.md — Detail page with media playback and skeleton loading states
- [x] 09-02-PLAN.md — Make DrillForm reusable for edit mode, create EditDrillPage
- [x] 09-03-PLAN.md — Delete functionality with accessible confirmation dialog

### Phase 10: Session Planner Grid
**Goal**: Users can arrange drills in 4x3 grid via drag-and-drop or click
**Depends on**: Phase 9
**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04, SESS-05
**Success Criteria** (what must be TRUE):
  1. 4x3 grid displays with labeled rows (Activation, Dribbling, Passing, Shooting)
  2. User can drag drills from library into grid cells on desktop
  3. User can drag drills from library into grid cells on iPad with touch
  4. User can click drill then click cell as alternative to dragging
  5. User can remove drill from grid cell
**Plans**: 3 plans

Plans:
- [x] 10-01-PLAN.md — Install dnd-kit, create session grid types and sensor/state hooks
- [x] 10-02-PLAN.md — Create GridCell, DraggableDrillCard, SessionGrid, DrillLibrarySidebar components
- [x] 10-03-PLAN.md — Create SessionPlannerPage with DndContext, wire routes, verify all interactions

### Phase 11: Save & Load Sessions
**Goal**: Users can persist session configurations and retrieve them later
**Depends on**: Phase 10
**Requirements**: SESS-06, SESS-07, SESS-08, SESS-09, SESS-10
**Success Criteria** (what must be TRUE):
  1. User can save current session grid with a name
  2. User can view list of all saved sessions
  3. User can load saved session to populate grid
  4. User can edit existing session (update drills and save)
  5. User can delete session with confirmation
**Plans**: 4 plans

Plans:
- [x] 11-01-PLAN.md — Install Headless UI, create reusable ConfirmDialog component
- [x] 11-02-PLAN.md — Create SessionsPage with list, empty state, delete confirmation
- [x] 11-03-PLAN.md — Create SaveSessionDialog for save/edit session functionality
- [ ] 11-04-PLAN.md — Wire save/load/edit integration into SessionPlannerPage (gap closure)

### Phase 12: Dashboard
**Goal**: Logged-in users see a landing page with quick actions
**Depends on**: Phase 11
**Requirements**: UI-06
**Success Criteria** (what must be TRUE):
  1. Dashboard displays after successful login
  2. Quick actions navigate to "Add Drill" and "New Session"
  3. Dashboard shows recent sessions or drills (if any exist)
  4. Empty state guides new users to create first drill
**Plans**: 2 plans

Plans:
- [ ] 12-01-PLAN.md — Create QuickActions, DashboardEmptyState, RecentDrills, RecentSessions components
- [ ] 12-02-PLAN.md — Wire DashboardPage with production implementation and verify

### Phase 13: Error Handling & Loading States
**Goal**: Application provides clear feedback for all user actions and system states
**Depends on**: Phase 12
**Requirements**: UI-03, UI-04, UI-05 (already partially addressed in Phase 6, reinforcing here)
**Success Criteria** (what must be TRUE):
  1. All async operations show loading indicators
  2. Network errors display user-friendly messages with retry options
  3. Validation errors highlight specific fields with helpful text
  4. Success actions show confirmation toasts
**Plans**: 3 plans

Plans:
- [x] 13-01-PLAN.md — Create getUserFriendlyError helper utility for consistent error messages
- [x] 13-02-PLAN.md — Standardize auth pages (LoginPage, SignupPage, LogoutButton) with toasts
- [x] 13-03-PLAN.md — Add toast notifications to MediaUpload component

### Phase 14: iOS/iPad Optimization
**Goal**: Application works flawlessly on iPads and iPhones in field conditions
**Depends on**: Phase 13
**Requirements**: UI-02 (reinforced), verification of MEDIA-04, MEDIA-05, SESS-03
**Success Criteria** (what must be TRUE):
  1. Touch targets meet 44px minimum on all interactive elements
  2. Drag-and-drop feels responsive on iPad with no lag
  3. Videos play and scrub correctly on iOS Safari (verified on real device)
  4. Video elements include playsInline and webkit-playsinline attributes
**Plans**: 2 plans

Plans:
- [ ] 14-01-PLAN.md — Fix touch targets on TagInput, MediaUpload, and auth page links
- [ ] 14-02-PLAN.md — Update MediaUpload video preview to use proxy URL, iOS device verification

### Phase 15: Performance Optimization
**Goal**: Application loads quickly and responds instantly on all target devices
**Depends on**: Phase 14
**Requirements**: None (polish work)
**Success Criteria** (what must be TRUE):
  1. Initial page load completes under 3 seconds on 4G connection
  2. Image thumbnails use optimized formats and lazy loading
  3. React Query caches data to minimize redundant API calls
  4. Drill library renders 100+ drills without lag
**Plans**: TBD

Plans:
- [ ] 15-01: TBD

### Phase 16: Final Testing & Launch
**Goal**: Application verified across all target platforms and deployed to production
**Depends on**: Phase 15
**Requirements**: None (verification work)
**Success Criteria** (what must be TRUE):
  1. Application tested on Chrome, Safari, Firefox, Edge (desktop)
  2. Application tested on iPad Safari and Chrome (real devices)
  3. Application tested on iPhone Safari and Android Chrome
  4. Production deployment verified with real drill and session creation
**Plans**: 4 plans

Plans:
- [ ] 16-01-PLAN.md — Verify backend proxy Range requests and production environment
- [ ] 16-02-PLAN.md — Execute desktop browser testing (Chrome, Safari, Firefox, Edge)
- [ ] 16-03-PLAN.md — Execute mobile/tablet testing via BrowserStack (iPad, iPhone, Android)
- [ ] 16-04-PLAN.md — Final production smoke tests and launch verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → ... → 16

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Setup & Infrastructure | 4/4 | ✓ Complete | 2026-01-27 |
| 2. Authentication System | 3/3 | ✓ Complete | 2026-01-27 |
| 3. Database Schema & Services | 3/3 | ✓ Complete | 2026-01-27 |
| 4. Supabase Storage & Media Upload | 3/3 | ✓ Complete | 2026-01-27 |
| 5. iOS Media Proxy | 2/2 | ✓ Complete | 2026-01-27 |
| 6. Core UI Components | 4/4 | ✓ Complete | 2026-01-27 |
| 7. Add Drill Feature | 3/3 | ✓ Complete | 2026-01-28 |
| 8. Drill Library | 2/2 | ✓ Complete | 2026-01-28 |
| 9. Drill Detail & Edit | 3/3 | ✓ Complete | 2026-01-28 |
| 10. Session Planner Grid | 3/3 | ✓ Complete | 2026-01-28 |
| 11. Save & Load Sessions | 3/4 | Gap closure | - |
| 12. Dashboard | 0/2 | Not started | - |
| 13. Error Handling & Loading States | 3/3 | ✓ Complete | 2026-01-28 |
| 14. iOS/iPad Optimization | 0/2 | Not started | - |
| 15. Performance Optimization | 0/? | Not started | - |
| 16. Final Testing & Launch | 0/4 | Not started | - |
