/**
 * Session service - CRUD operations for sessions table
 *
 * All functions throw errors so React Query properly handles them.
 * Functions accept a Supabase client to enable both authenticated and admin operations.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Session, SessionInsert, SessionUpdate } from '../lib/database.types'

type Client = SupabaseClient<Database>

/**
 * Get all sessions for a specific user, ordered by creation date (newest first)
 */
export async function getSessionsByUser(client: Client, userId: string): Promise<Session[]> {
  const { data, error } = await client
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Session[]
}

/**
 * Get a single session by ID
 */
export async function getSessionById(client: Client, id: string): Promise<Session> {
  const { data, error } = await client
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Session
}

/**
 * Create a new session
 */
export async function createSession(client: Client, session: SessionInsert): Promise<Session> {
  const { data, error } = await client
    .from('sessions')
    .insert(session)
    .select()
    .single()

  if (error) throw error
  return data as Session
}

/**
 * Update an existing session
 */
export async function updateSession(
  client: Client,
  id: string,
  updates: SessionUpdate
): Promise<Session> {
  const { data, error } = await client
    .from('sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Session
}

/**
 * Delete a session by ID
 */
export async function deleteSession(client: Client, id: string) {
  const { error } = await client
    .from('sessions')
    .delete()
    .eq('id', id)

  if (error) throw error
}
