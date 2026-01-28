# Phase 16: Final Testing & Launch - Research

**Researched:** 2026-01-27
**Domain:** Production deployment verification, cross-browser testing, quality assurance
**Confidence:** HIGH

## Summary

Phase 16 focuses on comprehensive manual testing across all target browsers and devices, followed by production deployment verification. This is a verification-only phase with no new feature development - it validates that all v1 requirements (AUTH-01 through UI-06) work correctly in production environments on real devices.

The standard approach for 2026 combines manual cross-browser testing on real devices with automated smoke tests for production verification. Key challenges include iOS Safari video playback validation (Range requests), iPad touch interaction testing, and ensuring the backend proxy works correctly in production with real network conditions.

This phase differs from typical automated E2E testing approaches because: (1) the app has iOS-specific video requirements that require real device testing, (2) drag-and-drop with touch interactions on iPad needs manual verification, (3) production environment differences (CORS, signed URLs, Range requests) can't be fully simulated locally, and (4) the phase validates an already-built system rather than building new features.

**Primary recommendation:** Create a structured manual test plan organized by user workflow (auth → drill CRUD → session planning), execute tests systematically across browser matrix (Chrome/Safari/Firefox/Edge desktop + iPad/iPhone real devices), use BrowserStack for device coverage, and deploy production smoke tests to validate critical paths post-deployment.

## Standard Stack

This phase primarily uses manual testing with cloud device platforms rather than automated test frameworks. The focus is verification, not test automation infrastructure.

### Core Testing Tools

| Tool | Purpose | Why Standard |
|------|---------|--------------|
| BrowserStack Live | Real device testing (iOS/Android) | Industry-leading real device cloud, supports 3000+ devices including latest iPads/iPhones, no complex setup |
| Chrome DevTools | Desktop browser testing & debugging | Built-in, comprehensive, network throttling, mobile emulation |
| Safari Web Inspector | iOS Safari debugging | Only official tool for Safari, required for Range request debugging |
| Manual Test Cases | Structured test execution | Excel/Google Sheets templates are industry standard for UAT |

### Supporting Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| curl | Test Range request support | Validate video proxy endpoint returns 206 Partial Content |
| Playwright (optional) | Automated smoke tests | Post-deployment verification of critical paths (optional for this phase) |
| Browser extensions | Network inspection | Debugging CORS, signed URL expiry, media streaming issues |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| BrowserStack | LambdaTest, Sauce Labs | BrowserStack has better iOS device coverage and Safari debugging tools |
| Manual testing | Full Playwright E2E suite | Automated tests require significant setup time; this phase validates one-time launch readiness, not CI/CD regression suite |
| Real devices | iOS Simulator | Simulators don't accurately reproduce Range request behavior, video codec issues, or touch interaction quirks |

**Installation:**

BrowserStack is cloud-based (no installation). For optional automated smoke tests:

```bash
# Frontend (optional - not required for Phase 16)
cd frontend
npm install -D @playwright/test

# Backend - no additional dependencies needed
# curl is pre-installed on macOS/Linux
```

## Architecture Patterns

### Manual Test Plan Structure

Organize test cases by user workflow, not by technical layer. This ensures end-to-end validation and catches integration issues.

```
test-plan/
├── 01-authentication.md          # Signup, login, logout, session persistence
├── 02-drill-management.md        # Create, view, edit, delete drills
├── 03-media-upload-playback.md   # Upload videos/images, playback on iOS
├── 04-drill-library.md           # Search, filter, grid display
├── 05-session-planner.md         # Drag-and-drop, click-to-place, save/load
└── 06-production-smoke.md        # Post-deployment verification checklist
```

### Test Case Template Pattern

**Standard UAT test case format (industry standard 2026):**

```markdown
## Test Case ID: TC-[Area]-[Number]

**Priority:** High/Medium/Low
**Preconditions:** [What must be true before test starts]
**Test Steps:**
1. [Action]
2. [Action]
3. [Action]

**Expected Results:**
- [What should happen after step 1]
- [What should happen after step 2]
- [What should happen after step 3]

**Actual Results:** [Filled during execution]
**Status:** Pass/Fail/Blocked
**Browser/Device:** [e.g., "iPad Pro 12.9 iOS 18 - Safari"]
**Notes:** [Any observations, screenshots, logs]
```

### Browser Matrix Pattern

**Desktop browsers:**
```
Chrome (latest) - Windows 10, macOS
Safari (latest) - macOS only
Firefox (latest) - Windows 10, macOS
Edge (latest) - Windows 10
```

**Mobile/Tablet (real devices via BrowserStack):**
```
iPad Safari - iPad Pro 12.9 (iOS 17+), iPad Air (iOS 17+)
iPad Chrome - iPad Pro 12.9 (iOS 17+)
iPhone Safari - iPhone 15 Pro, iPhone 13 (iOS 17+)
Android Chrome - Samsung Galaxy S23, Pixel 7
```

### Smoke Test Pattern (Post-Deployment)

**Critical path validation (5-10 minutes):**

```typescript
// Example structure (not implemented in Phase 16, just reference)
const smokeTests = [
  {
    name: "Health check endpoints",
    steps: [
      "GET https://ttp-session-planner.vercel.app (expect 200)",
      "GET https://ttp-session-planner.onrender.com/health (expect 200)"
    ]
  },
  {
    name: "User can sign up",
    steps: [
      "Navigate to /signup",
      "Fill email/password",
      "Submit form (expect redirect to /drills or /dashboard)"
    ]
  },
  {
    name: "User can create drill",
    steps: [
      "Login",
      "Navigate to /drills/new",
      "Fill required fields (name, category)",
      "Submit (expect redirect to drill detail)"
    ]
  },
  {
    name: "Video playback on iOS (manual)",
    steps: [
      "Create drill with video on iOS Safari",
      "Navigate to drill detail",
      "Play video (expect inline playback, no CORS errors)",
      "Scrub video (expect seek to work)"
    ]
  }
];
```

### Anti-Patterns to Avoid

- **Testing locally only:** Production environment has different CORS, signed URLs, SSL, and network conditions. Always test in production after deployment.
- **Emulator-only iOS testing:** iOS Simulator doesn't reproduce video Range request behavior or touch interactions accurately. Use real devices via BrowserStack.
- **Browser matrix explosion:** Focus on target browsers from PROJECT.md. Don't test IE11 or outdated Android versions unless user analytics show significant traffic.
- **Skipping manual video testing:** The backend proxy for iOS is the most critical technical risk. Must manually verify on real iPad/iPhone in production.
- **No rollback plan:** Always document rollback procedure and test it before launch.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-browser test execution | Custom Selenium grid | BrowserStack Live (manual) or BrowserStack Automate (if automating later) | Maintaining browser versions and real devices is expensive and time-consuming |
| Test case management | Custom spreadsheet system | Google Sheets with template (free) or TestRail/Zephyr (enterprise) | Structured templates with standard fields (ID, priority, steps, expected results) already exist |
| Video Range request validation | Manual browser testing only | curl commands to verify 206 responses | Faster to debug proxy issues with curl than repeatedly testing in browser |
| Production monitoring | Manual checks | Vercel Analytics + Render logs + Sentry (if needed later) | Platforms provide built-in monitoring; manual checks are for one-time launch verification |
| Smoke test automation | Custom bash scripts | Playwright (if automating) | Playwright handles browser automation, screenshots, and retries better than bash+curl |

**Key insight:** This phase is verification work, not infrastructure building. Use lightweight tools (manual testing, curl, browser DevTools) and avoid over-engineering test automation for a one-time launch validation. If the team wants continuous regression testing later, that's a separate initiative (post-v1).

## Common Pitfalls

### Pitfall 1: iOS Video Playback Fails in Production But Works Locally

**What goes wrong:** Videos play fine in local development but fail on iOS Safari in production with errors like "This video cannot be played" or network errors.

**Why it happens:**
- Backend proxy not handling Range requests correctly (returns 200 instead of 206)
- CORS headers missing or incorrect on production backend
- Signed URL expiry too short (Supabase URLs expire before video loads)
- Backend deployed but environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY) not set

**How to avoid:**
1. Test the proxy endpoint directly with curl before browser testing:
   ```bash
   # Should return "HTTP/2 206" (Partial Content)
   curl -I --range 0-99 https://ttp-session-planner.onrender.com/api/media/drills/[bucket]/[path]
   ```
2. Check Response Headers include: `Accept-Ranges: bytes`, `Content-Range: bytes 0-99/[total]`
3. Verify CORS headers include: `Access-Control-Expose-Headers: Content-Range, Accept-Ranges, Content-Length`
4. Test on real iPad/iPhone via BrowserStack immediately after production deployment

**Warning signs:**
- Video element shows spinner indefinitely
- Safari console shows CORS errors or 403/404 on video requests
- Video plays for 1 second then stops (indicates Range request failure)
- curl returns 200 instead of 206 for Range requests

### Pitfall 2: Environment Variables Not Set in Production

**What goes wrong:** Application deploys successfully but features fail because environment variables (API keys, database URLs) aren't configured in Vercel/Render.

**Why it happens:**
- Variables work in `.env.local` during development but weren't added to Vercel/Render dashboards
- Variable names have typos (VITE_SUPABASE_URL vs VITE_SUPABASE_URI)
- Backend expects SERVICE_ROLE_KEY but Render has SUPABASE_SERVICE_KEY

**How to avoid:**
1. Create checklist of all required variables:
   - **Frontend (Vercel):** VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_BACKEND_URL
   - **Backend (Render):** SUPABASE_URL, SUPABASE_SERVICE_KEY, FRONTEND_URL (for CORS)
2. Verify each variable in production deployment logs (Render shows env vars loaded at startup)
3. Test with health endpoint that checks critical variables are present (don't expose values, just presence)

**Warning signs:**
- "TypeError: Cannot read property 'from' of undefined" (Supabase client not initialized)
- CORS errors on API requests (FRONTEND_URL not set)
- 401 Unauthorized from Supabase (wrong anon key)

### Pitfall 3: Drag-and-Drop Doesn't Work on iPad Touch

**What goes wrong:** Drag-and-drop works perfectly on desktop Chrome but doesn't respond to touch gestures on iPad Safari.

**Why it happens:**
- TouchSensor not configured in @dnd-kit (defaults to PointerSensor)
- Touch activation delay too short (user taps and drags before sensor activates)
- Conflicting touch handlers (scroll vs drag)

**How to avoid:**
- Verify TouchSensor configuration in SessionPlannerPage (already implemented in Phase 10):
  ```typescript
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );
  ```
- Test on real iPad via BrowserStack (not Chrome DevTools mobile emulation)
- Verify click-to-place alternative works (tap drill, tap cell) if drag fails

**Warning signs:**
- iPad scroll triggers instead of drag
- Dragging starts but drops immediately
- No drag preview appears on iPad
- Works in Chrome DevTools mobile mode but not on real device

### Pitfall 4: Production Deployment Appears Successful But Serves Stale Code

**What goes wrong:** Code changes deployed to Vercel/Render but users still see old version of the app.

**Why it happens:**
- Browser cache serving stale index.html or JavaScript bundles
- CDN cache not invalidated (Vercel Edge Cache)
- Build succeeded but deployment didn't promote to production (staging URL vs production URL)

**How to avoid:**
1. Test in private/incognito browser window immediately after deployment
2. Check deployment URL in Vercel dashboard matches production domain
3. Hard refresh (Cmd+Shift+R) to bypass cache
4. Use Vercel deployment preview URL first, then promote to production
5. Check Network tab in DevTools for Cache-Control headers

**Warning signs:**
- Git commit shows merged but changes not visible
- Deployment logs show "Build completed" but app behavior unchanged
- Different behavior on deployment preview URL vs production URL

### Pitfall 5: SSL Certificate or HTTPS Misconfiguration

**What goes wrong:** Mixed content warnings, "Not Secure" browser warnings, or APIs blocked by browser security policies.

**Why it happens:**
- Frontend loads over HTTPS but backend uses HTTP (mixed content)
- Backend doesn't enforce HTTPS redirects
- Hardcoded HTTP URLs in code (should use environment variables)

**How to avoid:**
1. Verify all environment variables use `https://` protocol:
   - VITE_BACKEND_URL should be `https://ttp-session-planner.onrender.com`
   - VITE_SUPABASE_URL should be `https://cvzffawyjrgubhkzuwkd.supabase.co`
2. Test in browser console: no mixed content warnings
3. Check Network tab: all requests use HTTPS

**Warning signs:**
- Browser address bar shows "Not Secure" or warning icon
- Console errors: "Mixed Content: The page was loaded over HTTPS, but requested an insecure resource"
- API requests blocked by browser

## Code Examples

Verified patterns for Phase 16 testing tasks:

### Testing Video Range Requests with curl

```bash
# Test backend proxy endpoint supports Range requests
# Expected: HTTP/2 206 (Partial Content)
curl -I --range 0-99 https://ttp-session-planner.onrender.com/api/media/drills/[bucket]/[path].mp4

# Expected response headers:
# HTTP/2 206
# Accept-Ranges: bytes
# Content-Range: bytes 0-99/[total-size]
# Content-Length: 100
# Access-Control-Expose-Headers: Content-Range, Accept-Ranges, Content-Length

# If you see HTTP/2 200 instead of 206, Range requests are NOT working
# This will cause iOS Safari video playback to fail
```

### Manual Test Case Example: iOS Video Playback

```markdown
## Test Case ID: TC-MEDIA-001

**Priority:** High (Critical iOS requirement)
**Device:** iPad Pro 12.9, iOS 18, Safari
**Preconditions:**
- User logged in
- At least one drill exists with video uploaded

**Test Steps:**
1. Navigate to Drill Library (/drills)
2. Click on a drill card that has a video thumbnail
3. Wait for drill detail page to load
4. Click play button on video player
5. Wait for video to start playing
6. Drag video scrubber to 50% position
7. Drag video scrubber to 75% position
8. Pause video

**Expected Results:**
- After step 4: Video plays inline (not fullscreen), no console errors
- After step 6: Video seeks to 50% position without reloading
- After step 7: Video seeks to 75% position without reloading
- After step 8: Video pauses, no errors logged

**Actual Results:** [Fill during execution]
**Status:** [Pass/Fail/Blocked]
**Notes:**
- Check Safari console for CORS errors
- Check Network tab for 206 Partial Content responses
- Screenshot any error messages
```

### Smoke Test Checklist (Post-Deployment)

```markdown
# Production Smoke Tests - Phase 16

Execute immediately after production deployment. Estimated time: 15 minutes.

## Environment URLs
- Frontend: https://ttp-session-planner.vercel.app
- Backend: https://ttp-session-planner.onrender.com
- Supabase: https://cvzffawyjrgubhkzuwkd.supabase.co

## Pre-Deployment Checklist
- [ ] Verify environment variables set in Vercel dashboard
- [ ] Verify environment variables set in Render dashboard
- [ ] Backend health endpoint returns 200
- [ ] Frontend builds successfully in Vercel logs
- [ ] Rollback plan documented and ready

## Smoke Tests (Critical Path)

### 1. Health Checks
- [ ] GET https://ttp-session-planner.vercel.app → 200 OK (loads React app)
- [ ] GET https://ttp-session-planner.onrender.com/health → 200 OK

### 2. Authentication Flow
- [ ] Navigate to /signup
- [ ] Create new account (email: test+[timestamp]@example.com)
- [ ] Verify redirect to /drills or /dashboard
- [ ] Logout
- [ ] Login with same credentials
- [ ] Verify session persists after page refresh

### 3. Drill Creation
- [ ] Navigate to /drills/new
- [ ] Fill name: "Smoke Test Drill"
- [ ] Select category: "Passing"
- [ ] Submit form
- [ ] Verify redirect to drill detail page
- [ ] Verify drill appears in /drills library

### 4. Media Upload
- [ ] Edit the smoke test drill
- [ ] Upload a test video (< 10MB)
- [ ] Verify upload progress bar shows
- [ ] Verify upload completes successfully
- [ ] Navigate to drill detail
- [ ] Verify video thumbnail loads
- [ ] Click play - verify video plays

### 5. Session Planner
- [ ] Navigate to /sessions/new
- [ ] Verify drill library sidebar loads
- [ ] Drag smoke test drill into grid cell
- [ ] Verify drill appears in grid
- [ ] Save session with name: "Smoke Test Session"
- [ ] Navigate to /sessions
- [ ] Verify saved session appears in list

### 6. iOS Safari (BrowserStack)
- [ ] Open BrowserStack Live
- [ ] Select iPad Pro 12.9, iOS 18, Safari
- [ ] Navigate to production URL
- [ ] Login with smoke test account
- [ ] Play video in drill detail
- [ ] Verify video plays inline (not fullscreen)
- [ ] Verify video scrubbing works
- [ ] Test drag-and-drop in session planner
- [ ] Test click-to-place in session planner

## Post-Deployment Monitoring (First 24 Hours)
- [ ] Check Vercel Analytics for error rate (expect < 1%)
- [ ] Check Render logs for uncaught exceptions
- [ ] Monitor response times (expect < 3s for initial load)
- [ ] Verify no CORS errors in production logs

## Rollback Criteria
If any of these occur, rollback immediately:
- Authentication fails for all users (500 errors)
- Video upload returns 500 for all attempts
- iOS Safari video playback fails completely (not just slow)
- Database connection errors (Supabase unreachable)
```

### Browser Testing Matrix Template

```markdown
# Browser Testing Matrix - Phase 16

Test all critical user flows across browser matrix. Document pass/fail for each combination.

## Legend
✅ Pass | ❌ Fail | ⚠️ Issues | ⬜ Not Tested

## Desktop Browsers

| Test Case | Chrome (Win) | Chrome (Mac) | Safari (Mac) | Firefox (Win) | Firefox (Mac) | Edge (Win) |
|-----------|--------------|--------------|--------------|---------------|---------------|------------|
| Signup/Login | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Create Drill | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Upload Video | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Upload Image | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Video Playback | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Search/Filter Drills | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Drag-Drop (Mouse) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Save Session | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Load Session | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

## Mobile/Tablet (Real Devices via BrowserStack)

| Test Case | iPad Safari | iPad Chrome | iPhone Safari | Android Chrome |
|-----------|-------------|-------------|---------------|----------------|
| Signup/Login | ⬜ | ⬜ | ⬜ | ⬜ |
| Create Drill | ⬜ | ⬜ | ⬜ | ⬜ |
| Upload Video | ⬜ | ⬜ | ⬜ | ⬜ |
| Video Playback | ⬜ | ⬜ | ⬜ | ⬜ |
| Video Scrubbing | ⬜ | ⬜ | ⬜ | ⬜ |
| Touch Targets (44px min) | ⬜ | ⬜ | ⬜ | ⬜ |
| Drag-Drop (Touch) | ⬜ | ⬜ | ⬜ | ⬜ |
| Click-to-Place | ⬜ | ⬜ | ⬜ | ⬜ |
| Save Session | ⬜ | ⬜ | ⬜ | ⬜ |

## Notes Template

**Browser/Device:** [e.g., iPad Pro 12.9 iOS 18 Safari]
**Test Case:** [e.g., Video Playback]
**Status:** ✅ Pass / ❌ Fail / ⚠️ Issues
**Details:** [Describe any issues, screenshots, console errors]
**Resolution:** [If failed, what needs to be fixed]
```

## State of the Art

| Old Approach | Current Approach (2026) | When Changed | Impact |
|--------------|-------------------------|--------------|--------|
| Local Selenium grid | BrowserStack/LambdaTest cloud | 2020-2021 | Eliminated infrastructure maintenance, instant access to latest devices |
| Automated E2E test-first | Manual UAT for launch + selective E2E automation | 2023-2024 | Faster time-to-launch for MVPs; automation reserved for critical regression testing |
| Emulator-only iOS testing | Real device testing via cloud | 2019-2020 | Caught iOS-specific bugs (video playback, touch gestures) that simulators miss |
| Comprehensive browser matrix | Focused browser matrix based on analytics | 2022-2023 | Reduced test time 40-60%; ignore legacy browsers unless data shows usage |
| Manual environment variable tracking | Infrastructure-as-Code + secret managers | 2023-2024 | Reduced deployment errors, eliminated "works on my machine" issues |

**Deprecated/outdated:**
- **Selenium Grid self-hosting**: Maintaining browser versions and OS images is now considered technical debt. BrowserStack/LambdaTest are standard.
- **Testing on IE11**: Microsoft ended IE11 support in 2022. Unless analytics show > 5% traffic from IE11, skip it.
- **Automated visual regression testing for MVPs**: Tools like Percy/Chromatic are valuable for mature products but overkill for v1 launch verification.
- **Universal browser support**: "Works everywhere" is no longer realistic. Define target browser matrix from PROJECT.md, test those, ignore others.

## Open Questions

Things that couldn't be fully resolved:

1. **Should we implement automated smoke tests (Playwright) or stick with manual testing?**
   - What we know: Playwright can automate critical paths (signup, create drill, etc.) and run on BrowserStack. Setup time is ~2-4 hours for basic suite.
   - What's unclear: Is this a one-time launch or will there be ongoing deployments requiring regression testing? Manual testing is sufficient for one-time launch verification.
   - Recommendation: Start with manual testing in Phase 16. If post-launch monitoring shows frequent regressions or team plans weekly deployments, add Playwright in a separate phase (post-v1).

2. **What's the expected Render cold start time for the backend proxy?**
   - What we know: Render free tier has cold starts (10-30 seconds) when backend idle > 15 minutes. This affects first video load.
   - What's unclear: Is the backend on a paid plan or free tier? Cold starts could cause iOS video playback to timeout.
   - Recommendation: Test video playback twice during smoke tests: (1) immediately after deployment (warm), (2) after 15 minutes idle (cold start). Document cold start behavior in PLAN.md. If unacceptable, upgrade Render plan or add keepalive ping.

3. **Should we test video upload on mobile devices or only desktop?**
   - What we know: iOS Safari file upload works but has quirks (different file picker UI). Upload progress may not display correctly on mobile network (4G vs WiFi).
   - What's unclear: Is mobile upload a critical use case? PROJECT.md says "accessible from any device including iPads on the field" but upload may happen before field sessions.
   - Recommendation: Test video upload on iPad Safari via BrowserStack. If it works, document. If issues found, add "mobile upload limitations" to known issues. Don't block launch unless completely broken.

4. **What's the rollback procedure if production deployment has critical issues?**
   - What we know: Vercel supports instant rollback to previous deployment. Render requires redeploying previous commit or manual rollback via dashboard.
   - What's unclear: Who has access to Vercel/Render dashboards? Is there a documented rollback runbook?
   - Recommendation: Create rollback runbook as part of PLAN.md. Test rollback procedure in Vercel/Render dashboards before launch day. Assign on-call responsibility for first 24-48 hours post-launch.

## Sources

### Primary (HIGH confidence)

Official platform documentation and current industry resources:

- [Playwright Official Documentation](https://playwright.dev/) - Cross-browser testing framework capabilities
- [Vercel Production Checklist](https://vercel.com/docs/production-checklist) - Official deployment verification checklist
- [Render Node.js Express Deployment](https://render.com/docs/deploy-node-express-app) - Backend deployment best practices
- [Microsoft Azure: Health Endpoint Monitoring Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/health-endpoint-monitoring) - Health check implementation patterns
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) - Environment variable security best practices

### Secondary (MEDIUM confidence)

Recent industry articles and guides (2025-2026):

- [Browser Compatibility for ReactJS Web Apps | BrowserStack](https://www.browserstack.com/guide/browser-compatibility-for-reactjs-web-apps) - Cross-browser testing best practices for React apps
- [Cross Browser Testing Tools 2026 | BrowserStack](https://www.browserstack.com/live) - Real device testing platform features
- [Production Readiness Checklist | Port.io](https://www.port.io/blog/production-readiness-checklist-ensuring-smooth-deployments) - Deployment verification checklist
- [Smoke Testing in Production | Global App Testing](https://www.globalapptesting.com/blog/smoke-testing-in-production) - Post-deployment verification strategies
- [User Acceptance Testing Checklist | BrowserStack](https://www.browserstack.com/guide/user-acceptance-testing-checklist) - UAT best practices and templates
- [iOS App Testing on Real Devices | BrowserStack](https://www.browserstack.com/ios-testing) - iOS Safari testing on real iPads/iPhones
- [Test Case Template 2026 | TestGrid](https://testgrid.io/blog/test-case-template/) - Standard test case format
- [Why Environment Variables Aren't Enough for Secrets | Security Boulevard (January 2026)](https://securityboulevard.com/2026/01/why-environment-variables-alone-arent-enough-for-production-secrets/) - Production secrets management
- [Playwright Best Practices 2026 | BrowserStack](https://www.browserstack.com/guide/playwright-best-practices) - Automated testing patterns

### Tertiary (LOW confidence)

Community discussions and blog posts:

- [Streaming Video in Safari | LogRocket](https://blog.logrocket.com/streaming-video-in-safari/) - iOS Safari video playback quirks (older article but relevant for Range requests)
- [HTML5 Video Bytes on iOS | Steve Souders](https://www.stevesouders.com/blog/2013/04/21/html5-video-bytes-on-ios/) - iOS Range request behavior (older but still accurate)
- [iOS HTTP Streaming Issue | Kevin Jiang's Technical Blog (2024)](https://jiangsc.me/2024/07/07/ios-http-streaming-issue/) - Range request debugging

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - BrowserStack, manual testing, and curl are industry standard for UAT and launch verification
- Architecture: HIGH - Test case templates, browser matrix, and smoke test checklists are well-documented patterns
- Pitfalls: HIGH - iOS video playback, environment variables, and production deployment issues are verified from project context and official documentation

**Research date:** 2026-01-27
**Valid until:** 60 days (stable domain - manual testing and deployment verification practices change slowly)

**Research constraints:**
- No testing infrastructure currently exists (no Playwright, no test files)
- Frontend package.json has no test scripts
- Backend package.json has no test scripts
- This is verification work, not feature development - test automation setup would exceed phase scope
- Production URLs already exist and are documented in STATE.md
- iOS video proxy is the highest-risk area requiring real device validation

**Key findings for planner:**
1. Manual testing is the right approach for this phase - test automation would be over-engineering for one-time launch verification
2. BrowserStack is essential for iPad/iPhone real device testing (iOS video playback cannot be validated in simulators)
3. Backend proxy Range request validation is critical - use curl to verify before browser testing
4. Production smoke tests must validate critical path: auth → drill creation → video upload → video playback on iOS
5. Rollback plan and environment variable verification are deployment prerequisites
