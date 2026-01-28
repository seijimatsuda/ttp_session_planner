# Phase 11: Save & Load Sessions - Research

**Researched:** 2026-01-27
**Domain:** React CRUD UI patterns with existing backend infrastructure
**Confidence:** HIGH

## Summary

Phase 11 implements the UI layer for session CRUD operations on top of existing infrastructure (database table, RLS policies, React Query hooks, service layer all completed in Phase 3). The primary research focus is on React UI patterns for list views, forms, delete confirmations, and navigation.

The standard approach combines React Hook Form + Zod for form validation (already established in Phase 7's DrillForm), React Query mutations for server state, and Headless UI Dialog for accessible modal confirmations. Since all backend infrastructure exists, this phase is purely frontend integration work following established codebase patterns.

**Primary recommendation:** Build session list/form pages following DrillForm patterns (React Hook Form + Zod + React Query), add Headless UI Dialog component for delete confirmations, use useNavigate for post-CRUD navigation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Hook Form | ^7.71.1 | Form state management | Already in package.json, zero re-renders, built-in validation |
| Zod | ^4.3.6 | Schema validation | Type-safe validation, already used in DrillForm |
| @tanstack/react-query | ^5.90.20 | Server state mutations | Already configured, handles cache invalidation |
| react-router-dom | ^7.13.0 | Navigation after CRUD | Already in use, useNavigate hook for programmatic routing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @headlessui/react | Latest (2.x) | Accessible dialog/modal | Delete confirmations, fully accessible out-of-box |
| @hookform/resolvers | ^5.2.2 | React Hook Form + Zod bridge | Already installed, connects RHF to Zod schemas |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Headless UI Dialog | react-modal | react-modal requires more manual accessibility work, Headless UI is zero-config accessible |
| React Hook Form | Formik | Formik causes more re-renders, codebase already standardized on RHF |
| Zod | Yup | Zod provides better TypeScript inference, already in use |

**Installation:**
```bash
npm install @headlessui/react
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── components/
│   ├── sessions/
│   │   ├── SessionForm.tsx          # Create/edit form (RHF + Zod)
│   │   ├── SessionForm.schema.ts    # Zod schema + types
│   │   ├── SessionList.tsx          # List of saved sessions
│   │   └── SessionListItem.tsx      # Individual session card
│   ├── ui/
│   │   └── Dialog.tsx               # Reusable Headless UI wrapper
├── pages/
│   ├── SessionsPage.tsx             # List view route
│   └── SessionEditPage.tsx          # Edit view route (optional)
└── hooks/
    └── useSessions.ts               # Already exists from Phase 3
```

### Pattern 1: Session List with Inline Actions
**What:** Display saved sessions in a grid/list with inline edit/delete buttons
**When to use:** When sessions list is the primary view (SESS-07)
**Example:**
```typescript
// Source: Based on established drills pattern
function SessionList() {
  const { user } = useAuth();
  const { data: sessions, isLoading } = useSessions(user?.id);

  if (isLoading) return <Skeleton count={3} />;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions?.map(session => (
        <SessionListItem
          key={session.id}
          session={session}
          onLoad={() => loadSession(session.id)}
          onEdit={() => navigate(`/sessions/${session.id}/edit`)}
          onDelete={() => setDeleteTarget(session.id)}
        />
      ))}
    </div>
  );
}
```

### Pattern 2: Form with React Hook Form + Zod
**What:** Reusable session form for create and edit modes
**When to use:** SESS-06 (save with name), SESS-09 (edit existing)
**Example:**
```typescript
// Source: DrillForm.tsx pattern
const sessionFormSchema = z.object({
  name: z.string().min(1, "Session name is required").max(100),
  grid_data: z.custom<GridData>(), // Already defined in database.types.ts
});

type SessionFormData = z.infer<typeof sessionFormSchema>;

function SessionForm({ session, gridData, onSuccess }: SessionFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SessionFormData>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: session ?? { name: "", grid_data: gridData },
    mode: "onBlur",
  });

  const createMutation = useCreateSession();
  const updateMutation = useUpdateSession();

  const onSubmit = async (data: SessionFormData) => {
    const mutation = session ? updateMutation : createMutation;
    const newSession = await mutation.mutateAsync(
      session ? { id: session.id, updates: data } : data
    );
    toast.success(session ? "Session updated!" : "Session saved!");
    onSuccess?.(newSession.id);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("name")} label="Session Name" error={errors.name?.message} />
      <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
        {session ? "Update Session" : "Save Session"}
      </Button>
    </form>
  );
}
```

### Pattern 3: Delete Confirmation with Headless UI Dialog
**What:** Accessible modal dialog for confirming destructive actions
**When to use:** SESS-10 (delete session with confirmation)
**Example:**
```typescript
// Source: Headless UI official docs
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

function DeleteSessionDialog({ isOpen, onClose, session, onConfirm }: Props) {
  const deleteMutation = useDeleteSession();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(session.id);
    toast.success("Session deleted");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="max-w-sm rounded bg-white p-6">
          <DialogTitle className="font-bold">Delete "{session.name}"?</DialogTitle>
          <p className="mt-2 text-sm text-gray-600">
            This will permanently delete this session. This action cannot be undone.
          </p>
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              Delete Session
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
```

### Pattern 4: Navigation After CRUD Operations
**What:** Programmatic navigation using useNavigate after successful mutations
**When to use:** After save (SESS-06), after load (SESS-08), after delete (SESS-10)
**Example:**
```typescript
// Source: React Router v7 official docs
import { useNavigate } from 'react-router-dom';

function SessionActions() {
  const navigate = useNavigate();

  const handleSaveSuccess = (sessionId: string) => {
    navigate('/sessions'); // Return to list
  };

  const handleLoadSession = (sessionId: string) => {
    navigate(`/planner?session=${sessionId}`); // Load into grid
  };

  const handleDeleteSuccess = () => {
    navigate('/sessions', { replace: true }); // Replace history entry
  };
}
```

### Anti-Patterns to Avoid
- **Yes/No delete buttons:** Use "Delete" and "Cancel" for clarity (UX research shows specific labels prevent errors)
- **Window.confirm() for delete:** Not customizable, poor mobile UX, use Dialog component instead
- **Separate form components for create/edit:** Reuse same form with mode detection via props
- **Managing form state in parent:** Keep form state local to form component, lift only callbacks
- **Missing loading states:** Always disable buttons and show loading during mutations

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal/Dialog | Custom overlay + focus trap + ESC handling | Headless UI Dialog | Handles focus management, portal rendering, ARIA attributes, ESC key, click-outside, scroll lock automatically |
| Form validation | Manual useState + error tracking | React Hook Form + Zod | Zero re-renders, built-in validation, type safety, onBlur timing |
| Server state mutations | Manual fetch + cache updates | React Query useMutation | Auto cache invalidation, optimistic updates, retry logic, loading states |
| Delete confirmation | alert() or window.confirm() | Headless UI Dialog | Accessible, customizable, mobile-friendly, can show session name |

**Key insight:** Modal accessibility is complex (focus trapping, screen reader announcements, ESC handling, click-outside, scroll lock, portal rendering). Headless UI Dialog provides all of this zero-config, following WAI-ARIA guidelines. Building custom modals leads to accessibility bugs.

## Common Pitfalls

### Pitfall 1: Not Handling Empty Session List State
**What goes wrong:** User sees blank screen when they have no saved sessions yet
**Why it happens:** Developers focus on populated state, forget first-time user experience
**How to avoid:** Add empty state with call-to-action to create first session
**Warning signs:** UI shows nothing when sessions array is empty

### Pitfall 2: Deleting Without Confirmation
**What goes wrong:** Users accidentally delete sessions, lose work, get frustrated
**Why it happens:** Delete is one click away, too easy to trigger by mistake
**How to avoid:** Always require explicit confirmation for delete (Dialog with session name)
**Warning signs:** Delete button directly calls mutation without intermediate step

### Pitfall 3: No Loading States During Mutations
**What goes wrong:** User clicks multiple times, creates duplicate sessions or triggers errors
**Why it happens:** Mutation takes time, button stays clickable, user thinks first click didn't work
**How to avoid:** Disable button and show loading spinner during isPending state
**Warning signs:** Button doesn't change appearance while mutation is in flight

### Pitfall 4: Stale Cache After Mutations
**What goes wrong:** Session list doesn't update after save/edit/delete, user sees old data
**Why it happens:** React Query cache not invalidated after mutation succeeds
**How to avoid:** Use onSuccess callback in useMutation to invalidate relevant queries (already implemented in useSessions.ts hooks)
**Warning signs:** Need to refresh page to see changes

### Pitfall 5: Lost Grid State When Saving
**What goes wrong:** User builds session grid but when they save, grid data is not included
**Why it happens:** Grid component and save form don't share state
**How to avoid:** Pass gridData from parent component (SessionPlanner) to save form
**Warning signs:** Saved sessions have empty grid_data field

### Pitfall 6: Focus Not Returned After Dialog Close
**What goes wrong:** Keyboard navigation breaks after closing delete dialog
**Why it happens:** Focus is lost when dialog unmounts, not returned to trigger element
**How to avoid:** Headless UI Dialog handles this automatically via focus management
**Warning signs:** After closing dialog, need to click to restore focus

## Code Examples

Verified patterns from official sources:

### Session Form Schema (Zod)
```typescript
// Source: DrillForm.schema.ts pattern + Zod v4 docs
import { z } from 'zod';

export const sessionFormSchema = z.object({
  name: z.string()
    .min(1, "Session name is required")
    .max(100, "Session name must be less than 100 characters"),
  grid_data: z.custom<GridData>((val) => {
    // Validate grid_data structure if needed
    return typeof val === 'object' && 'cells' in val;
  }, "Invalid grid data"),
});

export type SessionFormData = z.infer<typeof sessionFormSchema>;

export const sessionFormDefaults: Partial<SessionFormData> = {
  name: "",
};
```

### React Query Mutation with Cache Invalidation
```typescript
// Source: useSessions.ts (already exists)
// This pattern is already implemented - no new code needed
const createMutation = useCreateSession(); // Auto-invalidates on success
const updateMutation = useUpdateSession(); // Auto-invalidates on success
const deleteMutation = useDeleteSession(); // Auto-invalidates on success

// Usage in component:
const onSubmit = async (data: SessionFormData) => {
  await createMutation.mutateAsync(data);
  // Query cache automatically refreshed via onSuccess in hook
};
```

### Headless UI Dialog with Tailwind Styling
```typescript
// Source: Headless UI v2.1 official docs
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';

export function ConfirmDialog({ isOpen, onClose, title, message, onConfirm, confirmText = "Confirm", confirmVariant = "danger" }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-xl">
          <DialogTitle className="text-lg font-bold text-gray-900">
            {title}
          </DialogTitle>
          <p className="text-sm text-gray-600">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
```

### Loading Session into Grid (Navigation Pattern)
```typescript
// Source: React Router v7 useNavigate docs
import { useNavigate } from 'react-router-dom';

function SessionListItem({ session }: Props) {
  const navigate = useNavigate();

  const handleLoad = () => {
    // Navigate to planner with session ID as query param
    navigate(`/planner?session=${session.id}`);
    // OR: Navigate with state
    navigate('/planner', { state: { sessionId: session.id } });
  };

  return (
    <div>
      <h3>{session.name}</h3>
      <Button onClick={handleLoad}>Load Session</Button>
    </div>
  );
}

// In SessionPlannerPage, read the session ID:
import { useSearchParams } from 'react-router-dom';

function SessionPlannerPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const { data: session } = useSession(sessionId ?? undefined);

  // Load session.grid_data into grid state
  useEffect(() => {
    if (session?.grid_data) {
      setGridState(session.grid_data);
    }
  }, [session]);
}
```

### Empty State Pattern
```typescript
// Source: Common React pattern, Tailwind UI empty states
function SessionList() {
  const { data: sessions, isLoading } = useSessions(user?.id);

  if (isLoading) return <Skeleton count={3} />;

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No saved sessions</h3>
        <p className="mt-2 text-sm text-gray-500">
          Create your first session by building a grid and saving it.
        </p>
        <Button className="mt-4" onClick={() => navigate('/planner')}>
          Create Session
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sessions.map(session => (
        <SessionListItem key={session.id} session={session} />
      ))}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| window.confirm() | Headless UI Dialog | ~2020 | Accessible, customizable, mobile-friendly confirmations |
| Formik | React Hook Form | ~2021 | Zero re-renders, better performance, simpler API |
| Manual fetch + setState | React Query mutations | ~2020 | Auto cache sync, loading states, error handling |
| Class components | Function components + hooks | 2019 | Simpler code, better composition, hooks ecosystem |
| React Router v5 history.push | useNavigate hook | 2021 (v6) | Type-safe, cleaner API, better tree-shaking |

**Deprecated/outdated:**
- **window.alert() / window.confirm()**: Not customizable, poor UX, use Dialog components
- **Formik**: Still works but React Hook Form is faster and more popular
- **Redux for server state**: Use React Query instead, Redux for global client state only
- **Class components**: Use function components with hooks

## Open Questions

Things that couldn't be fully resolved:

1. **Where does "Save Session" action trigger from?**
   - What we know: Phase 10 builds the session planner grid
   - What's unclear: Does Phase 10 include a "Save" button, or does Phase 11 add it?
   - Recommendation: Phase 11 should add save button to grid interface, could be in header/toolbar

2. **Should edit mode reuse planner grid or have separate form?**
   - What we know: SESS-09 requires editing existing sessions
   - What's unclear: Edit just the name, or edit name + grid together?
   - Recommendation: Edit name only via modal, edit grid by loading session into planner

3. **Where should saved sessions list live in navigation?**
   - What we know: Need a page to view all saved sessions (SESS-07)
   - What's unclear: Route path, sidebar link placement
   - Recommendation: `/sessions` route, "My Sessions" sidebar link

## Sources

### Primary (HIGH confidence)
- Headless UI Dialog official docs: https://headlessui.com/react/dialog
- React Hook Form v7 official docs: https://react-hook-form.com/
- React Router v7 official docs: https://reactrouter.com/
- Existing codebase patterns:
  - `/frontend/src/hooks/useSessions.ts` - Complete React Query hooks already exist
  - `/frontend/src/services/sessions.service.ts` - Complete CRUD service layer exists
  - `/frontend/src/lib/database.types.ts` - Session, GridData types already defined
  - `/frontend/src/components/drills/DrillForm.tsx` - Established RHF + Zod pattern

### Secondary (MEDIUM confidence)
- [React Query CRUD operations best practices](https://medium.com/@sergey-bocharov/organizing-crud-operations-with-next-js-and-tanstack-query-63d53e539608) - Verified with official TanStack docs
- [React form validation patterns 2026](https://react-hook-form.com/advanced-usage) - Official RHF documentation
- [Delete confirmation UX best practices](https://www.nngroup.com/articles/confirmation-dialog/) - Nielsen Norman Group research
- [React Router navigation patterns](https://reactrouter.com/start/framework/navigating) - Official React Router docs

### Tertiary (LOW confidence)
- None - All findings verified with official sources or existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json, patterns established in codebase
- Architecture: HIGH - Patterns directly mirror existing DrillForm implementation
- Pitfalls: HIGH - Based on UX research (NN/G) and common React Query mistakes

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable ecosystem, no breaking changes expected)
