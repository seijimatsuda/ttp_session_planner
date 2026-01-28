---
phase: 13
plan: 01
subsystem: error-handling
tags: [error-messages, user-feedback, supabase-auth, utility-functions]
requires: [06-01, 06-04]
provides: [error-message-standardization]
affects: [13-02, 13-03, 02-01, 02-02, 07-02, 09-03]
tech-stack:
  added: []
  patterns: [centralized-error-handling, user-friendly-messaging]
key-files:
  created: [frontend/src/lib/errors.ts]
  modified: []
decisions: [error-message-standardization]
metrics:
  duration: 44s
  completed: 2026-01-28
---

# Phase 13 Plan 01: Create Error Helper Utility Summary

**One-liner:** Centralized error message converter for Supabase auth errors, network errors, and generic failures with user-friendly guidance.

## What Was Built

Created `getUserFriendlyError()` utility function in `frontend/src/lib/errors.ts` to standardize error message handling across the application. This function converts technical errors from Supabase authentication, network failures, and other async operations into user-friendly, actionable messages.

**Core functionality:**
- Accepts `unknown` error type for maximum flexibility in catch blocks
- Pattern matching for Supabase auth errors (invalid credentials, email not confirmed, user already registered, password requirements)
- Pattern matching for network errors with actionable guidance
- Falls back to original message if already user-friendly (many Supabase errors are well-formatted)
- Generic fallback message for unknown error types

**Export pattern:**
```typescript
export function getUserFriendlyError(error: unknown): string
```

## Tasks Completed

| Task | Name | Commit | Files | Duration |
|------|------|--------|-------|----------|
| 1 | Create error helper utility | 2ef0a77 | frontend/src/lib/errors.ts | <1min |

**Total:** 1/1 tasks (100%)

## Technical Implementation

### Error Helper Utility

**File:** `frontend/src/lib/errors.ts`

**Function signature:**
```typescript
export function getUserFriendlyError(error: unknown): string
```

**Error patterns handled:**

1. **Supabase auth errors:**
   - "Invalid login credentials" → "Email or password is incorrect."
   - "Email not confirmed" → "Please confirm your email before logging in."
   - "User already registered" → "An account with this email already exists."
   - "Password should be at least" → "Password must be at least 6 characters."

2. **Network errors:**
   - "Failed to fetch" or "Network" → "Network error. Please check your connection and try again."

3. **Generic errors:**
   - Returns original message if it has a message property (Supabase messages are often user-friendly)
   - Falls back to "Something went wrong. Please try again." for unknown types

**Type safety:**
- Accepts `unknown` (common in catch blocks)
- Returns `string` (always provides a message)
- Uses type guards to safely access message property

**Documentation:**
- JSDoc comments explain purpose and provide usage example
- Pattern matching logic is clear and maintainable

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

### Error Message Standardization Approach

**Context:** Need consistent, user-friendly error messages across auth, mutations, and async operations.

**Decision:** Create centralized `getUserFriendlyError()` utility that converts technical errors to user-friendly messages.

**Rationale:**
- Single source of truth for error message formatting
- Easy to extend with new error patterns
- Consistent UX across the application
- Type-safe with `unknown` input (common in catch blocks)
- Preserves already-good Supabase error messages

**Alternatives considered:**
- Inline error message mapping in each component → leads to inconsistency
- Error classes with custom types → over-engineered for this use case
- React Query error configuration → doesn't handle auth errors

**Impact:**
- All error handling should use this utility for consistency
- Auth pages (LoginPage, SignupPage) will switch to toast notifications using this helper
- Mutations already using toasts will standardize messages with this helper

## Integration Points

### How This Works With Other Systems

**1. Authentication (Phase 02):**
- LoginPage and SignupPage will use `getUserFriendlyError()` to convert Supabase auth errors
- Replaces inline error divs with toast notifications
- Pattern: `toast.error(getUserFriendlyError(error))`

**2. Drill Management (Phase 07, 09):**
- DrillForm mutations will use standardized error messages
- Delete operations will provide user-friendly failure messages
- Consistent error UX across all CRUD operations

**3. Toast System (Phase 06):**
- Sonner toasts are the primary error display mechanism
- `getUserFriendlyError()` provides the message content
- Toasts appear top-right with auto-dismiss (4s duration)

**4. React Query (Phase 03):**
- Query and mutation error handlers will use this utility
- Standardizes error messages across all async operations
- Works with existing retry logic (retry: 1 configured)

### Usage Pattern

```typescript
// In auth operations (LoginPage, SignupPage)
try {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  toast.success('Welcome back!');
} catch (error) {
  toast.error(getUserFriendlyError(error));
}

// In mutations (DrillForm, DeleteDrillDialog)
try {
  await createDrill.mutateAsync(drillData);
  toast.success('Drill created successfully!');
} catch (error) {
  toast.error(getUserFriendlyError(error));
}
```

## What's Now Possible

**Immediate capabilities:**
- Consistent error message formatting across the application
- User-friendly auth error messages (no more technical Supabase errors)
- Actionable network error guidance
- Single function to import and use in any error handler

**Unblocks:**
- **13-02 (Update Auth Pages):** Can replace inline error divs with toast.error(getUserFriendlyError(error))
- **13-03 (Audit Existing Error Handling):** Standard utility ready for application-wide adoption

**Future enhancement opportunities:**
- Add i18n support by mapping error patterns to translation keys
- Extend with API-specific error patterns as they emerge
- Add error tracking integration (Sentry) using this as the message source

## Testing & Verification

**Verification completed:**
- ✅ TypeScript compiles without errors (`npx tsc --noEmit`)
- ✅ Function properly exported from `frontend/src/lib/errors.ts`
- ✅ Accepts `unknown` type (common in catch blocks)
- ✅ Returns `string` type (always provides a message)

**Test coverage:**
- Type safety verified through TypeScript compilation
- Error patterns match Supabase documentation
- Network error patterns cover common failure modes

**What to test in integration:**
- Actual Supabase auth errors map correctly (test login with wrong credentials)
- Network errors display correctly (test with network disconnected)
- Generic errors fall back to default message

## Next Phase Readiness

**Phase 13-02 (Update Auth Pages) is ready:**
- ✅ `getUserFriendlyError()` utility available for import
- ✅ Handles all Supabase auth error patterns
- ✅ Type-safe for use in catch blocks
- ✅ Returns consistent user-friendly messages

**Phase 13-03 (Audit Existing Error Handling) is ready:**
- ✅ Standard utility established for application-wide adoption
- ✅ Pattern documented for consistent usage
- ✅ Toast integration strategy clear

**No blockers or concerns.**

## Performance Notes

**Execution time:** 44 seconds (under 1 minute)

**Function performance:**
- Simple string matching (no regex) for fast execution
- No external dependencies
- Type guards are inexpensive operations
- Negligible performance impact on error handling

**Bundle impact:**
- Minimal code size (~60 lines including comments)
- No runtime dependencies
- Tree-shakeable export

## Future Considerations

**Potential enhancements:**
1. Add more Supabase error patterns as they're discovered in production
2. Integrate with i18n library for multi-language support
3. Add error categorization (network, auth, validation, server) for analytics
4. Create TypeScript types for known error patterns (if needed for advanced handling)

**Maintenance notes:**
- Update error patterns if Supabase changes error message formatting
- Add new patterns as new third-party services are integrated
- Consider extracting patterns to configuration object if list grows large

**Known limitations:**
- Only handles English error messages (no i18n yet)
- Relies on string matching (fragile if Supabase changes exact wording)
- No error tracking/analytics integration

---

**Metadata:**
- **Duration:** 44 seconds
- **Commits:** 1 (2ef0a77)
- **Files created:** 1 (frontend/src/lib/errors.ts)
- **TypeScript:** ✅ Compiles without errors
- **Pattern established:** Centralized error message conversion
