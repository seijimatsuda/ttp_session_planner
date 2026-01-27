# Phase 6: Core UI Components - Research

**Researched:** 2026-01-22
**Domain:** React component library with Tailwind CSS v4, TypeScript, responsive design, accessibility
**Confidence:** HIGH

## Summary

This phase creates a reusable component library for the session planner application using React 18+, TypeScript strict mode, and Tailwind CSS v4. The research focused on five key areas: (1) toast notifications for user feedback, (2) skeleton loading states, (3) form components with validation, (4) responsive layout patterns, and (5) accessible touch targets for iPad/mobile use.

The modern approach in 2026 centers on lightweight, composable libraries rather than heavy all-in-one UI frameworks. Sonner for toasts, react-loading-skeleton for loading states, React Hook Form + Zod for form validation, and react-error-boundary for error handling form the recommended stack. All libraries have excellent TypeScript support and integrate seamlessly with Tailwind CSS v4.

Key technical considerations include: Tailwind v4's mobile-first responsive system with container queries for truly reusable components, the 44px minimum touch target requirement for iOS accessibility (WCAG 2.1 AAA), and the `cn()` utility function pattern (clsx + tailwind-merge) for managing class composition without conflicts.

**Primary recommendation:** Build a small, focused component library using composition patterns. Use Sonner for toasts, react-loading-skeleton for skeletons, React Hook Form + Zod for forms, and establish consistent 44px minimum touch targets across all interactive elements.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sonner | 2.0.7 | Toast notifications | 7M+ weekly downloads, lightweight, headless options, excellent DX |
| react-loading-skeleton | 3.5.0 | Skeleton loading states | Auto-sizes to content, minimal config, Tailwind-friendly |
| react-hook-form | 7.71.x | Form state management | 14M+ weekly downloads, minimal re-renders, excellent TypeScript |
| zod | 4.3.5 | Schema validation | 57M+ weekly downloads, TypeScript-first, runtime + type inference |
| @hookform/resolvers | 5.2.2 | Form + Zod integration | Official resolver, type-safe validation binding |
| react-error-boundary | 6.1.0 | Error handling UI | Declarative error handling, reset capabilities, React 18+ support |
| clsx | 2.1.1 | Conditional classNames | 239B, industry standard, conditional class composition |
| tailwind-merge | 3.4.0 | Tailwind class merging | Resolves Tailwind conflicts, supports v4, no dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tailwindcss/forms | latest | Form element base styles | If default form styling needed (optional with v4) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sonner | react-hot-toast | Similar features, Sonner has better default styling and promise API |
| Sonner | react-toastify | More features but heavier (29KB vs 5KB), more opinionated styling |
| react-loading-skeleton | Custom CSS | Custom is more work, skeleton library handles edge cases (flex, sizing) |
| Zod | Yup | Yup older, Zod has better TypeScript inference and smaller bundle |
| Custom error boundary | react-error-boundary | Library handles reset logic, retry patterns, edge cases |

**Installation:**
```bash
npm install sonner react-loading-skeleton react-hook-form zod @hookform/resolvers react-error-boundary clsx tailwind-merge
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/              # Primitive UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts     # Barrel export
│   ├── layout/          # Layout components
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Container.tsx
│   │   └── index.ts
│   ├── feedback/        # User feedback components
│   │   ├── Toast.tsx    # Sonner wrapper/config
│   │   ├── ErrorFallback.tsx
│   │   └── index.ts
│   └── forms/           # Form components
│       ├── FormField.tsx
│       ├── FormError.tsx
│       └── index.ts
├── lib/
│   └── utils.ts         # cn() function, shared utilities
└── styles/
    └── index.css        # @import "tailwindcss"
```

### Pattern 1: The cn() Utility Function
**What:** Combine clsx and tailwind-merge for conflict-free class composition
**When to use:** Every component that accepts className props or has conditional styles
**Example:**
```typescript
// src/lib/utils.ts
// Source: shadcn/ui pattern, verified via multiple sources
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage in component
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles with 44px min touch target
        "min-h-11 min-w-11 px-4 py-2 rounded-lg font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        // Variant styles
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
        variant === "ghost" && "bg-transparent hover:bg-gray-100 focus:ring-gray-500",
        // Allow override via className prop
        className
      )}
      {...props}
    />
  );
}
```

### Pattern 2: Touch-Target Accessible Components
**What:** Ensure all interactive elements meet 44px minimum touch target
**When to use:** Every button, link, input, checkbox, or interactive element
**Example:**
```typescript
// Tailwind v4 sizing: min-h-11 = 44px (2.75rem)
// Source: WCAG 2.1 AAA / Apple HIG

// Button with proper touch target
<button className="min-h-11 min-w-11 px-4 py-2">
  Submit
</button>

// Icon button with touch target larger than visual
<button className="min-h-11 min-w-11 flex items-center justify-center">
  <Icon className="h-6 w-6" /> {/* Visual is 24px, touch target is 44px */}
</button>

// Checkbox with proper touch target
<label className="min-h-11 flex items-center gap-2 cursor-pointer">
  <input type="checkbox" className="h-5 w-5" />
  <span>Remember me</span>
</label>

// Link in navigation with touch-friendly spacing
<a href="/page" className="block min-h-11 flex items-center px-4">
  Navigation Link
</a>
```

### Pattern 3: Responsive Layout with Container Queries
**What:** Use Tailwind v4 container queries for truly portable components
**When to use:** Components that need to adapt based on available space, not viewport
**Example:**
```typescript
// Source: https://tailwindcss.com/docs/responsive-design
// Container queries for component-level responsiveness

// Layout shell with responsive sidebar
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - hidden on mobile, shown on md+ */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-gray-900">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        {/* Container query wrapper */}
        <div className="@container p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav - shown on mobile only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t">
        <MobileNav />
      </nav>
    </div>
  );
}

// Card that adapts to container size
export function DrillCard({ drill }: { drill: Drill }) {
  return (
    <div className="@container">
      <div className="flex flex-col @sm:flex-row gap-4 p-4 bg-white rounded-lg shadow">
        {/* Image - full width on small container, fixed on larger */}
        <img
          src={drill.thumbnail}
          className="w-full @sm:w-32 @sm:h-32 object-cover rounded"
        />
        <div className="flex-1">
          <h3 className="font-semibold">{drill.name}</h3>
          <p className="text-gray-600 @md:line-clamp-2">{drill.description}</p>
        </div>
      </div>
    </div>
  );
}
```

### Pattern 4: Sonner Toast Configuration
**What:** Configure and use Sonner for consistent toast notifications
**When to use:** Success/error feedback, form submissions, async operations
**Example:**
```typescript
// src/components/feedback/Toast.tsx
// Source: https://sonner.emilkowal.ski/

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      expand={false}
      toastOptions={{
        className: "font-sans",
        duration: 4000,
      }}
    />
  );
}

// In App.tsx - render once at root
import { Toaster } from "@/components/feedback/Toast";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

// Usage anywhere in app
import { toast } from "sonner";

// Success notification
toast.success("Drill saved successfully");

// Error with user-friendly message
toast.error("Couldn't save the drill. Please try again.");

// Promise-based for async operations
toast.promise(saveDrill(data), {
  loading: "Saving drill...",
  success: "Drill saved!",
  error: "Failed to save drill",
});

// Custom with action
toast("Session created", {
  action: {
    label: "View",
    onClick: () => navigate(`/sessions/${id}`),
  },
});
```

### Pattern 5: Skeleton Loading States
**What:** Show skeleton placeholders during data loading
**When to use:** Initial data fetch, async content, lazy loading
**Example:**
```typescript
// src/components/ui/Skeleton.tsx
// Source: https://github.com/dvtng/react-loading-skeleton

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Theme wrapper for consistent skeleton styling
export function SkeletonProvider({ children }: { children: React.ReactNode }) {
  return (
    <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
      {children}
    </SkeletonTheme>
  );
}

// Re-export for convenience
export { Skeleton };

// Component with embedded skeleton state
export function DrillCard({ drill }: { drill?: Drill }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex gap-4">
        {/* Image or skeleton */}
        {drill ? (
          <img src={drill.thumbnail} className="w-24 h-24 object-cover rounded" />
        ) : (
          <Skeleton width={96} height={96} />
        )}

        <div className="flex-1">
          {/* Title or skeleton */}
          <h3 className="font-semibold">
            {drill?.name || <Skeleton width="60%" />}
          </h3>

          {/* Description or multi-line skeleton */}
          <p className="text-gray-600 mt-1">
            {drill?.description || <Skeleton count={2} />}
          </p>
        </div>
      </div>
    </div>
  );
}

// Usage in list
function DrillList() {
  const { data: drills, isLoading } = useDrills();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <DrillCard key={i} /> {/* No drill prop = skeleton mode */}
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {drills.map(drill => (
        <DrillCard key={drill.id} drill={drill} />
      ))}
    </div>
  );
}
```

### Pattern 6: React Hook Form + Zod Validation
**What:** Type-safe form handling with schema validation
**When to use:** Any form with validation requirements
**Example:**
```typescript
// Source: https://react-hook-form.com/ + https://zod.dev/

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define schema with user-friendly error messages
const drillSchema = z.object({
  name: z.string()
    .min(1, "Please enter a drill name")
    .max(100, "Name must be 100 characters or less"),
  description: z.string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  duration: z.number()
    .min(1, "Duration must be at least 1 minute")
    .max(120, "Duration cannot exceed 2 hours"),
  category: z.enum(["warmup", "technique", "conditioning", "cooldown"], {
    errorMap: () => ({ message: "Please select a category" }),
  }),
});

// Infer TypeScript type from schema
type DrillFormData = z.infer<typeof drillSchema>;

export function DrillForm({ onSubmit }: { onSubmit: (data: DrillFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DrillFormData>({
    resolver: zodResolver(drillSchema),
    mode: "onBlur", // Validate on blur for better UX
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Text input with error display */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Drill Name
        </label>
        <input
          id="name"
          {...register("name")}
          className={cn(
            "mt-1 block w-full min-h-11 px-3 rounded-md border shadow-sm",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            errors.name ? "border-red-500" : "border-gray-300"
          )}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Number input with error */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
          Duration (minutes)
        </label>
        <input
          id="duration"
          type="number"
          {...register("duration", { valueAsNumber: true })}
          className={cn(
            "mt-1 block w-full min-h-11 px-3 rounded-md border shadow-sm",
            errors.duration ? "border-red-500" : "border-gray-300"
          )}
        />
        {errors.duration && (
          <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
        )}
      </div>

      {/* Select with error */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          {...register("category")}
          className={cn(
            "mt-1 block w-full min-h-11 px-3 rounded-md border shadow-sm",
            errors.category ? "border-red-500" : "border-gray-300"
          )}
        >
          <option value="">Select a category</option>
          <option value="warmup">Warm-up</option>
          <option value="technique">Technique</option>
          <option value="conditioning">Conditioning</option>
          <option value="cooldown">Cool-down</option>
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full min-h-11 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium",
          "hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isSubmitting ? "Saving..." : "Save Drill"}
      </button>
    </form>
  );
}
```

### Pattern 7: Error Boundary with User-Friendly Fallback
**What:** Catch rendering errors and show recovery UI
**When to use:** Around major app sections, route boundaries
**Example:**
```typescript
// src/components/feedback/ErrorFallback.tsx
// Source: https://github.com/bvaughn/react-error-boundary

import { ErrorBoundary, FallbackProps } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h2>

      <p className="text-gray-600 mb-4 max-w-md">
        We ran into an unexpected problem. Please try again, or contact support if the issue continues.
      </p>

      <button
        onClick={resetErrorBoundary}
        className="min-h-11 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
      >
        Try Again
      </button>

      {/* Show error details in development only */}
      {import.meta.env.DEV && (
        <details className="mt-4 text-left text-sm text-gray-500 max-w-md">
          <summary className="cursor-pointer">Technical details</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );
}

// Usage - wrap sections of your app
export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // Log to error tracking service
        console.error("Error boundary caught:", error, info);
      }}
      onReset={() => {
        // Optional: clear any cached state that might have caused the error
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// In route/page level
function DrillPage() {
  return (
    <AppErrorBoundary>
      <DrillList />
    </AppErrorBoundary>
  );
}
```

### Anti-Patterns to Avoid
- **Prop drilling classNames deeply:** Use cn() at leaf components, not intermediate wrappers
- **Creating skeleton components separately:** Embed loading state in the same component that renders data
- **Using px values for touch targets:** Use Tailwind's min-h-11 (44px) for consistency
- **Catching async errors with ErrorBoundary:** Error boundaries don't catch async errors - use try/catch
- **Hardcoding error messages:** Always use user-friendly messages, not technical error strings
- **Not wrapping form inputs with labels:** Always use proper label elements for accessibility
- **Using deprecated Tailwind classes:** v4 syntax differs - use @import not @tailwind directives

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast system | Sonner | Handles positioning, animations, queuing, accessibility, dismiss logic |
| Skeleton loaders | Custom CSS animations | react-loading-skeleton | Auto-sizes to content, handles edge cases (flex containers), theming |
| Form state | useState for each field | React Hook Form | Minimizes re-renders, handles touched/dirty states, integrates with validation |
| Schema validation | Custom validation functions | Zod | TypeScript inference, composable schemas, standardized error format |
| Class merging | Manual string concatenation | clsx + tailwind-merge | Handles conditional classes, resolves Tailwind conflicts automatically |
| Error boundaries | componentDidCatch class | react-error-boundary | Reset logic, retry patterns, hooks integration, typed props |
| Responsive breakpoints | Custom media queries | Tailwind responsive prefixes | Consistent breakpoints, mobile-first, container queries built-in |

**Key insight:** UI components have hundreds of edge cases (accessibility, animations, touch, keyboard, screen readers). Libraries encode years of refinement. Hand-rolling leads to subtle bugs users will encounter but you won't during development.

## Common Pitfalls

### Pitfall 1: Touch Targets Too Small on Mobile
**What goes wrong:** Buttons and links are hard to tap on iPad/mobile, users mis-tap frequently
**Why it happens:** Desktop-first design with small clickable areas, testing only with mouse
**How to avoid:**
- Set `min-h-11 min-w-11` (44px) on ALL interactive elements
- Use padding to extend touch area beyond visual bounds
- Test on actual touch devices, not just browser device emulation
**Warning signs:**
- User complaints about difficulty tapping
- Analytics showing rage taps (multiple rapid taps in same area)
- Links/buttons smaller than your fingertip

### Pitfall 2: Skeleton Flash of Content
**What goes wrong:** Skeletons appear briefly then content shows, creating jarring flash
**Why it happens:** Not debouncing loading states, skeleton shown for fast network responses
**How to avoid:**
- Show skeleton immediately (no delay)
- Use CSS transitions when switching from skeleton to content
- Consider minimum display time (150-200ms) for very fast responses
**Warning signs:**
- Flash of gray then content
- Skeletons visible for less than 100ms
- Layout shift when content loads

### Pitfall 3: Technical Error Messages Exposed to Users
**What goes wrong:** Users see "TypeError: Cannot read property 'id' of undefined" or similar
**Why it happens:** Using error.message directly in UI, not mapping errors to user-friendly text
**How to avoid:**
- Map all errors to user-friendly messages
- Log technical details to console/monitoring, show friendly text to users
- Have fallback "Something went wrong" for unexpected errors
**Warning signs:**
- Error messages containing code terms (null, undefined, TypeError)
- Stack traces visible in production
- Users reporting they don't understand error messages

### Pitfall 4: Form Validation Not Running Until Submit
**What goes wrong:** User fills entire form, submits, then sees all errors at once
**Why it happens:** Default form validation only on submit
**How to avoid:**
- Use `mode: "onBlur"` or `mode: "onChange"` with React Hook Form
- Show errors as user moves between fields
- Don't prevent typing, just show feedback
**Warning signs:**
- Multiple errors appearing simultaneously on submit
- Users having to scroll up to see which fields failed
- High form abandonment rates

### Pitfall 5: Tailwind v4 Configuration Syntax Errors
**What goes wrong:** Old Tailwind v3 patterns don't work in v4
**Why it happens:** Following outdated tutorials, copy-pasting old config
**How to avoid:**
- Use `@import "tailwindcss"` not `@tailwind base/components/utilities`
- No tailwind.config.js needed for basic setup
- Custom theme values go in `@theme {}` block in CSS
- Use `@tailwindcss/vite` plugin, not PostCSS setup
**Warning signs:**
- "Unknown at rule @tailwind" errors
- Styles not applying
- Config file being ignored

### Pitfall 6: Not Testing Responsive Breakpoints
**What goes wrong:** Layout breaks at certain screen sizes, content overlaps
**Why it happens:** Only testing at desktop and mobile extremes, missing tablet
**How to avoid:**
- Test at all Tailwind breakpoints: sm (640), md (768), lg (1024), xl (1280)
- Pay special attention to md (tablet) - often overlooked
- Use browser dev tools responsive mode systematically
**Warning signs:**
- Layout issues only on iPad/tablet
- Sidebar and content overlapping at certain widths
- Text overflowing containers

### Pitfall 7: Missing Loading States for Async Actions
**What goes wrong:** Button clicked, nothing happens for seconds, user clicks again
**Why it happens:** No visual feedback during async operations
**How to avoid:**
- Disable buttons and show spinner/loading text during submission
- Use toast.promise() for async operations with progress feedback
- Consider optimistic updates for better perceived performance
**Warning signs:**
- Duplicate form submissions
- Users clicking buttons multiple times
- "Is it doing anything?" user feedback

## Code Examples

Verified patterns from official sources:

### Complete Input Component with Accessibility
```typescript
// src/components/ui/Input.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          aria-describedby={cn(
            error && errorId,
            hint && !error && hintId
          )}
          aria-invalid={error ? "true" : undefined}
          className={cn(
            // Base styles with 44px touch target
            "block w-full min-h-11 px-3 rounded-md border shadow-sm",
            "text-gray-900 placeholder:text-gray-400",
            // Focus states
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            // Error vs normal states
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
            // Disabled state
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />

        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
```

### Responsive Navigation Shell
```typescript
// src/components/layout/AppShell.tsx
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header?: React.ReactNode;
}

export function AppShell({ children, sidebar, header }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Mobile: slide-in drawer
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
          "md:translate-x-0 md:static md:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebar}
      </aside>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Header with mobile menu button */}
        {header && (
          <header className="sticky top-0 z-30 bg-white border-b">
            <div className="flex items-center h-16 px-4 gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="min-h-11 min-w-11 flex items-center justify-center md:hidden"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {header}
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Toast Integration in App Root
```typescript
// src/App.tsx
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { SkeletonTheme } from "react-loading-skeleton";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/feedback/ErrorFallback";
import { router } from "./router";

export function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            duration: 4000,
          }}
        />
      </SkeletonTheme>
    </ErrorBoundary>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 @tailwind directives | Tailwind v4 @import "tailwindcss" | 2024 | Simplified setup, no PostCSS config needed |
| react-toastify | Sonner | 2024+ | Smaller bundle, better defaults, headless option |
| Yup validation | Zod | 2024+ | Better TypeScript inference, smaller bundle |
| Class components for error boundaries | react-error-boundary | 2023+ | Functional approach, hooks support |
| CSS media queries | Tailwind responsive + container queries | 2024+ | Component-level responsiveness |
| classnames package | clsx | 2023+ | Smaller, faster, same API |
| Manual class string concatenation | cn() with tailwind-merge | 2024+ | No Tailwind conflicts when overriding |

**Deprecated/outdated:**
- **@tailwind base/components/utilities:** Use @import "tailwindcss" in v4
- **tailwind.config.js for simple projects:** v4 auto-detects content, use @theme {} for customization
- **PostCSS setup for Tailwind:** Use @tailwindcss/vite plugin directly
- **Yup:** Zod has better TypeScript support and is smaller
- **classnames package:** clsx is smaller and faster drop-in replacement
- **Custom toast implementations:** Sonner handles edge cases you'll miss
- **Manual error boundary classes:** react-error-boundary is more ergonomic

## Open Questions

Things that couldn't be fully resolved:

1. **Component Documentation Tool**
   - What we know: Storybook is industry standard but adds significant setup complexity
   - What's unclear: Whether the project scope warrants Storybook overhead
   - Recommendation: Skip Storybook initially. Document components via TypeScript interfaces and JSDoc comments. Add Storybook in later phase if component library grows.

2. **Animation Library**
   - What we know: Framer Motion is most popular, but adds ~50KB. Tailwind transitions sufficient for basic needs.
   - What's unclear: Whether drill/session interactions need complex animations beyond CSS transitions
   - Recommendation: Use Tailwind transitions initially. Add Framer Motion only if specific animation requirements emerge.

3. **Dark Mode Support**
   - What we know: Tailwind v4 has built-in dark mode support via dark: prefix
   - What's unclear: Whether dark mode is in project requirements
   - Recommendation: Structure components with cn() to support dark mode easily later, but don't implement unless required.

## Sources

### Primary (HIGH confidence)
- Tailwind CSS v4 Responsive Design: https://tailwindcss.com/docs/responsive-design
- Sonner Documentation: https://sonner.emilkowal.ski/
- react-loading-skeleton GitHub: https://github.com/dvtng/react-loading-skeleton
- React Hook Form: https://react-hook-form.com/
- Zod Documentation: https://zod.dev/
- react-error-boundary GitHub: https://github.com/bvaughn/react-error-boundary
- WCAG 2.1 Target Size: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html

### Secondary (MEDIUM confidence)
- [React Hook Form + Zod Guide](https://dev.to/md_marufrahman_3552855e/react-hook-form-zod-complete-guide-to-type-safe-form-validation-in-react-4do6)
- [Tailwind CSS Best Practices 2025-2026](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns)
- [Top React Notification Libraries 2026](https://knock.app/blog/the-top-notification-libraries-for-react)
- [React Error Handling Patterns](https://dev.to/istealersn_dev/designing-a-resilient-ui-advanced-patterns-and-accessibility-for-error-handling-in-react-4kln)
- [clsx + tailwind-merge Pattern](https://medium.com/@naglaafouz4/enhancing-component-reusability-in-tailwind-css-with-clsx-and-tailwind-merge-986aa4e1fe76)

### Tertiary (LOW confidence)
- Touch target sizing patterns - based on WCAG guidelines, not specific library documentation
- Animation recommendations - community consensus, may vary by use case

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All library versions verified from npm/GitHub, actively maintained with millions of downloads
- Architecture: HIGH - Patterns verified from official documentation and established community standards (shadcn/ui)
- Pitfalls: MEDIUM-HIGH - Based on common issues documented in library READMEs and Stack Overflow, some from experience

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - libraries are mature and stable)
