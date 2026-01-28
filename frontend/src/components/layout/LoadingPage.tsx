/**
 * Full-page loading state used as Suspense fallback for lazy-loaded routes.
 * Displays a centered spinner with loading text.
 */
export function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>

        {/* Loading text */}
        <p className="text-gray-600 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
