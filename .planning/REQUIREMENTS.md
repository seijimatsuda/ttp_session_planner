# Requirements: Soccer Session Planner

**Defined:** 2026-01-22
**Core Value:** Coaches can quickly build and save training session plans by dragging drills into a visual grid, accessible from any device including iPads on the field.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email/password
- [ ] **AUTH-02**: User can log in with email/password
- [ ] **AUTH-03**: User session persists across browser refreshes
- [ ] **AUTH-04**: Protected routes redirect unauthenticated users to login
- [ ] **AUTH-05**: User can log out from any page

### Database & Services

- [ ] **DATA-01**: Drills table with RLS (users access own data only)
- [ ] **DATA-02**: Sessions table with RLS (users access own data only)
- [ ] **DATA-03**: TypeScript types match database schema
- [ ] **DATA-04**: React Query hooks for data fetching

### Media & Storage

- [ ] **MEDIA-01**: User can upload drill videos (MP4, MOV, M4V, WebM up to 100MB)
- [ ] **MEDIA-02**: User can upload drill images (JPG, PNG, GIF, WebP)
- [ ] **MEDIA-03**: Upload shows progress indicator
- [ ] **MEDIA-04**: Videos play on iOS Safari via backend proxy
- [ ] **MEDIA-05**: Video scrubbing works on iOS (Range request support)
- [ ] **MEDIA-06**: User can delete uploaded media

### Drills

- [ ] **DRILL-01**: User can add drill with name and category (required)
- [ ] **DRILL-02**: User can add drill with media upload
- [ ] **DRILL-03**: User can add drill metadata (num_players, equipment, tags, reference URL)
- [ ] **DRILL-04**: User can view drill library in responsive grid
- [ ] **DRILL-05**: User can search drills by name
- [ ] **DRILL-06**: User can filter drills by category
- [ ] **DRILL-07**: User can view full drill details with media playback
- [ ] **DRILL-08**: User can edit existing drill (all fields)
- [ ] **DRILL-09**: User can delete drill (with confirmation)

### Sessions

- [ ] **SESS-01**: User can create session with 4x3 grid (Activation/Dribbling/Passing/Shooting rows)
- [ ] **SESS-02**: User can drag drills into grid cells (desktop)
- [ ] **SESS-03**: User can drag drills into grid cells (iPad touch)
- [ ] **SESS-04**: User can click to add drill to grid cell (alternative to drag)
- [ ] **SESS-05**: User can remove drill from grid cell
- [ ] **SESS-06**: User can save session with name
- [ ] **SESS-07**: User can view list of saved sessions
- [ ] **SESS-08**: User can load and view saved session
- [ ] **SESS-09**: User can edit existing session
- [ ] **SESS-10**: User can delete session

### UI & Polish

- [ ] **UI-01**: Responsive layout works on desktop, tablet, mobile
- [ ] **UI-02**: All touch targets minimum 44px (iOS accessibility)
- [ ] **UI-03**: Loading states with skeletons (no jarring flashes)
- [ ] **UI-04**: Toast notifications for success/error feedback
- [ ] **UI-05**: User-friendly error messages
- [ ] **UI-06**: Dashboard with quick actions after login

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Collaboration

- **COLLAB-01**: User can share drills with other coaches
- **COLLAB-02**: User can clone shared drills to their library
- **COLLAB-03**: User can share session plans

### Offline

- **OFFLINE-01**: App works offline with cached data
- **OFFLINE-02**: Changes sync when connection restored

### Export

- **EXPORT-01**: User can export session to PDF
- **EXPORT-02**: User can print session plan

### Analytics

- **ANALYTICS-01**: User can see drill usage statistics
- **ANALYTICS-02**: User can see session history

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native mobile apps | Web-first approach, PWA possible later |
| Video editing/trimming | Storage complexity, use external tools |
| Real-time collaboration | Complexity, single-user sessions for v1 |
| Social features (comments, likes) | Not core to coaching workflow |
| Drill marketplace | Business model complexity |
| Team management | Defer to v2, focus on individual coaches |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| DATA-01 | Phase 3 | Pending |
| DATA-02 | Phase 3 | Pending |
| DATA-03 | Phase 3 | Pending |
| DATA-04 | Phase 3 | Pending |
| MEDIA-01 | Phase 4 | Pending |
| MEDIA-02 | Phase 4 | Pending |
| MEDIA-03 | Phase 4 | Pending |
| MEDIA-04 | Phase 5 | Pending |
| MEDIA-05 | Phase 5 | Pending |
| MEDIA-06 | Phase 4 | Pending |
| DRILL-01 | Phase 7 | Pending |
| DRILL-02 | Phase 7 | Pending |
| DRILL-03 | Phase 7 | Pending |
| DRILL-04 | Phase 8 | Pending |
| DRILL-05 | Phase 8 | Pending |
| DRILL-06 | Phase 8 | Pending |
| DRILL-07 | Phase 9 | Pending |
| DRILL-08 | Phase 9 | Pending |
| DRILL-09 | Phase 9 | Pending |
| SESS-01 | Phase 10 | Pending |
| SESS-02 | Phase 10 | Pending |
| SESS-03 | Phase 10 | Pending |
| SESS-04 | Phase 10 | Pending |
| SESS-05 | Phase 10 | Pending |
| SESS-06 | Phase 11 | Pending |
| SESS-07 | Phase 11 | Pending |
| SESS-08 | Phase 11 | Pending |
| SESS-09 | Phase 11 | Pending |
| SESS-10 | Phase 11 | Pending |
| UI-01 | Phase 6 | Pending |
| UI-02 | Phase 6 | Pending |
| UI-03 | Phase 13 | Pending |
| UI-04 | Phase 13 | Pending |
| UI-05 | Phase 13 | Pending |
| UI-06 | Phase 12 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0

---
*Requirements defined: 2026-01-22*
*Last updated: 2026-01-22 after initial definition*
