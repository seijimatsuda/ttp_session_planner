# Phase 15: Performance Optimization - Research

**Researched:** 2026-01-27
**Domain:** React application performance optimization
**Confidence:** HIGH

## Summary

Performance optimization for modern React applications in 2026 focuses on three key areas: **build-time optimization** (code splitting, tree shaking, bundle analysis), **runtime optimization** (lazy loading, memoization, virtualization), and **asset optimization** (image formats, lazy loading, responsive images). The standard approach combines Vite's built-in optimizations with React 18/19's modern features (Suspense, lazy loading) and selective use of performance tools only where profiling shows bottlenecks.

The current tech stack (React 19.2, Vite 7.2, TanStack Query 5.90) already includes many performance optimizations by default. React 19's Compiler automatically handles memoization, reducing the need for manual React.memo/useMemo/useCallback. Vite performs automatic tree shaking and code splitting. React Query is already configured with 1-minute staleTime to minimize redundant API calls.

The primary optimizations needed for this phase are: (1) route-based code splitting with React.lazy, (2) native image lazy loading with loading="lazy", (3) list virtualization for 100+ drill items, (4) modern image formats (WebP/AVIF), and (5) bundle analysis to identify optimization opportunities.

**Primary recommendation:** Profile first with Lighthouse/Chrome DevTools, then apply targeted optimizations starting with route-based code splitting and image optimization, which provide the highest ROI with minimal complexity.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19.2 | 19.2.0 | Framework with built-in performance features | React Compiler auto-memoizes, Suspense for code splitting, concurrent rendering |
| Vite | 7.2+ | Build tool with optimizations | Automatic tree shaking, fast HMR, rollup-based production builds, ES modules |
| @tanstack/react-query | 5.90+ | Data fetching and caching | Intelligent caching, staleTime/gcTime configuration, automatic background refetching |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-virtual | 3.10+ | List virtualization | Rendering 100+ items in scrollable lists (drill library) |
| rollup-plugin-visualizer | 6.0+ | Bundle analysis | Identifying large dependencies and optimization opportunities |
| react-loading-skeleton | 3.5.0 | Loading UI | Already installed, provides consistent skeleton states |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tanstack/react-virtual | react-window, react-virtualized | TanStack Virtual is modern, headless, and actively maintained; react-virtualized is legacy |
| Native lazy loading | vanilla-lazyload, lozad | Native loading="lazy" has universal browser support in 2026, no JS needed |
| React Compiler auto-memoization | Manual React.memo everywhere | Manual memoization adds complexity; compiler handles it automatically in React 19 |

**Installation:**
```bash
npm install @tanstack/react-virtual rollup-plugin-visualizer -D
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── pages/           # Route-level components (lazy loaded)
├── components/      # Shared components
├── hooks/           # Custom hooks with query key factories
├── lib/             # Utilities and configs
└── assets/          # Optimized images (WebP/AVIF with fallbacks)
```

### Pattern 1: Route-Based Code Splitting
**What:** Load route components on-demand using React.lazy and Suspense
**When to use:** For all route-level pages to reduce initial bundle size
**Example:**
```typescript
// Source: https://react.dev/reference/react/lazy
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load route components
const HomePage = lazy(() => import('./pages/HomePage'));
const DrillLibraryPage = lazy(() => import('./pages/DrillLibraryPage'));
const SessionPlannerPage = lazy(() => import('./pages/SessionPlannerPage'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/drills" element={<DrillLibraryPage />} />
        <Route path="/sessions" element={<SessionPlannerPage />} />
      </Routes>
    </Suspense>
  );
}
```

### Pattern 2: List Virtualization
**What:** Render only visible items in large lists using TanStack Virtual
**When to use:** Lists with 100+ items (drill library meets this threshold)
**Example:**
```typescript
// Source: https://tanstack.com/virtual/latest
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function DrillList({ drills }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: drills.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated drill card height
    overscan: 5, // Render 5 extra items above/below viewport
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <DrillCard drill={drills[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Pattern 3: Native Image Lazy Loading
**What:** Use native HTML loading="lazy" attribute for below-fold images
**When to use:** All images except hero/above-fold images
**Example:**
```tsx
// Source: https://web.dev/articles/browser-level-image-lazy-loading
// Above-fold image - load immediately
<img src="hero.webp" alt="Hero" />

// Below-fold images - lazy load
<img
  src="drill-thumbnail.webp"
  alt="Drill thumbnail"
  loading="lazy"
  width="320"
  height="180"
/>
```

### Pattern 4: Modern Image Formats with Fallbacks
**What:** Serve WebP/AVIF with JPEG fallback using <picture> element
**When to use:** All images to reduce bandwidth by 30-50%
**Example:**
```tsx
// Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
<picture>
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Fallback" loading="lazy" />
</picture>
```

### Pattern 5: Vite Build Configuration
**What:** Configure Vite for optimal production builds
**When to use:** Always, in vite.config.ts
**Example:**
```typescript
// Source: https://vite.dev/guide/performance
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }) // Generate bundle analysis
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js', '@supabase/ssr'],
        }
      }
    },
    // Modern browsers only (ES2020)
    target: 'es2020',
    // Inline small assets as base64
    assetsInlineLimit: 4096,
  },
  // Resolve extensions explicitly to reduce FS checks
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  }
});
```

### Pattern 6: React Query Cache Configuration
**What:** Configure staleTime and gcTime per query based on data volatility
**When to use:** For all queries, tuned to data freshness requirements
**Example:**
```typescript
// Global defaults (already configured in project)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

// Per-query overrides for different data types
function useDrills() {
  return useQuery({
    queryKey: ['drills'],
    queryFn: fetchDrills,
    staleTime: 5 * 60 * 1000, // 5 minutes - drills change infrequently
    gcTime: 10 * 60 * 1000,   // 10 minutes - keep in cache longer
  });
}

function useSessionDetails(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => fetchSession(id),
    staleTime: 30 * 1000,     // 30 seconds - sessions change frequently
    gcTime: 5 * 60 * 1000,    // 5 minutes - shorter cache
  });
}
```

### Anti-Patterns to Avoid
- **Premature memoization:** Don't wrap every component in React.memo or use useMemo/useCallback everywhere - React 19 Compiler handles this automatically. Only add manual memoization after profiling shows a bottleneck.
- **Single Suspense boundary:** Wrapping entire app in one Suspense means one slow resource blocks everything. Use granular Suspense boundaries per route or data region.
- **Inline object/function props:** Defeats memoization. Extract to stable references or use useCallback with proper dependencies.
- **Disabling cache in DevTools:** Vite dev server uses aggressive caching - disabling browser cache during development significantly slows HMR and reload times.
- **Over-aggressive code splitting:** Splitting every component into its own bundle creates overhead. Focus on route-level splitting and vendor chunks.
- **Ignoring layout shift:** Lazy loaded images/components without size hints cause cumulative layout shift (CLS). Always specify width/height or use skeleton loaders with matching dimensions.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| List virtualization | Custom windowing logic | @tanstack/react-virtual | Handles dynamic heights, scroll restoration, variable sizing, bi-directional scrolling, and edge cases |
| Image lazy loading | Custom Intersection Observer | Native loading="lazy" | Universal browser support in 2026, no JavaScript needed, handles connection speed automatically |
| Bundle analysis | Manual chunk inspection | rollup-plugin-visualizer | Visual treemap, multiple output formats, automatic size calculation including gzip/brotli |
| Image optimization | Manual compression scripts | Build-time tools or CDN | Image optimization requires complex quality/size tradeoffs, format detection, and responsive sizing |
| Memoization | Manual React.memo everywhere | React 19 Compiler | Compiler automatically memoizes values and components, handles dependency tracking, no manual maintenance |
| Code splitting | Manual dynamic imports | React.lazy + Suspense | Standard API, built-in loading states, error boundaries integration, SSR support |

**Key insight:** Performance optimization has well-established solutions. Custom implementations often miss edge cases (scroll restoration, accessibility, connection awareness) and add maintenance burden. Use battle-tested libraries and native browser features.

## Common Pitfalls

### Pitfall 1: Optimizing Before Measuring
**What goes wrong:** Adding memoization, code splitting, or virtualization without profiling first wastes time and adds complexity without measurable benefit.
**Why it happens:** "Premature optimization is the root of all evil" - developers optimize based on assumptions rather than data.
**How to avoid:**
1. Run Lighthouse audit to get baseline LCP, FCP, TBT metrics
2. Use Chrome DevTools Performance tab to identify actual bottlenecks
3. Apply targeted optimizations only where profiling shows impact
4. Measure again to verify improvement
**Warning signs:** Adding optimization code "just in case", no before/after metrics, complexity increasing without performance gains

### Pitfall 2: Ignoring Core Web Vitals Thresholds
**What goes wrong:** Not targeting specific metrics leads to unfocused optimization efforts.
**Why it happens:** Developers optimize "feel" rather than measurable standards.
**How to avoid:**
- **LCP (Largest Contentful Paint):** Must be under 2.5s for "good" rating
  - Optimize by: code splitting, image optimization, preloading critical resources
- **FCP (First Contentful Paint):** Target under 1.8s
  - Optimize by: reducing initial bundle size, inline critical CSS
- **CLS (Cumulative Layout Shift):** Target under 0.1
  - Optimize by: specify image dimensions, reserve space for dynamic content, avoid inserting content above existing
**Warning signs:** No defined performance targets, optimizing metrics that don't affect user experience, missing the 75th percentile measurement standard

### Pitfall 3: Breaking Memoization with Unstable References
**What goes wrong:** Components wrapped in React.memo or using useMemo re-render unnecessarily because props are recreated each render.
**Why it happens:** Passing inline objects, arrays, or functions as props creates new references.
**How to avoid:**
```typescript
// BAD - new object every render
<Profile user={{ name, age }} />

// GOOD - pass primitive values
<Profile name={name} age={age} />

// BAD - new function every render
<Button onClick={() => handleClick(id)} />

// GOOD - stable function with useCallback
const handleClickId = useCallback(() => handleClick(id), [id]);
<Button onClick={handleClickId} />
```
**Warning signs:** Memoized components re-rendering on every parent render, React DevTools Profiler showing unexpected renders, stable props but component still updates

### Pitfall 4: Lazy Loading Above-Fold Content
**What goes wrong:** Lazy loading critical, immediately-visible content delays LCP and degrades perceived performance.
**Why it happens:** Applying lazy loading="lazy" indiscriminately to all images.
**How to avoid:**
- Load hero images, above-fold content, and initial viewport images eagerly
- Only lazy load below-fold images (content requiring scroll to view)
- Use Intersection Observer with rootMargin to start loading slightly before viewport
**Warning signs:** Placeholder visible on page load for hero image, LCP metric degraded after adding lazy loading, "flash" of loading skeleton for initial content

### Pitfall 5: Over-Splitting Code
**What goes wrong:** Excessive code splitting creates too many small chunks, increasing HTTP overhead and potentially slowing load times.
**Why it happens:** Splitting at component level rather than route level, treating all code equally.
**How to avoid:**
- Focus on route-based splitting (pages, not components)
- Group related vendor libraries into logical chunks (react-vendor, query-vendor)
- Avoid splitting chunks smaller than 10-20KB (overhead > benefit)
- Use bundle analyzer to verify chunk sizes are reasonable
**Warning signs:** Hundreds of tiny JS chunks, waterfall network requests, total transfer time increased despite smaller chunks

### Pitfall 6: Forgetting gcTime vs staleTime
**What goes wrong:** Confusion between staleTime (when data becomes stale) and gcTime (when to garbage collect) leads to unnecessary refetches or memory leaks.
**Why it happens:** Similar naming, overlapping concepts, poor mental model.
**How to avoid:**
- **staleTime:** How long data is considered fresh (no background refetch)
  - Default: 0 (immediately stale)
  - Higher = fewer refetches, better for static data
- **gcTime:** How long unused data stays in memory after last observer unmounts
  - Default: 5 minutes
  - Higher = faster subsequent renders, more memory usage
- Pattern: staleTime < gcTime (data goes stale before garbage collection)
**Warning signs:** Unexpected refetches on component mount, memory growing unbounded, cache cleared before component remounts

### Pitfall 7: Not Providing Fallback Dimensions
**What goes wrong:** Images/components without explicit dimensions cause layout shift (CLS) as content loads and browser reflows layout.
**Why it happens:** Forgetting to specify width/height, using aspect-ratio without container, dynamic content without space reservation.
**How to avoid:**
```tsx
// BAD - no dimensions
<img src="image.jpg" loading="lazy" />

// GOOD - explicit dimensions
<img
  src="image.jpg"
  width="320"
  height="180"
  loading="lazy"
/>

// GOOD - aspect ratio with CSS
<div style={{ aspectRatio: '16/9' }}>
  <img src="image.jpg" loading="lazy" style={{ width: '100%' }} />
</div>

// GOOD - skeleton with matching dimensions
<Suspense fallback={<Skeleton height={200} />}>
  <DrillCard />
</Suspense>
```
**Warning signs:** Layout shifts during scroll, CLS score > 0.1, content "jumping" as images load

## Code Examples

Verified patterns from official sources:

### Vite Bundle Analysis Configuration
```typescript
// Source: https://github.com/btd/rollup-plugin-visualizer
// vite.config.ts
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // Add as LAST plugin
    visualizer({
      open: true,              // Auto-open in browser after build
      filename: 'stats.html',  // Output file
      gzipSize: true,          // Show gzip sizes
      brotliSize: true,        // Show brotli sizes
    })
  ]
});
```

### TanStack Virtual with Dynamic Heights
```typescript
// Source: https://tanstack.com/virtual/latest
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualDrillList({ drills }: { drills: Drill[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: drills.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <DrillCard drill={drills[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Route-Based Code Splitting with Error Boundaries
```typescript
// Source: https://react.dev/reference/react/Suspense
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Routes, Route } from 'react-router-dom';

const DrillLibraryPage = lazy(() => import('./pages/DrillLibraryPage'));
const SessionPlannerPage = lazy(() => import('./pages/SessionPlannerPage'));

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingSkeleton />}>
        <Routes>
          <Route path="/drills" element={<DrillLibraryPage />} />
          <Route path="/sessions/*" element={<SessionPlannerPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6">
      <Skeleton count={5} height={100} />
    </div>
  );
}
```

### Responsive Images with Modern Formats
```tsx
// Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
function DrillThumbnail({ drill }: { drill: Drill }) {
  return (
    <picture>
      {/* Modern formats with smallest file size */}
      <source
        srcSet={`${drill.thumbnail}.avif 1x, ${drill.thumbnail}@2x.avif 2x`}
        type="image/avif"
      />
      <source
        srcSet={`${drill.thumbnail}.webp 1x, ${drill.thumbnail}@2x.webp 2x`}
        type="image/webp"
      />
      {/* Fallback for older browsers */}
      <img
        src={`${drill.thumbnail}.jpg`}
        srcSet={`${drill.thumbnail}@2x.jpg 2x`}
        alt={drill.name}
        width="320"
        height="180"
        loading="lazy"
        className="rounded-lg"
      />
    </picture>
  );
}
```

### Granular Suspense Boundaries
```typescript
// Source: https://react.dev/reference/react/Suspense
// BAD - one boundary blocks everything
<Suspense fallback={<LoadingSpinner />}>
  <Header />
  <Sidebar />
  <MainContent />
</Suspense>

// GOOD - independent loading states
<>
  <Header /> {/* Static, no suspense needed */}
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
</>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual React.memo/useMemo | React 19 Compiler auto-memoization | React 19.2 (2025) | Removes need for manual memoization in most cases, simplifies code |
| react-virtualized | @tanstack/react-virtual | 2023-2024 | Modern headless API, smaller bundle, better TypeScript support |
| JavaScript lazy loading libraries | Native loading="lazy" | Universal support 2023+ | No JavaScript needed, connection-aware, better browser integration |
| JPEG/PNG only | WebP/AVIF with fallbacks | AVIF support Safari 2023+ | 30-50% smaller file sizes, faster page loads |
| Webpack | Vite | 2021-2024 | 10-100x faster dev server, simpler config, native ESM |
| cacheTime | gcTime | TanStack Query v5 (2023) | Naming clarity, same functionality |
| Custom bundle analysis | rollup-plugin-visualizer | Vite ecosystem standard | Visual treemap, better insights, automatic size calculation |

**Deprecated/outdated:**
- **react-virtualized:** Still works but maintenance slowed; TanStack Virtual is the modern replacement
- **Manual Intersection Observer for images:** Native loading="lazy" is simpler and connection-aware
- **Create React App:** Vite is the recommended tooling for new React projects
- **cacheTime in React Query:** Renamed to gcTime in v5 for clarity

## Open Questions

Things that couldn't be fully resolved:

1. **Supabase Storage image transformation capabilities**
   - What we know: Supabase Storage supports signed URLs for private media
   - What's unclear: Whether Supabase offers built-in image transformation (resize, format conversion) or if we need external processing
   - Recommendation: Check Supabase docs for image transformation API; if unavailable, generate multiple sizes at upload time or use CDN with transformation capabilities

2. **React 19 Compiler adoption status**
   - What we know: React 19.2 includes the Compiler for automatic memoization
   - What's unclear: Whether it requires explicit opt-in configuration or is enabled by default in this project
   - Recommendation: Check React docs for Compiler configuration; if not enabled, may need to add babel plugin or configure in build

3. **Optimal virtualization threshold**
   - What we know: TanStack Virtual recommended for "large lists"
   - What's unclear: Exact item count where virtualization ROI becomes positive (considering implementation complexity vs performance gain)
   - Recommendation: Start with threshold of 100 items (matches success criteria), implement for drill library first, measure before/after

## Sources

### Primary (HIGH confidence)
- [Vite Performance Guide](https://vite.dev/guide/performance) - Official optimization recommendations
- [React.memo Documentation](https://react.dev/reference/react/memo) - Official API reference and best practices
- [Web.dev LCP Guide](https://web.dev/articles/lcp) - Core Web Vitals thresholds and measurement
- [TanStack Virtual](https://tanstack.com/virtual/latest) - Official documentation and examples
- [MDN Responsive Images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images) - Picture element and srcset
- [React Suspense](https://react.dev/reference/react/Suspense) - Official Suspense API docs
- [rollup-plugin-visualizer GitHub](https://github.com/btd/rollup-plugin-visualizer) - Bundle analysis tool

### Secondary (MEDIUM confidence)
- [Elementor AVIF vs WebP Comparison](https://elementor.com/blog/webp-vs-avif/) - Image format performance 2026
- [LogRocket TanStack Virtual Guide](https://blog.logrocket.com/speed-up-long-lists-tanstack-virtual/) - Practical implementation guide
- [The Most Important Core Web Vitals 2026](https://nitropack.io/blog/most-important-core-web-vitals-metrics/) - Updated metrics and thresholds
- [React Performance Optimization 2025](https://dev.to/frontendtoolstech/react-performance-optimization-best-practices-for-2025-2g6b) - Community best practices
- [Vite Build Optimization Guide](https://shaxadd.medium.com/optimizing-your-react-vite-application-a-guide-to-reducing-bundle-size-6b7e93891c96) - Bundle size reduction techniques
- [Can I Use - Loading Lazy](https://caniuse.com/loading-lazy-attr) - Browser support verification
- [Master Caching in React Query](https://manishgcodes.medium.com/master-caching-in-react-query-reduce-network-requests-and-improve-performance-868291494d40) - Caching strategies

### Tertiary (LOW confidence)
- WebSearch results for ecosystem patterns and community practices - marked as needing verification with official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified with official documentation and current version numbers
- Architecture: HIGH - Patterns sourced from official React, Vite, and library documentation
- Pitfalls: MEDIUM-HIGH - Based on official docs plus verified community consensus (multiple sources agreeing)

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable domain, core web standards change slowly)
