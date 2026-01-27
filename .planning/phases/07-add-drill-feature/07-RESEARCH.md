# Phase 7: Add Drill Feature - Research

**Researched:** 2026-01-26
**Domain:** Form handling with media upload, array fields, and database mutation integration
**Confidence:** HIGH

## Summary

This phase implements the drill creation feature, allowing users to create new drills with required fields (name, category), optional metadata (num_players, equipment, tags, reference URL), and media attachments (video or image). The research focused on integrating the existing stack components from prior phases: React Hook Form + Zod for validation (Phase 6), useMediaUpload hook for file uploads (Phase 4), and useCreateDrill mutation hook for database persistence (Phase 3).

The standard approach for this feature is a single-page form with progressive disclosure. Required fields (name, category) appear first, followed by optional media upload, then collapsible/expandable optional metadata fields. This pattern reduces cognitive load while keeping the form accessible. The form uses controlled components with React Hook Form's Controller for the media upload integration, and standard register for text/number inputs.

Key technical considerations include: handling array fields (equipment, tags) with a custom TagInput component rather than useFieldArray (simpler for string arrays), integrating the async media upload with form state, transforming empty strings to null for optional fields using Zod transforms, and ensuring the created drill appears immediately via React Query cache invalidation.

**Primary recommendation:** Build a DrillForm component using React Hook Form + Zod with the existing UI primitives (Button, Input from Phase 6). Integrate MediaUpload component from Phase 4 via Controller. Use useCreateDrill hook for submission with toast feedback. Keep the form single-page with optional fields clearly marked.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed in Prior Phases)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | 7.71.x | Form state management | Already installed Phase 6, minimal re-renders |
| zod | 4.3.5 | Schema validation | Already installed Phase 6, TypeScript-first |
| @hookform/resolvers | 5.2.2 | Form + Zod integration | Already installed Phase 6 |
| sonner | 2.0.7 | Toast notifications | Already installed Phase 6, success/error feedback |
| @tanstack/react-query | v5 | Server state, mutations | Already installed Phase 3, cache invalidation |
| tus-js-client | Latest | Resumable uploads | Already installed Phase 4, useMediaUpload hook |

### Supporting (No Additional Installs Needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge | 2.1.1 / 3.4.0 | Class composition | cn() utility from Phase 6 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom TagInput | useFieldArray | useFieldArray better for objects with multiple fields; simple string arrays work better with custom controlled component |
| Single form page | Multi-step wizard | Multi-step adds complexity for 5-6 fields; single page with optional sections is simpler |
| Inline media upload | Separate media step | Inline is more intuitive for "add drill with media" flow |

**Installation:**
```bash
# No additional packages needed - all installed in prior phases
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── drills/
│   │   ├── DrillForm.tsx         # Main form component
│   │   ├── DrillForm.schema.ts   # Zod schema + types
│   │   ├── TagInput.tsx          # Reusable tag/chip input
│   │   └── index.ts              # Barrel export
│   ├── ui/                       # From Phase 6
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   └── MediaUpload.tsx           # From Phase 4
├── hooks/
│   ├── useDrills.ts              # From Phase 3 (useCreateDrill)
│   └── useMediaUpload.ts         # From Phase 4
└── pages/
    └── AddDrillPage.tsx          # Page component using DrillForm
```

### Pattern 1: Zod Schema with Empty String to Null Transform
**What:** Transform empty optional strings to null for clean database storage
**When to use:** Any optional text field that should be null (not empty string) in database
**Example:**
```typescript
// src/components/drills/DrillForm.schema.ts
import { z } from "zod";

// Categories matching database CHECK constraint
export const DRILL_CATEGORIES = [
  "activation",
  "dribbling",
  "passing",
  "shooting",
] as const;

export type DrillCategory = (typeof DRILL_CATEGORIES)[number];

// Transform empty strings to null for optional fields
const optionalString = z
  .string()
  .transform((val) => (val.trim() === "" ? null : val.trim()))
  .nullable();

// Transform empty string to undefined for optional numbers
const optionalNumber = z
  .string()
  .transform((val) => {
    if (val === "" || val === undefined) return undefined;
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  })
  .pipe(z.number().min(1).max(30).optional());

export const drillFormSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(1, "Drill name is required")
    .max(100, "Name must be 100 characters or less"),
  category: z.enum(DRILL_CATEGORIES, {
    errorMap: () => ({ message: "Please select a category" }),
  }),

  // Optional media (managed separately, not in form state)
  // Will be passed as separate prop to form

  // Optional metadata
  num_players: optionalNumber,
  equipment: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  video_url: optionalString, // Reference URL (YouTube, etc.)
});

export type DrillFormData = z.infer<typeof drillFormSchema>;

// Default values matching schema
export const drillFormDefaults: DrillFormData = {
  name: "",
  category: undefined as unknown as DrillCategory, // Will be selected
  num_players: undefined,
  equipment: [],
  tags: [],
  video_url: null,
};
```

### Pattern 2: Tag Input Component with Controlled State
**What:** Simple tag input for string arrays (equipment, tags)
**When to use:** When you need a chips/tags input for simple string arrays
**Example:**
```typescript
// src/components/drills/TagInput.tsx
import { useState, useCallback, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  label: string;
  error?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  maxTags = 10,
  className,
  label,
  error,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  }, [inputValue, value, maxTags, onChange]);

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(value.filter((tag) => tag !== tagToRemove));
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        addTag();
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeTag(value[value.length - 1]);
      }
    },
    [addTag, inputValue, removeTag, value]
  );

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        className={cn(
          "flex flex-wrap gap-2 p-2 min-h-11 border rounded-md bg-white",
          error ? "border-red-500" : "border-gray-300",
          "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-blue-600 min-w-[20px] min-h-[20px] flex items-center justify-center"
              aria-label={`Remove ${tag}`}
            >
              x
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
          disabled={value.length >= maxTags}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {value.length >= maxTags && (
        <p className="mt-1 text-sm text-gray-500">Maximum {maxTags} tags reached</p>
      )}
    </div>
  );
}
```

### Pattern 3: Form with Integrated Media Upload
**What:** DrillForm component integrating MediaUpload via Controller
**When to use:** When form submission depends on separately-managed upload state
**Example:**
```typescript
// src/components/drills/DrillForm.tsx
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MediaUpload } from "@/components/MediaUpload";
import { TagInput } from "./TagInput";
import {
  drillFormSchema,
  drillFormDefaults,
  DRILL_CATEGORIES,
  type DrillFormData,
} from "./DrillForm.schema";
import { useCreateDrill } from "@/hooks/useDrills";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { MediaType } from "@/types/media";

interface DrillFormProps {
  onSuccess?: (drillId: string) => void;
}

export function DrillForm({ onSuccess }: DrillFormProps) {
  const { user } = useAuth();
  const createDrill = useCreateDrill();

  // Media state managed separately from form
  const [mediaFilePath, setMediaFilePath] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DrillFormData>({
    resolver: zodResolver(drillFormSchema),
    defaultValues: drillFormDefaults,
    mode: "onBlur",
  });

  const handleMediaUploadComplete = (filePath: string, type: MediaType) => {
    setMediaFilePath(filePath);
    setMediaType(type);
  };

  const handleMediaDelete = () => {
    setMediaFilePath(null);
    setMediaType(null);
  };

  const onSubmit = async (data: DrillFormData) => {
    if (!user) {
      toast.error("You must be logged in to create a drill");
      return;
    }

    try {
      const drillData = {
        ...data,
        user_id: user.id,
        creator_email: user.email,
        video_file_path: mediaFilePath,
        // video_url is already in data from form
      };

      const newDrill = await createDrill.mutateAsync(drillData);
      toast.success("Drill created successfully!");
      reset();
      setMediaFilePath(null);
      setMediaType(null);
      onSuccess?.(newDrill.id);
    } catch (error) {
      console.error("Failed to create drill:", error);
      toast.error("Failed to create drill. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Required: Name */}
      <Input
        label="Drill Name"
        {...register("name")}
        error={errors.name?.message}
        placeholder="e.g., 4v2 Rondo"
      />

      {/* Required: Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          {...register("category")}
          className={cn(
            "block w-full min-h-11 px-3 rounded-md border shadow-sm",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            errors.category ? "border-red-500" : "border-gray-300"
          )}
        >
          <option value="">Select a category</option>
          {DRILL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Optional: Media Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video or Image (optional)
        </label>
        <MediaUpload
          onUploadComplete={handleMediaUploadComplete}
          onDelete={handleMediaDelete}
          initialFilePath={mediaFilePath || undefined}
          initialMediaType={mediaType || undefined}
        />
      </div>

      {/* Optional: Number of Players */}
      <Input
        label="Number of Players (optional)"
        type="number"
        {...register("num_players")}
        error={errors.num_players?.message}
        placeholder="e.g., 6"
        min={1}
        max={30}
      />

      {/* Optional: Equipment */}
      <Controller
        name="equipment"
        control={control}
        render={({ field }) => (
          <TagInput
            label="Equipment (optional)"
            value={field.value}
            onChange={field.onChange}
            placeholder="e.g., cones, balls"
            error={errors.equipment?.message}
          />
        )}
      />

      {/* Optional: Tags */}
      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <TagInput
            label="Tags (optional)"
            value={field.value}
            onChange={field.onChange}
            placeholder="e.g., warmup, passing"
            error={errors.tags?.message}
          />
        )}
      />

      {/* Optional: Reference URL */}
      <Input
        label="Reference URL (optional)"
        type="url"
        {...register("video_url")}
        error={errors.video_url?.message}
        placeholder="https://youtube.com/..."
        hint="Link to YouTube video or other reference"
      />

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting || createDrill.isPending}
        className="w-full"
      >
        {isSubmitting || createDrill.isPending ? "Creating..." : "Create Drill"}
      </Button>
    </form>
  );
}
```

### Pattern 4: Page Component with Navigation After Success
**What:** AddDrillPage wrapping DrillForm with navigation on success
**When to use:** Page-level component that handles routing
**Example:**
```typescript
// src/pages/AddDrillPage.tsx
import { useNavigate } from "react-router-dom";
import { DrillForm } from "@/components/drills/DrillForm";
import { AppShell } from "@/components/layout/AppShell";

export function AddDrillPage() {
  const navigate = useNavigate();

  const handleSuccess = (drillId: string) => {
    // Navigate to drill library after successful creation
    navigate("/drills");
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Drill</h1>
        <DrillForm onSuccess={handleSuccess} />
      </div>
    </AppShell>
  );
}
```

### Anti-Patterns to Avoid
- **Using useFieldArray for simple string arrays:** useFieldArray is for objects with fields; for string arrays like tags, a simple controlled component is cleaner
- **Storing upload state in form state:** Media upload has async lifecycle (progress, errors) that doesn't fit form state well; manage separately
- **Blocking form submission until upload completes:** Allow form submission with or without media; upload completes independently
- **Not handling empty strings for optional fields:** Database should store null, not empty strings; use Zod transforms
- **No loading state on submit button:** Always disable and show loading text during mutation
- **Not invalidating cache after creation:** useCreateDrill handles this, but verify it's working

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | useState for each field | React Hook Form | Handles dirty tracking, validation, submission states |
| Form validation | Manual validation logic | Zod + zodResolver | Type inference, composable schemas, error messages |
| Array field input | Custom array manipulation | TagInput controlled component | Encapsulates add/remove logic, keyboard handling |
| File upload progress | Custom XMLHttpRequest | useMediaUpload hook (Phase 4) | TUS protocol, progress tracking, cancellation |
| Mutation + cache | Manual fetch + setState | useCreateDrill hook (Phase 3) | Automatic cache invalidation, loading/error states |
| Success/error feedback | Custom state + rendering | Sonner toast | Positioning, animations, auto-dismiss handled |

**Key insight:** This phase is primarily about INTEGRATION, not new functionality. All the building blocks exist from prior phases. The challenge is wiring them together correctly.

## Common Pitfalls

### Pitfall 1: Form Uncontrolled to Controlled Warning
**What goes wrong:** React warns about input changing from uncontrolled to controlled
**Why it happens:** Default values not provided for all fields, especially arrays
**How to avoid:**
- Provide complete defaultValues object to useForm
- Arrays default to empty array [], not undefined
- Strings default to "" or null (match schema)
**Warning signs:** Console warning about controlled/uncontrolled inputs

### Pitfall 2: Optional Number Fields Returning 0
**What goes wrong:** Empty number inputs stored as 0 instead of null/undefined
**Why it happens:** z.coerce.number() converts empty string to 0
**How to avoid:**
- Use custom transform that converts empty string to undefined
- Or use string input with manual parseInt in transform
- Test with empty field submission
**Warning signs:** Database has 0 for "num_players" when user left it empty

### Pitfall 3: Media Upload State Not Clearing on Success
**What goes wrong:** After successful drill creation, media preview still shows
**Why it happens:** Media state managed separately from form.reset()
**How to avoid:**
- Reset media state (setMediaFilePath(null)) after successful submission
- Clear in same success handler as form reset
**Warning signs:** Old media showing when starting new drill creation

### Pitfall 4: Form Submitting During Media Upload
**What goes wrong:** User submits form while media still uploading, drill created without media
**Why it happens:** Form submission not waiting for upload completion
**How to avoid:**
- Track isUploading state from useMediaUpload
- Disable submit button while uploading
- Show "Uploading..." state on button
**Warning signs:** Drills created without attached media when user expected media

### Pitfall 5: Category Select Not Validating
**What goes wrong:** Form submits with empty category, validation doesn't trigger
**Why it happens:** Select element value="" treated as valid by HTML, Zod receives ""
**How to avoid:**
- Use z.enum() which doesn't accept empty string
- Ensure select default option has value="" (empty string)
- Validate that selected value is one of enum values
**Warning signs:** Validation passes but database rejects (CHECK constraint)

### Pitfall 6: Tags/Equipment Not Persisting
**What goes wrong:** Array fields (tags, equipment) always empty in database
**Why it happens:** Controller not wiring value/onChange correctly, or default empty array overwriting
**How to avoid:**
- Verify Controller field.value and field.onChange are correct
- Check that defaultValues includes array fields
- Console.log form data before submission
**Warning signs:** Array fields always [] in submitted data

### Pitfall 7: Cache Not Updating After Create
**What goes wrong:** New drill doesn't appear in drill library after creation
**Why it happens:** useCreateDrill not invalidating the right cache key
**How to avoid:**
- Verify drillKeys.list(user_id) matches query key
- Check that onSuccess in useCreateDrill invalidates correctly
- Navigate to /drills and verify invalidation triggers refetch
**Warning signs:** Must refresh page to see new drill

## Code Examples

Verified patterns from official sources and prior phase implementations:

### Complete Zod Schema with Transforms
```typescript
// Source: Adapted from Phase 6 research + Zod documentation
import { z } from "zod";

export const DRILL_CATEGORIES = [
  "activation",
  "dribbling",
  "passing",
  "shooting",
] as const;

export type DrillCategory = (typeof DRILL_CATEGORIES)[number];

// Helper for optional strings that should be null when empty
const emptyToNull = z
  .string()
  .transform((val) => (val.trim() === "" ? null : val.trim()))
  .nullable();

// Helper for optional numbers from text inputs
const optionalIntegerFromString = z
  .union([z.string(), z.number(), z.undefined()])
  .transform((val) => {
    if (val === undefined || val === "" || val === null) return undefined;
    if (typeof val === "number") return val;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  .pipe(z.number().int().min(1).max(30).optional());

export const drillFormSchema = z.object({
  name: z
    .string()
    .min(1, "Drill name is required")
    .max(100, "Name must be under 100 characters"),
  category: z.enum(DRILL_CATEGORIES, {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  num_players: optionalIntegerFromString,
  equipment: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  video_url: emptyToNull,
});

export type DrillFormData = z.infer<typeof drillFormSchema>;
```

### Form Integration with useCreateDrill
```typescript
// Source: Phase 3 useCreateDrill hook + React Hook Form docs
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateDrill } from "@/hooks/useDrills";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Inside component:
const { user } = useAuth();
const createDrill = useCreateDrill();

const { register, handleSubmit, reset, formState } = useForm<DrillFormData>({
  resolver: zodResolver(drillFormSchema),
  defaultValues: {
    name: "",
    category: undefined,
    num_players: undefined,
    equipment: [],
    tags: [],
    video_url: null,
  },
  mode: "onBlur",
});

const onSubmit = async (data: DrillFormData) => {
  if (!user) {
    toast.error("You must be logged in");
    return;
  }

  try {
    const result = await createDrill.mutateAsync({
      ...data,
      user_id: user.id,
      creator_email: user.email,
      video_file_path: mediaFilePath, // From separate state
    });

    toast.success("Drill created!");
    reset();
    onSuccess?.(result.id);
  } catch (error) {
    toast.error("Failed to create drill");
  }
};
```

### MediaUpload Integration
```typescript
// Source: Phase 4 MediaUpload component
import { useState } from "react";
import { MediaUpload } from "@/components/MediaUpload";
import type { MediaType } from "@/types/media";

// Inside DrillForm component:
const [mediaFilePath, setMediaFilePath] = useState<string | null>(null);
const [mediaType, setMediaType] = useState<MediaType | null>(null);

<MediaUpload
  onUploadComplete={(path, type) => {
    setMediaFilePath(path);
    setMediaType(type);
  }}
  onDelete={() => {
    setMediaFilePath(null);
    setMediaType(null);
  }}
/>

// Include in submission:
const drillData = {
  ...formData,
  video_file_path: mediaFilePath,
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual form state | React Hook Form | Standard since 2020+ | Minimal re-renders, built-in validation |
| Yup schemas | Zod schemas | 2024+ | Better TypeScript inference |
| useFieldArray for tags | Controlled TagInput | Best practice | Simpler for string arrays |
| Blocking upload | Parallel upload + form | Current | Better UX, non-blocking |
| Manual cache invalidation | TanStack Query mutations | Standard | Automatic cache management |

**Deprecated/outdated:**
- **Manual form onChange handlers:** Use React Hook Form register
- **Formik:** React Hook Form is now preferred for performance
- **Yup validation:** Zod has better TypeScript support
- **Blocking UI during upload:** Allow parallel form editing

## Open Questions

Things that couldn't be fully resolved:

1. **Upload-then-submit vs submit-then-upload**
   - What we know: Current MediaUpload uploads immediately on file select
   - What's unclear: Should upload wait until form submission? (Would require refactoring MediaUpload)
   - Recommendation: Keep current immediate upload pattern - it provides progress feedback and allows multiple attempts before form submission

2. **Draft/auto-save for long forms**
   - What we know: Form could be lost on navigation or browser refresh
   - What's unclear: Whether auto-save to localStorage is needed for MVP
   - Recommendation: Skip for Phase 7, consider in Phase 9 (Drill Edit) if users report data loss

3. **Maximum tag/equipment count**
   - What we know: Database uses text[] with no limit
   - What's unclear: What reasonable limits prevent abuse
   - Recommendation: Limit to 10 each in UI; can adjust based on user feedback

## Sources

### Primary (HIGH confidence)
- [React Hook Form useFieldArray](https://react-hook-form.com/docs/usefieldarray) - Official docs on array fields
- [React Hook Form Controller](https://react-hook-form.com/docs/usecontroller/controller) - Official docs for controlled components
- [Zod Transforms](https://zod.dev/?id=transform) - Official docs on data transformation
- Phase 6 Research (06-RESEARCH.md) - Local, verified patterns for UI components
- Phase 4 Research (04-RESEARCH.md) - Local, verified patterns for media upload
- Phase 3 Research (03-RESEARCH.md) - Local, verified patterns for database hooks

### Secondary (MEDIUM confidence)
- [React Hook Form + Zod Complete Guide](https://dev.to/md_marufrahman_3552855e/react-hook-form-zod-complete-guide-to-type-safe-form-validation-in-react-4do6) - Community guide, verified against official docs
- [TanStack Query Optimistic Updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates) - Official docs for mutation patterns
- [Handling Array Values in React Hook Form](https://martijnhols.nl/blog/how-to-handle-array-values-in-react-hook-form) - Community pattern, verified

### Tertiary (LOW confidence)
- Tag input component patterns - Based on multiple GitHub implementations, may vary
- Form UX best practices - General industry knowledge

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and verified in prior phases
- Architecture: HIGH - Patterns extend proven approaches from Phase 3, 4, 6
- Pitfalls: HIGH - Based on known React Hook Form issues and prior phase learnings
- Code examples: HIGH - Adapted from official docs and verified prior phase code

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - integrating stable, already-proven components)
