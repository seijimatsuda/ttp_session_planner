import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import type { ReactNode } from "react";

/**
 * Safely extracts error message from unknown error type.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

/**
 * User-friendly error display component shown when a rendering error occurs.
 * Provides a "Try Again" button to reset the error boundary and retry rendering.
 */
export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = getErrorMessage(error);

  return (
    <div
      role="alert"
      className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6 text-center"
    >
      <div className="text-red-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-12 w-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-red-800">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      </div>
      <button
        onClick={resetErrorBoundary}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Try Again
      </button>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Application-level error boundary wrapper.
 * Catches rendering errors in child components and displays ErrorFallback.
 *
 * Usage:
 *   <AppErrorBoundary>
 *     <App />
 *   </AppErrorBoundary>
 */
export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // Log error for debugging - can be replaced with error reporting service
        console.error("Error caught by boundary:", error);
        console.error("Component stack:", info.componentStack);
      }}
      onReset={() => {
        // Optional: Clear any cached state that might cause the error to repeat
        // Can reload data or reset local state here if needed
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
