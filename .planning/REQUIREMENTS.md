# Requirements: Soccer Session Planner

**Defined:** 2026-01-22
**Core Value:** Coaches can quickly build and save training session plans by dragging drills into a visual grid, accessible from any device including iPads on the field.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can sign up with email/password
- [x] **AUTH-02**: User can log in with email/password
- [x] **AUTH-03**: User session persists across browser refreshes
- [x] **AUTH-04**: Protected routes redirect unauthenticated users to login
- [x] **AUTH-05**: User can log out from any page

### Database & Services

- [x] **DATA-01**: Drills table with RLS (users access own data only)
- [x] **DATA-02**: Sessions table with RLS (users access own data only)
- [x] **DATA-03**: TypeScript types match database schema
- [x] **DATA-04**: React Query hooks for data fetching

### Media & Storage

- [x] **MEDIA-01**: User can upload drill videos (MP4, MOV, M4V, WebM up to 100MB)
- [x] **MEDIA-02**: User can upload drill images (JPG, PNG, GIF, WebP)
- [x] **MEDIA-03**: Upload shows progress indicator
- [x] **MEDIA-04**: Videos play on iOS Safari via backend proxy
- [x] **MEDIA-05**: Video scrubbing works on iOS (Range request support)
- [x] **MEDIA-06**: User can delete uploaded media

### Drills

- [x] **DRILL-01**: User can add drill with name and category (required)
- [x] **DRILL-02**: User can add drill with media upload
- [x] **DRILL-03**: User can add drill metadata (num_players, equipment, tags, reference URL)
- [x] **DRILL-04**: User can view drill library in responsive grid
- [x] **DRILL-05**: User can search drills by name
- [x] **DRILL-06**: User can filter drills by category
- [x] **DRILL-07**: User can view full drill details with media playback
- [x] **DRILL-08**: User can edit existing drill (all fields)
- [x] **DRILL-09**: User can delete drill (with confirmation)

### Sessions

- [x] **SESS-01**: User can create session with 4x3 grid (Activation/Dribbling/Passing/Shooting rows)
- [x] **SESS-02**: User can drag drills into grid cells (desktop)
- [x] **SESS-03**: User can drag drills into grid cells (iPad touch)
- [x] **SESS-04**: User can click to add drill to grid cell (alternative to drag)
- [x] **SESS-05**: User can remove drill from grid cell
- [ ] **SESS-06**: User can save session with name
- [ ] **SESS-07**: User can view list of saved sessions
- [ ] **SESS-08**: User can load and view saved session
- [ ] **SESS-09**: User can edit existing session
- [ ] **SESS-10**: User can delete session

### UI & Polish

- [x] **UI-01**: Responsive layout works on desktop, tablet, mobile
- [x] **UI-02**: All touch targets minimum 44px (iOS accessibility)
- [x] **UI-03**: Loading states with skeletons (no jarring flashes)
- [x] **UI-04**: Toast notifications for success/error feedback
- [x] **UI-05**: User-friendly error messages
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
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| AUTH-04 | Phase 2 | Complete |
| AUTH-05 | Phase 2 | Complete |
| DATA-01 | Phase 3 | Complete |
| DATA-02 | Phase 3 | Complete |
| DATA-03 | Phase 3 | Complete |
| DATA-04 | Phase 3 | Complete |
| MEDIA-01 | Phase 4 | Complete |
| MEDIA-02 | Phase 4 | Complete |
| MEDIA-03 | Phase 4 | Complete |
| MEDIA-04 | Phase 5 | Complete |
| MEDIA-05 | Phase 5 | Complete |
| MEDIA-06 | Phase 4 | Complete |
| DRILL-01 | Phase 7 | Complete |
| DRILL-02 | Phase 7 | Complete |
| DRILL-03 | Phase 7 | Complete |
| DRILL-04 | Phase 8 | Complete |
| DRILL-05 | Phase 8 | Complete |
| DRILL-06 | Phase 8 | Complete |
| DRILL-07 | Phase 9 | Complete |
| DRILL-08 | Phase 9 | Complete |
| DRILL-09 | Phase 9 | Complete |
| SESS-01 | Phase 10 | Complete |
| SESS-02 | Phase 10 | Complete |
| SESS-03 | Phase 10 | Complete |
| SESS-04 | Phase 10 | Complete |
| SESS-05 | Phase 10 | Complete |
| SESS-06 | Phase 11 | Pending |
| SESS-07 | Phase 11 | Pending |
| SESS-08 | Phase 11 | Pending |
| SESS-09 | Phase 11 | Pending |
| SESS-10 | Phase 11 | Pending |
| UI-01 | Phase 6 | Complete |
| UI-02 | Phase 6 | Complete |
| UI-03 | Phase 6 | Complete |
| UI-04 | Phase 6 | Complete |
| UI-05 | Phase 6 | Complete |
| UI-06 | Phase 12 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0

---
*Requirements defined: 2026-01-22*
*Last updated: 2026-01-28 after Phase 7 completion*
