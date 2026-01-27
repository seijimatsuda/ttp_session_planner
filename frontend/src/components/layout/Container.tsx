import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

interface ContainerProps {
  /** Size variant controlling max-width */
  size?: ContainerSize;
  /** Container content */
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** HTML element to render as */
  as?: "div" | "section" | "article" | "main";
}

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-screen-sm", // 640px
  md: "max-w-screen-md", // 768px
  lg: "max-w-screen-lg", // 1024px
  xl: "max-w-screen-xl", // 1280px
  full: "max-w-full", // No max-width constraint
};

/**
 * Container provides consistent content width and responsive padding.
 *
 * - 5 size variants: sm (640px), md (768px), lg (1024px), xl (1280px), full
 * - Responsive padding: smaller on mobile, larger on desktop
 * - Centered within parent
 */
export function Container({
  size = "lg",
  children,
  className,
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Component>
  );
}
