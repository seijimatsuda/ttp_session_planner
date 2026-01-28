# Phase 13: Error Handling & Loading States - Research

**Researched:** 2026-01-27
**Domain:** Error handling, loading states, user feedback patterns in React applications
**Confidence:** HIGH

## Summary

This phase is about auditing and reinforcing the error handling and loading state infrastructure already implemented in Phase 6. The foundation is solid: Sonner toasts, react-error-boundary, react-loading-skeleton, and React Query's built-in error handling are all in place and operational. However, the implementation is inconsistent across the application.

Current gaps identified:
- Toast notifications are only used in DrillForm and DashboardPage (test page), but missing from other async operations
- Login/signup pages use custom inline error displays instead of the toast system
- No retry UI for failed network requests (React Query retries happen silently)
- Some async operations lack loading indicators
- Error messages are not standardized (mix of generic and specific messages)

This is not a "build new infrastructure" phase - it's a "complete the coverage and standardize the patterns" phase. The tools are ready; we need systematic application across all user-facing async operations.

**Primary recommendation:** Audit all async operations (queries, mutations, auth operations, media uploads), add missing toast notifications for success/error, ensure loading states are visible, and create a standardized error message helper to convert technical errors into user-friendly messages.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sonner | ^2.0.7 | Toast notifications | Industry standard, minimal API, excellent UX, already installed in Phase 6 |
| react-error-boundary | ^6.1.0 | Rendering error handling | Official React team recommendation, catches React lifecycle errors, already installed |
| react-loading-skeleton | ^3.5.0 | Loading skeletons | Prevents layout shift, configurable, better UX than spinners, already installed |
| @tanstack/react-query | ^5.90.20 | Async state + error handling | Built-in error/loading states, retry logic, cache invalidation, already installed |
| react-hook-form | ^7.71.1 | Form validation errors | Integrates with Zod, field-level error display, already installed |
| zod | ^4.3.6 | Schema validation | Type-safe error messages, composable schemas, already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | No new libraries needed | All infrastructure exists from Phase 6 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sonner | react-hot-toast | Similar features, but Sonner has better default UX and is already integrated |
| sonner | react-toastify | More configuration needed, heavier bundle, unnecessary complexity |
| Manual retries | React Query's built-in retry | Manual retry buttons add UI complexity; React Query's exponential backoff is proven |

**Installation:**
```bash
# No new packages needed - all installed in Phase 6
# Verify existing packages:
npm ls sonner react-error-boundary react-loading-skeleton @tanstack/react-query react-hook-form zod
```

## Architecture Patterns

### Recommended Audit Structure
```
Audit areas (in order):
1. React Query operations (queries, mutations)
   - Check: isLoading states displayed
   - Check: error states show toast
   - Check: success mutations show toast

2. Auth operations (login, signup, logout)
   - Check: Loading states on buttons
   - Check: Errors show toast (not inline)
   - Check: Success shows toast

3. Media uploads
   - Check: Progress indicator visible
   - Check: Error handling with user-friendly messages
   - Check: Success confirmation

4. Form validations
   - Check: Field-level errors displayed
   - Check: Zod error messages are user-friendly
   - Check: Submit errors show toast
```

### Pattern 1: React Query Error Handling with Toast
**What:** Display error toasts for failed queries/mutations automatically
**When to use:** All async operations using React Query
**Example:**
```typescript
// Source: Application analysis + React Query docs
// https://tanstack.com/query/latest/docs/framework/react/guides/query-retries

// CURRENT (incomplete) - only in DrillForm
const createDrill = useCreateDrill();

const onSubmit = async (data: DrillFormData) => {
  try {
    await createDrill.mutateAsync(drillData);
    toast.success("Drill created successfully!");
  } catch (error) {
    toast.error("Failed to create drill. Please try again.");
  }
};

// SHOULD BE APPLIED TO:
// - All mutations (update, delete drills)
// - Auth operations (login, signup, logout)
// - Media uploads (with progress tracking)
// - Session save/load operations (when implemented)
```

### Pattern 2: Standardized Error Message Conversion
**What:** Convert technical errors to user-friendly messages
**When to use:** All error handling points
**Example:**
```typescript
// Create error message helper
// Source: Best practices from https://uxcam.com/blog/react-error-handling-best-practices/

function getUserFriendlyError(error: unknown): string {
  // Supabase auth errors
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message);

    // Auth error patterns
    if (message.includes('Invalid login credentials')) {
      return 'Email or password is incorrect. Please try again.';
    }
    if (message.includes('User already registered')) {
      return 'An account with this email already exists.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please check your email to confirm your account.';
    }

    // Network errors
    if (message.includes('Failed to fetch') || message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }

    // Generic Supabase error
    return message;
  }

  return 'Something went wrong. Please try again.';
}

// Usage in auth operations
try {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  toast.success('Welcome back!');
} catch (error) {
  toast.error(getUserFriendlyError(error));
}
```

### Pattern 3: React Query Retry Configuration
**What:** Configure retry behavior per operation type
**When to use:** React Query configuration
**Example:**
```typescript
// Source: https://tanstack.com/query/latest/docs/framework/react/guides/query-retries

// CURRENT - global config in QueryProvider (already good)
new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry once for queries
      staleTime: 60 * 1000,
    },
    mutations: {
      retry: 1, // Retry once for mutations
    },
  },
})

// OPTIONAL ENHANCEMENT: Error-specific retry logic
// Only retry on network errors, not on 4xx client errors
retry: (failureCount, error) => {
  // Don't retry on client errors (400-499)
  if (error?.status >= 400 && error?.status < 500) return false;
  // Retry up to 2 times for network/server errors
  return failureCount < 2;
}

// NOTE: Current simple retry: 1 is acceptable for this application
// No need to implement complex retry logic unless network issues become common
```

### Pattern 4: Loading States for Async Buttons
**What:** Show loading spinner on buttons during async operations
**When to use:** All submit/action buttons
**Example:**
```typescript
// Source: Application analysis - Button component already supports this

// CURRENT (correct) - DrillForm
<Button
  type="submit"
  disabled={isFormDisabled}
  loading={isSubmitting || createDrill.isPending}
>
  {isSubmitting || createDrill.isPending ? "Creating..." : "Create Drill"}
</Button>

// NEEDS FIXING - LoginPage (missing loading prop)
<button
  type="submit"
  disabled={isLoading}
  className="w-full bg-blue-600..."
>
  {isLoading ? 'Logging in...' : 'Log In'}
</button>

// SHOULD BE:
<Button
  type="submit"
  loading={isLoading}
  className="w-full"
>
  Log In
</Button>
```

### Pattern 5: Skeleton Loading States
**What:** Show skeleton placeholders during data loading
**When to use:** List views, grids, data displays
**Example:**
```typescript
// Source: Phase 6 implementation - already working in DrillGrid

// CURRENT (correct pattern)
function DrillGrid({ drills, isLoading }: DrillGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton height={200} />
            <Skeleton width="60%" className="mt-2" />
            <Skeleton count={2} className="mt-1" />
          </div>
        ))}
      </div>
    );
  }

  // Actual content...
}

// Pattern is correct - verify all list views use this pattern
```

### Anti-Patterns to Avoid
- **Inline error divs on login/signup instead of toasts:** Inconsistent with rest of app, harder to notice
- **Silent failures:** Always show user feedback for actions (success or error)
- **Generic "Something went wrong" for all errors:** Provide context when possible
- **Loading text without disabled state:** Button should be disabled during async operations
- **No loading indicator for slow operations:** Always show loading state for >200ms operations

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Retry logic for failed requests | Custom retry loops with exponential backoff | React Query's built-in retry | Handles edge cases (network recovery, race conditions), proven algorithm |
| Toast notification system | Custom modal/snackbar component | Sonner (already installed) | Handles stacking, auto-dismiss, accessibility, animations |
| Form field error display | Manual error state + conditional rendering | React Hook Form + Zod | Automatic validation, error tracking, performance optimized |
| Loading skeleton animations | CSS keyframes or custom components | react-loading-skeleton | Handles responsive sizing, theme integration, no layout shift |
| Error message formatting | String manipulation for every error | Centralized error message helper | Consistent UX, easier to maintain, i18n-ready |

**Key insight:** Error handling infrastructure is already in place from Phase 6. The work is applying patterns consistently, not building new systems. Focus on coverage and standardization, not reinvention.

## Common Pitfalls

### Pitfall 1: Inconsistent Error Display Methods
**What goes wrong:** Mix of inline errors (LoginPage), console.log (various), and toasts (DrillForm) creates confusion
**Why it happens:** Components added at different times without standardization
**How to avoid:** Use toast.error() for ALL user-facing errors. Reserve inline errors for real-time form validation only.
**Warning signs:** Find error handling with `setError()` state + inline div instead of toast

### Pitfall 2: Missing Success Confirmations
**What goes wrong:** Users unsure if action completed (e.g., drill deleted but no feedback)
**Why it happens:** Developers focus on error cases, forget success path
**How to avoid:** Every mutation should have toast.success() on success
**Warning signs:** Mutation completes but UI doesn't change and no confirmation shown

### Pitfall 3: Error Boundaries Catching Everything
**What goes wrong:** Async errors, event handlers, setTimeout callbacks won't trigger error boundary
**Why it happens:** Error boundaries only catch React lifecycle errors
**How to avoid:** Use try-catch in async operations, log errors manually
**Warning signs:** Errors disappear with no user feedback

### Pitfall 4: Optimistic UI Without Rollback
**What goes wrong:** UI updates before mutation succeeds, then mutation fails but UI stays updated
**Why it happens:** Cache invalidation on success only
**How to avoid:** Use React Query's onSuccess/onError with proper invalidation
**Warning signs:** Data shows deleted but still appears in database

### Pitfall 5: Loading States Missing for Fast Operations
**What goes wrong:** Button flashes loading state for 50ms on fast requests, feels janky
**Why it happens:** Always showing loading immediately
**How to avoid:** Button component already handles this well with CSS transitions; keep current approach
**Warning signs:** Loading spinner appears and disappears too fast to see

### Pitfall 6: Retry Without User Awareness
**What goes wrong:** React Query retries silently, user doesn't know why action is slow
**Why it happens:** Default retry config has no UI feedback
**How to avoid:** Current config (retry: 1) is good; don't add retry UI unless users report issues
**Warning signs:** Users report "sometimes it's slow" without explanation

## Code Examples

Verified patterns from official sources:

### Error Handling in Auth Operations
```typescript
// Source: Supabase Auth + Sonner integration
// Currently: LoginPage.tsx uses inline error div (inconsistent)
// Should be:

import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Helper function
function getUserFriendlyError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message);
    if (message.includes('Invalid login credentials')) {
      return 'Email or password is incorrect.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please confirm your email before logging in.';
    }
  }
  return 'Unable to log in. Please try again.';
}

// In LoginPage
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  setIsLoading(false);

  if (error) {
    toast.error(getUserFriendlyError(error));
    return;
  }

  toast.success('Welcome back!');
  navigate(from, { replace: true });
};
```

### Mutation Error Handling with Toast
```typescript
// Source: Current DrillForm.tsx pattern (correct)
// Apply this pattern to all mutations

import { toast } from 'sonner';
import { useCreateDrill } from '@/hooks/useDrills';

const createDrill = useCreateDrill();

const onSubmit = async (data: DrillFormData) => {
  try {
    const newDrill = await createDrill.mutateAsync(drillData);
    toast.success('Drill created successfully!');
    onSuccess?.(newDrill.id);
  } catch (error) {
    console.error('Failed to create drill:', error);
    toast.error('Failed to create drill. Please try again.');
  }
};

// Pattern applies to:
// - useUpdateDrill (toast.success('Drill updated!'))
// - useDeleteDrill (toast.success('Drill deleted!'))
// - Future session mutations
```

### Query Error Handling
```typescript
// Source: React Query docs + application patterns
// https://tanstack.com/query/latest/docs/framework/react/guides/queries

// Currently: DrillLibraryPage only shows loading, doesn't handle errors
// Should add:

const { data: drills, isLoading, isError, error } = useDrills(user?.id);

if (isError) {
  return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">
        Failed to load drills. Please try again.
      </p>
      <Button onClick={() => refetch()}>Retry</Button>
    </div>
  );
}

// Alternative: Use error boundary + toast
// Let error bubble up, catch in boundary, show toast
```

### Form Validation Error Display
```typescript
// Source: Current DrillForm.tsx pattern (correct)
// React Hook Form + Zod integration

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Validate on blur for better UX
});

// Input component handles error display
<Input
  {...register('name')}
  label="Drill Name"
  error={errors.name?.message}
  disabled={isSubmitting}
/>

// Zod schema provides user-friendly messages
const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email'),
});
```

### Media Upload Error Handling
```typescript
// Source: useMediaUpload.ts (current implementation is good)
// Shows error state, but could add toast for better visibility

const { upload, isUploading, error, progress } = useMediaUpload({
  onSuccess: (filePath, mediaType) => {
    toast.success('File uploaded successfully!');
    // Update form state
  },
  onError: (errorMessage) => {
    toast.error(errorMessage); // Already user-friendly from validation
  },
});

// Error messages already user-friendly in useMediaUpload:
// - "Invalid file" (from validation)
// - "You must be logged in to upload files"
// - "Supabase URL not configured"
// - "Upload failed" (from TUS error)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline error messages everywhere | Toast notifications (Sonner) | 2023-2024 | Better UX, consistent location, auto-dismiss |
| Custom skeleton components | react-loading-skeleton | 2023 | Less code, better animations, responsive |
| Manual retry buttons | React Query auto-retry | 2022 | Simpler UX, proven algorithm, less UI complexity |
| Error boundaries with class components | react-error-boundary hook API | 2022 | Functional component support, better DX |
| Generic error messages | User-friendly, actionable errors | Ongoing | Better UX, less frustration, clearer next steps |

**Deprecated/outdated:**
- Manual promise chaining for async operations: Use async/await or React Query
- Class component error boundaries: Use react-error-boundary with function components
- Custom toast systems: Use Sonner or react-hot-toast (maintained libraries)
- Redux for async state: Use React Query for server state

## Open Questions

Things that couldn't be fully resolved:

1. **Should we add manual retry buttons for failed queries?**
   - What we know: React Query retries automatically (retry: 1 configured)
   - What's unclear: Whether users need visible retry control
   - Recommendation: Wait for user feedback. Current auto-retry is sufficient. Only add manual retry if users report confusion about slow operations.

2. **Should we add error tracking service (e.g., Sentry)?**
   - What we know: Console logs exist for debugging
   - What's unclear: Whether production error tracking is needed for v1
   - Recommendation: Defer to v2. Focus on user-facing error handling first. Add Sentry when app is live and error patterns emerge.

3. **Should we standardize loading skeleton counts (e.g., always show 8 placeholders)?**
   - What we know: DrillGrid shows 8 skeletons regardless of actual data count
   - What's unclear: Best practice for skeleton count
   - Recommendation: Keep current approach (fixed count). Alternative (matching data count) requires storing count in cache, adds complexity.

4. **Should login/signup errors be inline or toast?**
   - What we know: Currently inline divs; rest of app uses toasts
   - What's unclear: Auth pattern convention
   - Recommendation: Switch to toasts for consistency. Auth errors are infrequent enough that toasts won't be annoying.

## Sources

### Primary (HIGH confidence)
- TanStack Query docs - Query retries: https://tanstack.com/query/latest/docs/framework/react/guides/query-retries
- React Hook Form docs: https://react-hook-form.com/docs/useform
- Sonner GitHub (2.0.7 current): https://github.com/emilkowalski/sonner
- React Error Boundary docs: https://github.com/bvaughn/react-error-boundary
- Application codebase analysis (Phase 6 implementation)

### Secondary (MEDIUM confidence)
- [React Query Retry Strategies For Better Error Handling](https://www.dhiwise.com/blog/design-converter/react-query-retry-strategies-for-better-error-handling)
- [Error Handling and Retries in React Query Guide](https://tillitsdone.com/blogs/react-query-error-handling-guide/)
- [How to Validate Forms with Zod and React-Hook-Form](https://www.freecodecamp.org/news/react-form-validation-zod-react-hook-form/)
- [React Toastify: The complete guide (updated for 2026)](https://deadsimplechat.com/blog/react-toastify-the-complete-guide/)
- [React Loading State Pattern using Toast & SWR](https://theodorusclarence.com/blog/react-loading-state-pattern)
- [Best Practices for Error Handling in React Applications](https://uxcam.com/blog/react-error-handling-best-practices/)
- [How to Handle Errors in React Applications](https://www.freecodecamp.org/news/effective-error-handling-in-react-applications/)

### Tertiary (LOW confidence)
- [The Ultimate Guide to Debugging Async Operations in React Hooks](https://moldstud.com/articles/p-the-ultimate-guide-to-debugging-async-operations-in-react-hooks-master-async-handling)
- [Developer Guide to React 19: Async Handling](https://www.callstack.com/blog/the-complete-developer-guide-to-react-19-part-1-async-handling)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and working from Phase 6
- Architecture: HIGH - Patterns verified in working codebase, official docs confirm
- Pitfalls: HIGH - Based on codebase analysis showing actual inconsistencies
- Error message standardization: MEDIUM - Best practices from multiple sources, need to verify specific Supabase error messages

**Research date:** 2026-01-27
**Valid until:** 60 days (stable ecosystem, no major version changes expected)

## Audit Checklist

For planning phase, this checklist guides the audit:

### React Query Operations
- [ ] All queries show loading state (skeleton or spinner)
- [ ] All queries handle error state (toast or error UI)
- [ ] All mutations show toast.success() on success
- [ ] All mutations show toast.error() on failure
- [ ] Delete mutations show confirmation toast

### Auth Operations
- [ ] Login shows loading state on button
- [ ] Login shows toast.error() for failures
- [ ] Login shows toast.success() on success
- [ ] Signup shows loading state on button
- [ ] Signup shows toast.error() for failures
- [ ] Signup shows toast.success() on success
- [ ] Logout shows confirmation

### Media Upload
- [ ] Upload shows progress indicator
- [ ] Upload shows toast.error() for failures
- [ ] Upload shows toast.success() on completion
- [ ] Validation errors are user-friendly

### Forms
- [ ] All form fields show validation errors
- [ ] Error messages are user-friendly (from Zod schemas)
- [ ] Submit buttons show loading state
- [ ] Submit failures show toast.error()

### Error Messages
- [ ] Supabase auth errors converted to user-friendly messages
- [ ] Network errors have actionable messages
- [ ] Generic "try again" only when specific message isn't available
