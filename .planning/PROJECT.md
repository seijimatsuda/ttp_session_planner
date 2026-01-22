# Soccer Session Planner

## What This Is

A web application for soccer coaches to organize training drills and build structured practice sessions. Coaches upload drill videos/images, categorize them by type (activation, dribbling, passing, shooting), and arrange them in a visual 4x3 grid to plan training sessions. Multi-user with each coach managing their own drill library and sessions.

## Core Value

Coaches can quickly build and save training session plans by dragging drills into a visual grid, accessible from any device including iPads on the field.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User authentication (signup, login, session persistence)
- [ ] Drill management (add, view, edit, delete drills with media)
- [ ] Media upload (video/image with progress tracking, iOS-compatible)
- [ ] Drill categorization (activation, dribbling, passing, shooting)
- [ ] Drill metadata (name, category, num_players, equipment, tags)
- [ ] Drill library with search and category filtering
- [ ] Session planner with 4x3 drag-and-drop grid
- [ ] Session save/load functionality
- [ ] iOS Safari video playback (via backend proxy with Range requests)
- [ ] iPad touch-friendly drag-and-drop
- [ ] Responsive design (desktop, tablet, mobile)

### Out of Scope

- Team collaboration (sharing drills between coaches) — complexity, defer to v2
- Offline mode with sync — complexity, defer to v2
- Native mobile apps — web-first approach
- Video editing/trimming — storage complexity
- Drill analytics/usage tracking — defer to v2
- Export to PDF/print — defer to v2

## Context

**Rebuild context:** This is a v2 rebuild. Previous version had iOS Safari video playback issues (CORS, Range requests) that required a backend proxy pattern. This architecture is baked into the plan from the start.

**Target platforms:**
- Desktop: macOS, Windows (Chrome, Safari, Firefox, Edge)
- Tablet: iPad (Safari, Chrome) — primary field use case
- Mobile: iPhone, Android (Safari, Chrome)

**iOS-specific requirements:**
- Backend proxy for video streaming (Supabase signed URLs fail on iOS)
- HTTP Range request support for video scrubbing
- `playsInline` and `webkit-playsinline` video attributes
- Minimum 44px touch targets
- MP4/MOV video formats (not WebM)

**Grid structure:**
```
| Row          | Col 1 | Col 2 | Col 3 |
|--------------|-------|-------|-------|
| Activation   |  [ ]  |  [ ]  |  [ ]  |
| Dribbling    |  [ ]  |  [ ]  |  [ ]  |
| Passing      |  [ ]  |  [ ]  |  [ ]  |
| Shooting     |  [ ]  |  [ ]  |  [ ]  |
```

## Constraints

- **Tech stack**: React 18+ with Vite, TypeScript strict, Tailwind CSS — decided
- **Backend**: Express.js with TypeScript — required for iOS video proxy
- **Database**: Supabase PostgreSQL with RLS — multi-tenant isolation
- **Storage**: Supabase Storage — integrated with auth
- **Auth**: Supabase Auth — email/password
- **Hosting**: Vercel (frontend), Render (backend) — accounts exist
- **Drag & Drop**: @dnd-kit — touch-friendly, React-native
- **File size**: 100MB max uploads
- **Video formats**: MP4, MOV, M4V, WebM (MP4/MOV preferred for iOS)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Backend proxy for videos | iOS Safari fails with direct Supabase signed URLs due to CORS/Range issues | — Pending |
| Express over Hono | More mature ecosystem, easier debugging for video streaming edge cases | — Pending |
| @dnd-kit over react-beautiful-dnd | Better touch support, actively maintained, smaller bundle | — Pending |
| Supabase over Firebase | Better PostgreSQL, simpler RLS, integrated storage | — Pending |
| Row-based grid (4 rows fixed) | Matches coaching workflow: warmup → skill work → finishing | — Pending |

---
*Last updated: 2026-01-22 after initialization*
