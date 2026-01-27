/**
 * React Query hooks for drill operations
 *
 * These hooks wrap the drill service functions and provide:
 * - Automatic caching via React Query
 * - Loading and error states
 * - Cache invalidation on mutations
 * - Type-safe returns
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from './useSupabase'
import {
  getDrillsByUser,
  getDrillById,
  getDrillsByCategory,
  searchDrills,
  createDrill,
  updateDrill,
  deleteDrill,
} from '../services/drills.service'
import type { Drill, DrillInsert, DrillUpdate, DrillCategory } from '../lib/database.types'

// Query key factory for consistent cache keys
export const drillKeys = {
  all: ['drills'] as const,
  lists: () => [...drillKeys.all, 'list'] as const,
  list: (userId: string) => [...drillKeys.lists(), userId] as const,
  listByCategory: (userId: string, category: DrillCategory) =>
    [...drillKeys.list(userId), { category }] as const,
  search: (userId: string, searchTerm: string) =>
    [...drillKeys.list(userId), { search: searchTerm }] as const,
  details: () => [...drillKeys.all, 'detail'] as const,
  detail: (id: string) => [...drillKeys.details(), id] as const,
}

/**
 * Fetch all drills for a user
 */
export function useDrills(userId: string | undefined) {
  const client = useSupabase()

  return useQuery({
    queryKey: drillKeys.list(userId ?? ''),
    queryFn: () => getDrillsByUser(client, userId!),
    enabled: !!userId,
  })
}

/**
 * Fetch a single drill by ID
 */
export function useDrill(id: string | undefined) {
  const client = useSupabase()

  return useQuery({
    queryKey: drillKeys.detail(id ?? ''),
    queryFn: () => getDrillById(client, id!),
    enabled: !!id,
  })
}

/**
 * Fetch drills filtered by category
 */
export function useDrillsByCategory(
  userId: string | undefined,
  category: DrillCategory | undefined
) {
  const client = useSupabase()

  return useQuery({
    queryKey: drillKeys.listByCategory(userId ?? '', category!),
    queryFn: () => getDrillsByCategory(client, userId!, category!),
    enabled: !!userId && !!category,
  })
}

/**
 * Search drills by name
 */
export function useSearchDrills(userId: string | undefined, searchTerm: string) {
  const client = useSupabase()

  return useQuery({
    queryKey: drillKeys.search(userId ?? '', searchTerm),
    queryFn: () => searchDrills(client, userId!, searchTerm),
    enabled: !!userId && searchTerm.length > 0,
  })
}

/**
 * Create a new drill
 */
export function useCreateDrill() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (drill: DrillInsert): Promise<Drill> => createDrill(client, drill),
    onSuccess: (data) => {
      // Invalidate all drill lists for this user
      queryClient.invalidateQueries({
        queryKey: drillKeys.list(data.user_id),
      })
    },
  })
}

/**
 * Update an existing drill
 */
export function useUpdateDrill() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DrillUpdate }): Promise<Drill> =>
      updateDrill(client, id, updates),
    onSuccess: (data) => {
      // Update the specific drill in cache
      queryClient.setQueryData(drillKeys.detail(data.id), data)
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({
        queryKey: drillKeys.list(data.user_id),
      })
    },
  })
}

/**
 * Delete a drill
 */
export function useDeleteDrill() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDrill(client, id),
    onSuccess: (_data, id) => {
      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: drillKeys.detail(id),
      })
      // Invalidate all lists (we don't have userId here, so invalidate all)
      queryClient.invalidateQueries({
        queryKey: drillKeys.lists(),
      })
    },
  })
}
