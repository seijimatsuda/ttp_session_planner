# Phase 14: iOS/iPad Optimization - Research

**Researched:** 2026-01-27
**Domain:** iOS Safari compatibility, touch accessibility, video playback verification, drag-and-drop touch interactions
**Confidence:** HIGH

## Summary

This phase is primarily an **audit and verification phase** - the foundational iOS/iPad work was implemented in earlier phases. The research confirms that the current codebase has already implemented the key iOS requirements: 44px touch targets on Button/Input components, `playsInline` video attributes, backend proxy with Range request support for video streaming, and separate MouseSensor + TouchSensor configuration for dnd-kit.

The focus of this phase is systematic verification across ALL components and pages to ensure:
1. No interactive elements slipped through without proper touch targets
2. All video elements have `playsInline` and use proxy URLs
3. Drag-and-drop remains responsive on iPad with no regressions
4. Real-device testing confirms video scrubbing works correctly

Key verification areas include: auditing all interactive elements for 44px minimum touch targets (WCAG 2.1 AAA / Apple HIG), confirming video elements have `playsInline` (capital I, not `playsinline`), verifying the backend media proxy returns 206 Partial Content with correct headers for Range requests, and testing TouchSensor behavior on actual iPad hardware.

**Primary recommendation:** Conduct a systematic audit of all components with an iOS verification checklist. Focus on edge cases like tag removal buttons (currently 20px - too small), link components without explicit min-height, and any custom interactive elements added since Phase 6.

## Standard Stack

This phase uses existing project infrastructure - no new dependencies required.

### Core (Already Installed)
| Library | Version | Purpose | iOS-Relevant Feature |
|---------|---------|---------|---------------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop | TouchSensor with delay/tolerance |
| Tailwind CSS | v4 | Styling | min-h-11 = 44px touch targets |
| React | 19.x | UI | playsInline JSX attribute |

### Supporting (Already Configured)
| Library | Purpose | Current iOS Config |
|---------|---------|-------------------|
| cors | Backend CORS | exposedHeaders: Content-Range, Accept-Ranges, Content-Length |
| Express | Media proxy | 206 Partial Content with Range handling |

**Installation:** None required - all dependencies in place.

## Architecture Patterns

### Pattern 1: Touch Target Audit Checklist

**What:** Systematic verification of all interactive elements for 44px minimum touch targets
**When to use:** During phase execution to ensure complete coverage

**Elements to Audit:**
```
src/components/
  ui/
    Button.tsx          - VERIFIED: min-h-11 min-w-11 on all sizes
    Input.tsx           - VERIFIED: min-h-11 on all inputs
    Dialog.tsx          - AUDIT: Check close button, action buttons

  drills/
    TagInput.tsx        - FIX NEEDED: Tag remove button is 20px, needs 44px touch area
    DrillCard.tsx       - AUDIT: Entire card is link, check min-height
    DrillFilters.tsx    - VERIFIED: Uses Button component
    DeleteDrillDialog.tsx - AUDIT: Check confirmation buttons

  sessions/
    GridCell.tsx        - VERIFIED: Remove button has min-h-11 min-w-11
    DraggableDrillCard.tsx - AUDIT: Card itself (touch target for drag)
    DrillLibrarySidebar.tsx - AUDIT: Any filter/action buttons

  layout/
    AppShell.tsx        - VERIFIED: Hamburger and close buttons have min-h-11 min-w-11

  auth/
    LogoutButton.tsx    - AUDIT: Check logout button sizing

  MediaUpload.tsx       - AUDIT: Cancel, Delete, Try again buttons
```

### Pattern 2: Video Element iOS Checklist

**What:** Ensure all video elements have iOS-required attributes
**When to use:** When auditing video playback components

**Required Attributes:**
```tsx
// Source: Apple Developer Documentation
<video
  src={proxyUrl}         // MUST use backend proxy for Range requests
  controls
  playsInline           // CRITICAL: Capital I, prevents fullscreen takeover
  preload="metadata"    // Optional but recommended
>
```

**Files to Audit:**
```
DrillDetail.tsx         - VERIFIED: Has playsInline
MediaUpload.tsx         - VERIFIED: Has playsInline (preview video)
```

### Pattern 3: Touch-Action CSS Verification

**What:** Verify touch-action CSS is correctly applied for drag-and-drop
**When to use:** When auditing drag-and-drop components

**Pattern from Phase 10:**
```tsx
// Source: dnd-kit documentation
// DraggableDrillCard.tsx has:
className="... touch-action-manipulation"
```

**What touch-action-manipulation does:**
- Allows pan and pinch zoom gestures
- Enables double-tap zoom
- Prevents touch conflicts with drag

### Anti-Patterns to Avoid

- **Inline styles for touch targets:** Use Tailwind min-h-11, not style={{ minHeight: '44px' }}
- **Forgetting touch area extends beyond visible element:** A 24px icon with 44px touch area is valid
- **Testing only in Chrome DevTools:** Device emulation misses iOS-specific behaviors
- **Using playsinline (lowercase):** React requires camelCase `playsInline`

## Don't Hand-Roll

Problems with existing solutions in this project:

| Problem | Don't Rebuild | Use Existing | Location |
|---------|---------------|--------------|----------|
| Touch targets | Custom CSS | min-h-11 min-w-11 (Tailwind) | Button.tsx, Input.tsx patterns |
| Video streaming | Custom fetch | Backend proxy with Range support | backend/src/routes/media.ts |
| iOS video inline | Custom JS | playsInline attribute | Native React video |
| Drag sensors | Custom touch handlers | dnd-kit TouchSensor | useSessionSensors.ts |
| CORS headers | Manual headers | cors middleware with exposedHeaders | backend/src/app.ts |

**Key insight:** The infrastructure is built. This phase is about auditing for completeness and fixing any gaps, not rebuilding.

## Common Pitfalls

### Pitfall 1: Small Interactive Elements in Complex Components

**What goes wrong:** Complex components (TagInput, card actions) have small interactive sub-elements
**Why it happens:** Focus on component layout, not individual touch targets within
**How to avoid:**
- Audit EVERY clickable element, not just primary buttons
- Use browser dev tools to measure actual clickable area
- Test on real touch device - finger is ~44px wide
**Warning signs:**
- Buttons/icons smaller than fingertip when viewing on actual device
- Users mis-tapping or needing multiple attempts
**Example in this codebase:**
```tsx
// TagInput.tsx line 103-109 - tag remove button is 20px, needs expansion
<button
  style={{ minWidth: "20px", minHeight: "20px" }} // TOO SMALL
  // Should be:
  className="min-h-11 min-w-11"
/>
```

### Pitfall 2: Video Not Playing on iOS Safari (No Range Support)

**What goes wrong:** Video loads but won't play or scrub on iOS Safari
**Why it happens:** Server returns 200 instead of 206 for Range requests
**How to avoid:**
- Always use backend proxy URLs (`getProxyMediaUrl`)
- Never use direct Supabase signed URLs for video src
- Test with Safari on real iOS device
**Warning signs:**
- Video works in Chrome, fails in Safari
- Network tab shows 200 response to Range request
- No error messages, video just doesn't play
**Current implementation:**
```typescript
// frontend/src/lib/media.ts - CORRECTLY configured
export function getProxyMediaUrl(bucket: string, path: string): string {
  // Routes through backend proxy with Range support
  return `${API_URL}/api/media/${bucket}/${cleanPath}`
}
```

### Pitfall 3: playsInline Capitalization

**What goes wrong:** Video opens in fullscreen on iPhone instead of playing inline
**Why it happens:** Using `playsinline` (HTML attribute) instead of `playsInline` (React prop)
**How to avoid:**
- Always use `playsInline` with capital I in React/JSX
- ESLint or TypeScript won't catch this - it's a valid prop
**Warning signs:**
- Works on desktop, video goes fullscreen on iPhone
- No console errors
**Current status:** DrillDetail.tsx and MediaUpload.tsx both correctly use `playsInline`

### Pitfall 4: TouchSensor Delay Too Long/Short

**What goes wrong:** Drag feels unresponsive OR accidental drags occur
**Why it happens:** Touch delay not calibrated for use case
**How to avoid:**
- Current 250ms delay with 5px tolerance is standard
- Test with real iPad users in field conditions
- Consider user feedback - coaches may have gloves on
**Current implementation:**
```typescript
// useSessionSensors.ts - CORRECTLY configured
const touchSensor = useSensor(TouchSensor, {
  activationConstraint: {
    delay: 250,  // 250ms hold before drag
    tolerance: 5  // 5px movement allowed during delay
  }
})
```

### Pitfall 5: Missing CORS exposedHeaders for Video

**What goes wrong:** Video plays but seeking/scrubbing fails
**Why it happens:** Content-Range header blocked by CORS, JavaScript can't read it
**How to avoid:**
- CORS config MUST include: exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length']
**Current status:** backend/src/app.ts line 25 - CORRECTLY configured

### Pitfall 6: Links Without Touch Target Sizing

**What goes wrong:** Navigation links hard to tap on mobile
**Why it happens:** `<Link>` or `<a>` elements don't inherit Button styling
**How to avoid:**
- Add explicit min-h-11 to any Link used as navigation
- Consider wrapping links in styled containers
**Example to audit:**
```tsx
// LoginPage.tsx line 77 - link has no explicit touch target
<Link to="/signup" className="text-blue-600 hover:underline">
  Sign up
</Link>
// Should have min-h-11 or be wrapped in touch-friendly container
```

## Code Examples

Verified patterns from the current codebase:

### Touch Target Pattern (Button.tsx)
```typescript
// Source: frontend/src/components/ui/Button.tsx
// All sizes maintain 44px minimum touch target
size === "default" && "min-h-11 min-w-11 px-4 py-2 text-sm",
size === "sm" && "min-h-11 min-w-11 px-3 py-1.5 text-sm",
size === "lg" && "min-h-12 min-w-12 px-6 py-3 text-base",
size === "icon" && "min-h-11 min-w-11 p-2",
```

### Video with iOS Compatibility (DrillDetail.tsx)
```typescript
// Source: frontend/src/components/drills/DrillDetail.tsx
<video
  src={getProxyMediaUrl('drills', drill.video_file_path)}
  controls
  playsInline          // Capital I - critical for iOS
  preload="metadata"
  className="w-full"
>
```

### TouchSensor Configuration (useSessionSensors.ts)
```typescript
// Source: frontend/src/hooks/useSessionSensors.ts
const touchSensor = useSensor(TouchSensor, {
  activationConstraint: {
    delay: 250,    // 250ms press before drag starts
    tolerance: 5,  // 5px movement allowed during delay
  }
})
```

### Range Request Handler (media.ts)
```typescript
// Source: backend/src/routes/media.ts
// Returns 206 Partial Content with correct headers
res.writeHead(206, {
  'Content-Range': `bytes ${range.start}-${end}/${fileSize}`,
  'Accept-Ranges': 'bytes',
  'Content-Length': contentLength,
  'Content-Type': contentType
})
```

### Touch Target Fix Pattern (for TagInput)
```typescript
// Recommended fix for TagInput.tsx tag remove buttons
// Current (too small):
<button
  style={{ minWidth: "20px", minHeight: "20px" }}
  aria-label={`Remove ${tag}`}
>

// Fixed (44px touch target):
<button
  className="min-h-11 min-w-11 flex items-center justify-center -mr-2"
  aria-label={`Remove ${tag}`}
>
```

## State of the Art

| Old Approach | Current Approach | Status in Project |
|--------------|------------------|-------------------|
| webkit-playsinline (prefixed) | playsInline (unprefixed) | CURRENT - Using playsInline |
| PointerSensor for all | MouseSensor + TouchSensor | CURRENT - Separate sensors |
| Direct Supabase URLs for video | Backend proxy with Range | CURRENT - Using proxy |
| 24px touch targets (WCAG AA) | 44px touch targets (Apple HIG/AAA) | CURRENT - Using min-h-11 |

**Deprecated/outdated:**
- webkit-playsinline: Prefix removed in iOS 10+ (2016), use `playsInline`
- react-beautiful-dnd: Archived by Atlassian in 2024, project correctly uses dnd-kit

## Audit Checklist

Complete verification checklist for phase execution:

### Touch Targets (44px minimum)

| Component | Element | Current | Status | Action |
|-----------|---------|---------|--------|--------|
| Button | All variants | min-h-11 | PASS | None |
| Input | Input field | min-h-11 | PASS | None |
| AppShell | Hamburger button | min-h-11 | PASS | None |
| AppShell | Close sidebar button | min-h-11 | PASS | None |
| GridCell | Remove drill button | min-h-11 | PASS | None |
| TagInput | Tag remove button | 20px | FAIL | Fix to min-h-11 |
| MediaUpload | Cancel button | No explicit | AUDIT | Verify or fix |
| MediaUpload | Delete button | No explicit | AUDIT | Verify or fix |
| MediaUpload | Try again button | No explicit | AUDIT | Verify or fix |
| LoginPage | Signup link | No min-h | AUDIT | Consider wrapper |
| DrillCard | Card link | Implicit | AUDIT | Verify via aspect-video |
| DraggableDrillCard | Card div | p-4 | AUDIT | Verify total height |

### Video Playback

| Component | Has playsInline | Uses Proxy URL | Status |
|-----------|-----------------|----------------|--------|
| DrillDetail | YES (line 37) | YES | PASS |
| MediaUpload | YES (line 213) | NO (uses signed URL) | REVIEW |

**Note on MediaUpload:** The preview video uses a signed URL directly from Supabase. This may work for short previews but could fail for longer videos. Consider if proxy URL is needed for upload preview.

### Backend Proxy

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Range header parsing | parseRange() in media.ts | PASS |
| 206 Partial Content | res.writeHead(206, ...) | PASS |
| Accept-Ranges header | Included in response | PASS |
| Content-Range header | Included in response | PASS |
| CORS exposedHeaders | Content-Range, Accept-Ranges, Content-Length | PASS |
| File extension validation | Warning logged if missing | PASS |

### Drag-and-Drop

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| TouchSensor configured | useSessionSensors.ts | PASS |
| 250ms delay | activationConstraint.delay | PASS |
| 5px tolerance | activationConstraint.tolerance | PASS |
| touch-action CSS | DraggableDrillCard | PASS |
| MouseSensor separate | 10px distance activation | PASS |

## Open Questions

Things requiring real-device testing:

1. **MediaUpload preview video**
   - What we know: Uses signed URL, not proxy URL
   - What's unclear: Whether signed URL supports Range for previews
   - Recommendation: Test on iOS - if preview videos fail to play, switch to proxy URL

2. **Optimal touch delay for field conditions**
   - What we know: 250ms is standard, works in office testing
   - What's unclear: Whether coaches with gloves or in rain need different delay
   - Recommendation: Gather user feedback post-launch, consider making configurable

3. **Safari video scrubbing behavior**
   - What we know: Range requests implemented correctly
   - What's unclear: Edge cases with very long videos or slow connections
   - Recommendation: Test with real iPad on actual LTE connection

## Sources

### Primary (HIGH confidence)
- [Apple Developer Documentation - playsInline](https://developer.apple.com/documentation/webkitjs/htmlvideoelement/2528111-playsinline) - JSX attribute specification
- [WebKit Blog - New video Policies for iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/) - iOS video policy reference
- [dnd-kit Touch Sensor Documentation](https://docs.dndkit.com/api-documentation/sensors/touch) - TouchSensor configuration
- [WCAG 2.1 Understanding Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - 44px requirement rationale
- [Smashing Magazine - Accessible Target Sizes](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/) - Implementation guidance
- [LogRocket - Streaming Video in Safari](https://blog.logrocket.com/streaming-video-in-safari/) - Range request requirements

### Secondary (MEDIUM confidence)
- [CSS-Tricks - What Does playsinline Mean](https://css-tricks.com/what-does-playsinline-mean-in-web-video/) - Attribute explanation
- [Kevin Jiang - Fixing iOS HTTP Video Playback](https://jiangsc.me/2024/07/07/ios-http-streaming-issue/) - Troubleshooting guide
- [Phil Nash - Safari's Range Request](https://philna.sh/blog/2018/10/23/service-workers-beware-safaris-range-request/) - Safari-specific behavior

### Project-Specific (HIGH confidence)
- Phase 5 Research: iOS Media Proxy implementation details
- Phase 6 Research: Core UI Components with touch targets
- Phase 10 Research: Session Grid dnd-kit configuration

## Metadata

**Confidence breakdown:**
- Touch targets: HIGH - Direct Tailwind measurements, WCAG specification
- Video playback: HIGH - Apple documentation + working implementation
- Drag-and-drop: HIGH - dnd-kit docs + implemented pattern
- Audit items: MEDIUM - Some require real-device testing

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - iOS requirements are stable)
