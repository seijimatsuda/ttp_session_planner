/**
 * Drill service - CRUD operations for drills table
 *
 * All functions throw errors so React Query properly handles them.
 * Functions accept a Supabase client to enable both authenticated and admin operations.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, DrillInsert, DrillUpdate } from '../lib/database.types'

type Client = SupabaseClient<Database>

/**
 * Get all drills for a specific user, ordered by creation date (newest first)
 */
export async function getDrillsByUser(client: Client, userId: string) {
  const { data, error } = await client
    .from('drills')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get a single drill by ID
 */
export async function getDrillById(client: Client, id: string) {
  const { data, error } = await client
    .from('drills')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get drills filtered by category
 */
export async function getDrillsByCategory(
  client: Client,
  userId: string,
  category: string
) {
  const { data, error } = await client
    .from('drills')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Search drills by name (case-insensitive partial match)
 */
export async function searchDrills(
  client: Client,
  userId: string,
  searchTerm: string
) {
  const { data, error } = await client
    .from('drills')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', `%${searchTerm}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Create a new drill
 */
export async function createDrill(client: Client, drill: DrillInsert) {
  const { data, error } = await client
    .from('drills')
    .insert(drill)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an existing drill
 */
export async function updateDrill(
  client: Client,
  id: string,
  updates: DrillUpdate
) {
  const { data, error } = await client
    .from('drills')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a drill by ID
 */
export async function deleteDrill(client: Client, id: string) {
  const { error } = await client
    .from('drills')
    .delete()
    .eq('id', id)

  if (error) throw error
}
