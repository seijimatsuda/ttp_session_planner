// frontend/src/components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Size variant - all maintain 44px min touch target */
  size?: "default" | "sm" | "lg" | "icon";
  /** Show loading spinner and disable interaction */
  loading?: boolean;
}

/**
 * Accessible button with touch-friendly sizing.
 * All sizes maintain minimum 44px touch target for iOS/iPad.
 *
 * @example
 * <Button>Default</Button>
 * <Button variant="secondary">Secondary</Button>
 * <Button loading>Saving...</Button>
 * <Button size="icon" aria-label="Menu"><MenuIcon /></Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles - 44px min touch target on all sizes
          "inline-flex items-center justify-center font-medium rounded-lg",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",

          // Size variants - all maintain min-h-11 (44px)
          size === "default" && "min-h-11 min-w-11 px-4 py-2 text-sm",
          size === "sm" && "min-h-11 min-w-11 px-3 py-1.5 text-sm",
          size === "lg" && "min-h-12 min-w-12 px-6 py-3 text-base",
          size === "icon" && "min-h-11 min-w-11 p-2",

          // Variant styles
          variant === "primary" && [
            "bg-blue-600 text-white",
            "hover:bg-blue-700 focus:ring-blue-500",
          ],
          variant === "secondary" && [
            "bg-gray-200 text-gray-900",
            "hover:bg-gray-300 focus:ring-gray-500",
          ],
          variant === "ghost" && [
            "bg-transparent text-gray-700",
            "hover:bg-gray-100 focus:ring-gray-500",
          ],
          variant === "danger" && [
            "bg-red-600 text-white",
            "hover:bg-red-700 focus:ring-red-500",
          ],

          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
