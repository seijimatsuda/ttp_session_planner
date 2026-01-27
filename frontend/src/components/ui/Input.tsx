// frontend/src/components/ui/Input.tsx
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above input */
  label: string;
  /** Error message - shows red border and error text */
  error?: string;
  /** Hint text - shows below input when no error */
  hint?: string;
}

/**
 * Accessible input with label, error, and hint support.
 * 44px minimum height for touch targets.
 *
 * @example
 * <Input label="Email" type="email" placeholder="you@example.com" />
 * <Input label="Name" error="Name is required" />
 * <Input label="Bio" hint="Optional - max 500 characters" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    // Generate stable ID from label if not provided
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
          ) || undefined}
          aria-invalid={error ? "true" : undefined}
          className={cn(
            // Base styles - 44px touch target
            "block w-full min-h-11 px-3 rounded-md border shadow-sm",
            "text-gray-900 placeholder:text-gray-400",
            // Focus states
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            // Error vs normal border
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
