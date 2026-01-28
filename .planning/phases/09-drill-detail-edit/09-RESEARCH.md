# Phase 9: Drill Detail & Edit - Research

**Researched:** 2026-01-27
**Domain:** React Router detail pages, form reusability (create/edit modes), confirmation dialogs, video playback in detail views
**Confidence:** HIGH

## Summary

This phase implements drill detail and edit functionality, allowing users to view complete drill information with media playback, edit all drill fields, and delete drills with confirmation. The research focused on three core patterns: (1) React Router dynamic routing for detail pages using `useParams` and `useNavigate`, (2) reusable form components that support both "create" and "edit" modes by pre-populating with existing data, and (3) accessible confirmation dialogs for destructive delete actions.

The standard approach is to create a DrillDetailPage that fetches drill data via `useDrill(id)` hook, displays full information with media playback using the iOS-compatible proxy URLs from Phase 5, and provides Edit/Delete action buttons. The edit flow reuses the existing DrillForm component from Phase 7 by passing initial values from the fetched drill data, switching from `useCreateDrill` to `useUpdateDrill` mutation. Delete actions require a confirmation dialog to prevent accidental data loss.

Key technical considerations include: handling loading states with skeleton placeholders (react-loading-skeleton already installed), error handling for non-existent drill IDs (404 state), managing media upload state when editing (preserving existing media vs. replacing), cache invalidation after updates/deletes via React Query, and ensuring iOS video playback works in detail view using `playsInline` attribute and proxy URLs.

**Primary recommendation:** Create DrillDetailPage with `useParams` to extract drill ID, `useDrill` hook for data fetching, and conditional rendering for loading/error/success states. Make DrillForm reusable by accepting optional `initialData` and `drillId` props to switch between create/edit modes. Use Headless UI Dialog component for delete confirmation (new install required). Ensure video elements use `playsInline` and backend proxy URLs for iOS compatibility.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router-dom | 7.13.0 | Dynamic routing, URL params | Already installed Phase 2, `useParams` and `useNavigate` hooks |
| react-hook-form | 7.71.x | Form state management | Already installed Phase 6, reuse for edit mode |
| zod | 4.3.6 | Schema validation | Already installed Phase 6, same validation for edit |
| @tanstack/react-query | 5.90.20 | Data fetching, mutations | Already installed Phase 3, `useDrill`, `useUpdateDrill`, `useDeleteDrill` |
| react-loading-skeleton | 3.5.0 | Loading placeholders | Already installed Phase 6, detail page skeletons |
| sonner | 2.0.7 | Toast notifications | Already installed Phase 6, success/error feedback |

### Supporting (New Install Required)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @headlessui/react | 2.2.x (latest) | Accessible UI primitives | Dialog component for delete confirmation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Headless UI Dialog | Custom modal component | Custom modals require manual focus management, accessibility features, escape key handling - Headless UI provides all this out-of-box |
| Headless UI Dialog | Browser `window.confirm()` | Native confirm works but looks dated, not customizable, poor mobile UX |
| Reusable DrillForm | Separate EditDrillForm | Duplicate form creates maintenance burden; single component with mode switching is DRY |
| Detail + Edit on same page | Separate edit page route | Same-page editing simpler for users; separate route adds navigation complexity |

**Installation:**
```bash
npm install @headlessui/react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── drills/
│   │   ├── DrillForm.tsx           # From Phase 7 - make reusable for edit
│   │   ├── DrillForm.schema.ts     # From Phase 7 - same validation
│   │   ├── TagInput.tsx            # From Phase 7 - reused
│   │   ├── DrillDetail.tsx         # NEW - detail view component
│   │   ├── DeleteDrillDialog.tsx   # NEW - confirmation dialog
│   │   └── index.ts                # Barrel export
│   ├── ui/                         # From Phase 6
│   │   ├── Button.tsx              # Edit/Delete buttons
│   │   └── Skeleton.tsx            # Loading states
│   └── MediaUpload.tsx             # From Phase 4 - edit mode support
├── hooks/
│   └── useDrills.ts                # From Phase 3 - already has useUpdateDrill, useDeleteDrill
├── pages/
│   ├── AddDrillPage.tsx            # From Phase 7
│   ├── DrillDetailPage.tsx         # NEW - /drills/:id route
│   └── EditDrillPage.tsx           # NEW - /drills/:id/edit route (optional - could edit inline)
└── lib/
    └── media.ts                    # From Phase 5 - getProxyMediaUrl for video playback
```

### Pattern 1: Dynamic Route with Data Loading
**What:** Use React Router URL params to fetch and display individual drill
**When to use:** Any detail page that needs to load data based on URL parameter
**Example:**
```typescript
// src/pages/DrillDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useDrill } from '@/hooks/useDrills';
import { AppShell } from '@/components/layout/AppShell';
import Skeleton from 'react-loading-skeleton';

export function DrillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: drill, isLoading, error } = useDrill(id);

  // Loading state
  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton height={40} width={300} className="mb-4" />
          <Skeleton height={400} className="mb-4" />
          <Skeleton count={5} />
        </div>
      </AppShell>
    );
  }

  // Error state (drill not found or network error)
  if (error || !drill) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Drill Not Found</h1>
          <p className="text-gray-600 mb-6">The drill you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/drills')}>Back to Library</Button>
        </div>
      </AppShell>
    );
  }

  // Success state - display drill
  return (
    <AppShell>
      <DrillDetail drill={drill} />
    </AppShell>
  );
}
```

**Source:** [useParams | React Router](https://reactrouter.com/en/main/hooks/use-params), [React Router Tutorial](https://www.toptal.com/react/react-router-tutorial)

### Pattern 2: Reusable Form for Create and Edit Modes
**What:** Single form component that handles both creation and editing by accepting optional initial data
**When to use:** When create and edit forms have identical fields and validation
**Example:**
```typescript
// src/components/drills/DrillForm.tsx (modified from Phase 7)
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateDrill, useUpdateDrill } from "@/hooks/useDrills";
import { drillFormSchema, drillFormDefaults, type DrillFormData } from "./DrillForm.schema";
import type { Drill } from "@/lib/database.types";

interface DrillFormProps {
  /** Optional drill to edit - if provided, form is in edit mode */
  drill?: Drill;
  /** Callback after successful creation or update */
  onSuccess?: (drillId: string) => void;
}

export function DrillForm({ drill, onSuccess }: DrillFormProps) {
  const { user } = useAuth();
  const isEditMode = !!drill;

  // Use update or create mutation based on mode
  const createDrill = useCreateDrill();
  const updateDrill = useUpdateDrill();

  // Pre-populate form with drill data in edit mode
  const defaultValues = isEditMode ? {
    name: drill.name,
    category: drill.category,
    num_players: drill.num_players,
    equipment: drill.equipment || [],
    tags: drill.tags || [],
    video_url: drill.video_url || "",
  } : drillFormDefaults;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm<DrillFormData>({
    resolver: zodResolver(drillFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const [mediaFilePath, setMediaFilePath] = useState<string | null>(
    isEditMode ? drill.video_file_path : null
  );

  const onSubmit = async (data: DrillFormData) => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    try {
      if (isEditMode) {
        // Update existing drill
        const updated = await updateDrill.mutateAsync({
          id: drill.id,
          updates: {
            ...data,
            video_file_path: mediaFilePath,
          },
        });
        toast.success("Drill updated successfully!");
        onSuccess?.(updated.id);
      } else {
        // Create new drill
        const created = await createDrill.mutateAsync({
          ...data,
          user_id: user.id,
          creator_email: user.email!,
          video_file_path: mediaFilePath,
        });
        toast.success("Drill created successfully!");
        reset();
        setMediaFilePath(null);
        onSuccess?.(created.id);
      }
    } catch (error) {
      console.error("Failed to save drill:", error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} drill`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Same form fields as Phase 7 */}
      <Button type="submit" loading={isSubmitting}>
        {isEditMode ? "Update Drill" : "Create Drill"}
      </Button>
    </form>
  );
}
```

**Source:** [The Ultimate React Hook Form + Zod Pattern for Reusable Create and Edit Forms - DEV Community](https://dev.to/ashishxcode/the-ultimate-react-hook-form-zod-pattern-for-reusable-create-and-edit-forms-38l)

### Pattern 3: Accessible Confirmation Dialog with Headless UI
**What:** Modal dialog to confirm destructive delete actions with keyboard navigation and focus management
**When to use:** Any destructive action (delete, archive, permanent changes)
**Example:**
```typescript
// src/components/drills/DeleteDrillDialog.tsx
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { Button } from '@/components/ui/Button';

interface DeleteDrillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  drillName: string;
  isDeleting: boolean;
}

export function DeleteDrillDialog({
  isOpen,
  onClose,
  onConfirm,
  drillName,
  isDeleting,
}: DeleteDrillDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="max-w-md w-full bg-white rounded-lg p-6 shadow-xl">
          <DialogTitle className="text-lg font-semibold text-gray-900 mb-2">
            Delete Drill?
          </DialogTitle>

          <Description className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete "{drillName}"? This action cannot be undone.
          </Description>

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              loading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
```

**Usage:**
```typescript
// In DrillDetailPage or DrillDetail component
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const deleteDrill = useDeleteDrill();
const navigate = useNavigate();

const handleDelete = async () => {
  try {
    await deleteDrill.mutateAsync(drill.id);
    toast.success("Drill deleted successfully");
    setIsDeleteDialogOpen(false);
    navigate("/drills"); // Navigate back to library
  } catch (error) {
    toast.error("Failed to delete drill");
  }
};

// In JSX
<Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
  Delete Drill
</Button>

<DeleteDrillDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => setIsDeleteDialogOpen(false)}
  onConfirm={handleDelete}
  drillName={drill.name}
  isDeleting={deleteDrill.isPending}
/>
```

**Source:** [Dialog - Headless UI](https://headlessui.com/react/dialog), [Material UI Reusable Confirmation Dialog](https://dev.to/uguremirmustafa/material-ui-reusable-confirmation-dialog-in-react-2jnl)

### Pattern 4: iOS-Compatible Video Playback in Detail View
**What:** Display video with playsInline attribute and backend proxy URL for iOS Safari
**When to use:** Any video display, especially detail pages where scrubbing is important
**Example:**
```typescript
// src/components/drills/DrillDetail.tsx
import { getProxyMediaUrl } from '@/lib/media';
import type { Drill } from '@/lib/database.types';

interface DrillDetailProps {
  drill: Drill;
}

export function DrillDetail({ drill }: DrillDetailProps) {
  // Generate proxy URL if video exists
  const videoUrl = drill.video_file_path
    ? getProxyMediaUrl('drills', drill.video_file_path)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{drill.name}</h1>

      {/* Video Player with iOS compatibility */}
      {videoUrl && (
        <div className="mb-6 bg-black rounded-lg overflow-hidden">
          <video
            src={videoUrl}
            controls
            playsInline // CRITICAL for iOS - prevents fullscreen
            className="w-full max-h-96"
            preload="metadata"
          >
            Your browser does not support video playback.
          </video>
        </div>
      )}

      {/* Drill metadata */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <p className="text-lg text-gray-900 capitalize">{drill.category}</p>
        </div>

        {drill.num_players && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Number of Players</h3>
            <p className="text-lg text-gray-900">{drill.num_players}</p>
          </div>
        )}

        {drill.equipment && drill.equipment.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Equipment</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {drill.equipment.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Similar for tags, reference URL, etc. */}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-8">
        <Button onClick={() => navigate(`/drills/${drill.id}/edit`)}>
          Edit Drill
        </Button>
        <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
          Delete Drill
        </Button>
      </div>
    </div>
  );
}
```

**Critical iOS attributes:**
- `playsInline` - Prevents fullscreen takeover on iOS Safari (camelCase in React, not `playsInLine`)
- `controls` - Shows native playback controls
- `preload="metadata"` - Loads duration and dimensions without full download

**Source:** [Best Practices for Video Playback (2025) | Mux](https://www.mux.com/articles/best-practices-for-video-playback-a-complete-guide-2025), [How to fix HTML video issues in iOS Safari](https://medium.com/@otterlord/how-to-fix-html-video-issues-in-ios-safari-05e180b3a9f1)

### Anti-Patterns to Avoid

- **Separate Edit Component:** Don't create a completely new form component for editing - modify DrillForm to accept initial data and switch mutation hooks
- **In-memory Delete:** Don't delete without confirmation dialog - accidental deletes are a major UX pain point
- **window.confirm() for Delete:** Native browser confirm is not customizable and has poor mobile UX
- **Blocking Video Navigation:** Don't use `<video>` without `playsInline` on iOS - it forces fullscreen
- **Direct Supabase URLs for Video:** Don't bypass proxy URLs - iOS Safari needs Range request support from backend
- **Optimistic Delete:** Don't optimistically remove from UI before mutation succeeds - deletion errors would leave inconsistent state
- **Missing Loading States:** Don't show blank screen while fetching - use skeleton placeholders

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confirmation dialog | Custom modal with backdrop, focus trap, escape key handling | Headless UI Dialog | Focus management, accessibility (ARIA), keyboard navigation, portal rendering all built-in |
| Video player controls | Custom play/pause/scrub UI | Native `<video controls>` | Browser-native controls handle all edge cases, accessibility, keyboard shortcuts |
| Form validation | Manual field checking with useState | Zod + React Hook Form | Already in use from Phase 7; type-safe, reusable schemas |
| Loading skeletons | Custom pulsing divs | react-loading-skeleton | Already installed Phase 6; automatic width/height adaptation |
| Toast notifications | Custom toast component | Sonner | Already installed Phase 6; queue management, positioning, animations |

**Key insight:** Accessibility for modals/dialogs is complex - focus trapping, escape key handling, screen reader announcements, and preventing background scroll require extensive testing. Headless UI solves this with battle-tested primitives that integrate seamlessly with Tailwind CSS (already in use).

## Common Pitfalls

### Pitfall 1: Video Element Capitalization in React
**What goes wrong:** Using `playsinline` (lowercase) instead of `playsInline` (camelCase) causes video to go fullscreen on iOS
**Why it happens:** HTML attribute is `playsinline` but React expects JSX props in camelCase
**How to avoid:** Always use `playsInline` in React (capital I)
**Warning signs:** Videos work on desktop but force fullscreen on iPhone/iPad

**Source:** [Autoplay muted HTML5 video using React on mobile](https://medium.com/@BoltAssaults/autoplay-muted-html5-video-safari-ios-10-in-react-673ae50ba1f5)

### Pitfall 2: Form Reset Clearing Edit Mode Data
**What goes wrong:** Using `reset()` after successful edit clears form back to defaults instead of updated values
**Why it happens:** React Hook Form `reset()` uses original defaultValues, not the updated data
**How to avoid:** After successful update, either navigate away (`navigate('/drills')`) or call `reset(updatedData)` with new values
**Warning signs:** After editing and saving, form shows blank fields or old values

### Pitfall 3: Stale Cache After Delete
**What goes wrong:** Deleted drill still appears in lists because React Query cache not invalidated
**Why it happens:** `useDeleteDrill` must invalidate relevant queries, but planner must verify it does
**How to avoid:** Check that `useDeleteDrill` in useDrills.ts invalidates `drillKeys.lists()` (already implemented)
**Warning signs:** Drill detail page 404s but drill still visible in library grid

### Pitfall 4: Missing Error Boundary for 404
**What goes wrong:** Invalid drill ID (/drills/nonexistent-id) causes error instead of user-friendly 404 page
**Why it happens:** Query returns error state but component doesn't handle gracefully
**How to avoid:** Check for `error` or `!drill` in DrillDetailPage and show friendly message with back button
**Warning signs:** Users see error boundary crash page instead of "Drill not found"

### Pitfall 5: Race Condition on Optimistic Navigation
**What goes wrong:** Navigating immediately after delete mutation starts causes "drill not found" flash
**Why it happens:** Navigation happens before mutation completes and cache invalidates
**How to avoid:** Only navigate in mutation `onSuccess` callback or after `mutateAsync` resolves
**Warning signs:** Briefly see "Drill not found" before redirecting to library

### Pitfall 6: Media Upload State Confusion in Edit Mode
**What goes wrong:** Uploading new media in edit mode doesn't clear old media reference, or deleting media breaks form
**Why it happens:** MediaUpload component manages its own state separately from form state
**How to avoid:** Pass `initialFilePath={drill.video_file_path}` to MediaUpload in edit mode; track new uploads separately
**Warning signs:** Edit shows old video even after uploading new one, or form submission sends both old and new media URLs

## Code Examples

Verified patterns from research:

### Loading State with Skeletons
```typescript
// DrillDetailPage loading state
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

if (isLoading) {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Title skeleton */}
        <Skeleton height={40} width={300} className="mb-6" />

        {/* Video skeleton */}
        <Skeleton height={400} className="mb-6 rounded-lg" />

        {/* Metadata skeletons */}
        <div className="space-y-4">
          <div>
            <Skeleton width={100} height={20} className="mb-1" />
            <Skeleton width={200} height={24} />
          </div>
          <div>
            <Skeleton width={100} height={20} className="mb-1" />
            <Skeleton width={150} height={24} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
```

**Source:** [Handling React loading states with React Loading Skeleton - LogRocket](https://blog.logrocket.com/handling-react-loading-states-react-loading-skeleton/)

### Navigate After Mutation Success
```typescript
// Correct pattern - navigate only after mutation completes
const handleDelete = async () => {
  try {
    await deleteDrill.mutateAsync(drill.id);
    toast.success("Drill deleted successfully");
    setIsDeleteDialogOpen(false);
    // Navigate AFTER mutation succeeds
    navigate("/drills");
  } catch (error) {
    toast.error("Failed to delete drill");
    // Stay on page if delete fails
  }
};
```

### Route Configuration for Detail/Edit Pages
```typescript
// src/App.tsx - add these routes
<Route element={<ProtectedRoute />}>
  {/* Existing routes */}
  <Route path="/drills" element={<DrillLibraryPage />} />
  <Route path="/drills/new" element={<AddDrillPage />} />

  {/* NEW: Detail and edit routes */}
  <Route path="/drills/:id" element={<DrillDetailPage />} />
  <Route path="/drills/:id/edit" element={<EditDrillPage />} />
</Route>
```

**Note:** Route order matters in React Router v7 - more specific routes (`/drills/new`) must come before dynamic routes (`/drills/:id`) to prevent "new" being interpreted as an ID.

**Source:** [React Router v6: A Comprehensive Guide](https://pieces.app/blog/react-router-v6-a-comprehensive-guide-to-page-routing-in-react)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Router v5 useHistory | React Router v6+ useNavigate | v6.0 (Nov 2021) | Simpler API, no history.push - use navigate() directly |
| Separate create/edit forms | Single form with mode switching | React Hook Form v7+ | Reduces duplication, easier maintenance |
| Custom modals | Headless UI/Radix primitives | ~2022 | Better accessibility, less code, framework-agnostic styling |
| window.confirm() | Custom confirmation dialogs | Modern UX standards | Better mobile UX, customizable messaging |
| react-beautiful-dnd | @dnd-kit | ~2022 | Better touch support (Phase 10 will use this) |

**Deprecated/outdated:**
- `useHistory()` hook - Replaced by `useNavigate()` in React Router v6+
- Separate `<Switch>` component - Replaced by `<Routes>` in React Router v6
- Class components for forms - Functional components with hooks are standard

## Open Questions

Things that couldn't be fully resolved:

1. **Should edit happen inline on detail page or separate route?**
   - What we know: Pattern 2 shows reusable form works for both; React Router supports both /drills/:id (detail) and /drills/:id/edit (separate edit page)
   - What's unclear: User preference - do coaches expect to click "Edit" and see form inline, or navigate to edit page?
   - Recommendation: Start with separate edit route (`/drills/:id/edit`) for clearer mental model - detail page = read-only, edit page = form. Can combine later if user feedback suggests inline editing is preferred.

2. **Should delete be available from detail page only or also from library grid cards?**
   - What we know: Detail page needs delete button; library grid (Phase 8) could have delete on card hover/dropdown
   - What's unclear: Phase 8 requirements don't specify delete from grid
   - Recommendation: Implement delete only on detail page in Phase 9. Phase 8 planner can decide if grid cards need delete action.

3. **How to handle media deletion when editing?**
   - What we know: MediaUpload component has delete functionality; form tracks mediaFilePath state
   - What's unclear: If user deletes existing video in edit mode but doesn't upload new one, should drill.video_file_path be set to null?
   - Recommendation: Yes - if MediaUpload onDelete callback fires during edit, set mediaFilePath to null and include in update payload. This allows removing media without replacement.

## Sources

### Primary (HIGH confidence)
- [Dialog - Headless UI](https://headlessui.com/react/dialog) - Official documentation for Dialog component, v2.2.9
- [useParams | React Router](https://reactrouter.com/en/main/hooks/use-params) - Official React Router documentation
- [useNavigate | React Router API Reference](https://api.reactrouter.com/v7/functions/react_router.useNavigate.html) - Official React Router v7 API
- [@headlessui/react - npm](https://www.npmjs.com/package/@headlessui/react) - Latest version 2.2.9, installation instructions
- [react-loading-skeleton - npm](https://www.npmjs.com/package/react-loading-skeleton) - Version 3.5.0 already installed

### Secondary (MEDIUM confidence)
- [The Ultimate React Hook Form + Zod Pattern for Reusable Create and Edit Forms - DEV Community](https://dev.to/ashishxcode/the-ultimate-react-hook-form-zod-pattern-for-reusable-create-and-edit-forms-38l) - Published Jan 3, 2026; verified pattern for single form component with create/edit modes
- [Best Practices for Video Playback: A Complete Guide (2025) | Mux](https://www.mux.com/articles/best-practices-for-video-playback-a-complete-guide-2025) - Comprehensive video playback guide including iOS playsInline requirements
- [Handling React loading states with React Loading Skeleton - LogRocket](https://blog.logrocket.com/handling-react-loading-states-react-loading-skeleton/) - Best practices for skeleton screens in detail pages
- [React Router Tutorial: Redirect Like a Pro | Toptal](https://www.toptal.com/react/react-router-tutorial) - Verified useParams/useNavigate patterns
- [How to fix HTML video issues in iOS Safari](https://medium.com/@otterlord/how-to-fix-html-video-issues-in-ios-safari-05e180b3a9f1) - iOS-specific video requirements

### Tertiary (LOW confidence - verify during implementation)
- [Material UI Reusable Confirmation Dialog in React - DEV Community](https://dev.to/uguremirmustafa/material-ui-reusable-confirmation-dialog-in-react-2jnl) - Pattern is valid but uses Material UI instead of Headless UI
- [Creating a Confirm Dialog in React and Material UI](https://plainenglish.io/blog/creating-a-confirm-dialog-in-react-and-material-ui) - General pattern applies, specific implementation differs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed except Headless UI (well-documented, stable v2.2.9)
- Architecture: HIGH - React Router patterns verified in official docs, form reusability pattern from recent 2026 article
- Pitfalls: HIGH - iOS video pitfall from Phase 5 research, other pitfalls common in React Router detail pages
- Code examples: HIGH - Verified against official Headless UI docs and React Router v7 API

**Research date:** 2026-01-27
**Valid until:** ~30 days (Feb 27, 2026) - Stack is stable; Headless UI v2.2 released, React Router v7.13 current
