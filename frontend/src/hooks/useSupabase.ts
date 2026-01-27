/**
 * useSupabase hook
 *
 * Provides access to the Supabase client throughout the application.
 * This simple hook returns the singleton client. In the future, this could
 * be enhanced to create user-scoped clients with access tokens.
 */

import { supabase } from '../lib/supabase'

/**
 * Returns the Supabase client for making database queries.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const supabase = useSupabase()
 *   // Use supabase client for queries
 * }
 * ```
 */
export function useSupabase() {
  return supabase
}
