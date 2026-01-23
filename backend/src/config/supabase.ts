import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env')
}

// Admin client - bypasses RLS, use only for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Client factory for user-specific operations (respects RLS)
export const createSupabaseClient = (accessToken?: string) => {
  const options = accessToken
    ? {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    : {}
  return createClient(supabaseUrl, supabaseAnonKey, options)
}
