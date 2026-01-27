import { useState, useCallback, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  /** Main content of the page */
  children: ReactNode;
  /** Sidebar content (navigation, links, etc.) */
  sidebar?: ReactNode;
  /** Header content (logo, title, user menu, etc.) */
  header?: ReactNode;
  /** Additional className for the main content area */
  className?: string;
}

/**
 * AppShell provides the structural foundation for all pages.
 *
 * - Mobile: hamburger menu triggers slide-in sidebar with backdrop
 * - Desktop (md+): fixed sidebar with main content offset
 *
 * Touch targets are 44px minimum for accessibility.
 */
export function AppShell({
  children,
  sidebar,
  header,
  className,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && sidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, closeSidebar]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-in-out dark:bg-gray-800",
          // Mobile: slide in/out
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "md:translate-x-0"
        )}
      >
        {/* Mobile close button */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700 md:hidden">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Menu
          </span>
          <button
            type="button"
            onClick={closeSidebar}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            aria-label="Close sidebar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Sidebar content */}
        <div className="h-full overflow-y-auto px-4 py-4">{sidebar}</div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex flex-col md:ml-64">
        {/* Mobile header with hamburger */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 md:hidden">
          <button
            type="button"
            onClick={openSidebar}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            aria-label="Open sidebar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {header}
        </header>

        {/* Desktop header (optional) */}
        {header && (
          <header className="hidden h-16 items-center border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800 md:flex">
            {header}
          </header>
        )}

        {/* Main content */}
        <main className={cn("flex-1 p-4 md:p-6", className)}>{children}</main>
      </div>
    </div>
  );
}
