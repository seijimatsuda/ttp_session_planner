// frontend/src/components/ui/Skeleton.tsx
import Skeleton from "react-loading-skeleton";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export { Skeleton };

/**
 * Theme provider for consistent skeleton styling.
 * Wrap at app root to apply theme to all skeletons.
 *
 * @example
 * <SkeletonProvider>
 *   <App />
 * </SkeletonProvider>
 */
export function SkeletonProvider({ children }: { children: React.ReactNode }) {
  return (
    <SkeletonTheme
      baseColor="#e5e7eb"     // gray-200
      highlightColor="#f3f4f6" // gray-100
    >
      {children}
    </SkeletonTheme>
  );
}

/**
 * Skeleton loading placeholder.
 * Use within components to show loading state.
 *
 * Pattern: Pass undefined data to show skeleton mode.
 *
 * @example
 * // In a card component
 * function DrillCard({ drill }: { drill?: Drill }) {
 *   return (
 *     <div>
 *       <h3>{drill?.name || <Skeleton width={150} />}</h3>
 *       <p>{drill?.description || <Skeleton count={2} />}</p>
 *     </div>
 *   );
 * }
 *
 * // Usage
 * <DrillCard />              // Shows skeleton
 * <DrillCard drill={data} /> // Shows content
 */
