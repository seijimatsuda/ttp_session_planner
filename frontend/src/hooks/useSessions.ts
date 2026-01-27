/**
 * React Query hooks for session operations
 *
 * These hooks wrap the session service functions and provide:
 * - Automatic caching via React Query
 * - Loading and error states
 * - Cache invalidation on mutations
 * - Type-safe returns
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from './useSupabase'
import {
  getSessionsByUser,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
} from '../services/sessions.service'
import type { SessionInsert, SessionUpdate } from '../lib/database.types'

// Query key factory for consistent cache keys
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (userId: string) => [...sessionKeys.lists(), userId] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
}

/**
 * Fetch all sessions for a user
 */
export function useSessions(userId: string | undefined) {
  const client = useSupabase()

  return useQuery({
    queryKey: sessionKeys.list(userId ?? ''),
    queryFn: () => getSessionsByUser(client, userId!),
    enabled: !!userId,
  })
}

/**
 * Fetch a single session by ID
 */
export function useSession(id: string | undefined) {
  const client = useSupabase()

  return useQuery({
    queryKey: sessionKeys.detail(id ?? ''),
    queryFn: () => getSessionById(client, id!),
    enabled: !!id,
  })
}

/**
 * Create a new session
 */
export function useCreateSession() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (session: SessionInsert) => createSession(client, session),
    onSuccess: (data) => {
      // Invalidate session lists for this user
      queryClient.invalidateQueries({
        queryKey: sessionKeys.list(data.user_id),
      })
    },
  })
}

/**
 * Update an existing session
 */
export function useUpdateSession() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SessionUpdate }) =>
      updateSession(client, id, updates),
    onSuccess: (data) => {
      // Update the specific session in cache
      queryClient.setQueryData(sessionKeys.detail(data.id), data)
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({
        queryKey: sessionKeys.list(data.user_id),
      })
    },
  })
}

/**
 * Delete a session
 */
export function useDeleteSession() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSession(client, id),
    onSuccess: (_data, id) => {
      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: sessionKeys.detail(id),
      })
      // Invalidate all lists (we don't have userId here, so invalidate all)
      queryClient.invalidateQueries({
        queryKey: sessionKeys.lists(),
      })
    },
  })
}
