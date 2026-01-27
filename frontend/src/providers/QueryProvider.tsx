/**
 * TanStack Query Provider
 *
 * Provides QueryClient to the entire application.
 * Configured with sensible defaults for a Supabase-backed app.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient inside component to avoid sharing state between requests (SSR safety)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 1 minute
            staleTime: 60 * 1000,
            // Retry failed requests once
            retry: 1,
            // Don't refetch on window focus for this app (data doesn't change that frequently)
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
