/**
 * Database types for Supabase
 *
 * These types mirror the database schema created in Phase 3 Plan 01.
 * When schema changes, regenerate with: npx supabase gen types typescript --project-id "$PROJECT_REF" > src/lib/database.types.ts
 *
 * For now, manually defined to match our migration.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DrillCategory = 'activation' | 'dribbling' | 'passing' | 'shooting'

export interface Database {
  public: {
    Tables: {
      drills: {
        Row: {
          id: string
          created_at: string
          name: string
          video_url: string | null
          video_file_path: string | null
          category: DrillCategory | null
          num_players: number | null
          equipment: string[] | null
          tags: string[] | null
          user_id: string
          creator_email: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          video_url?: string | null
          video_file_path?: string | null
          category?: DrillCategory | null
          num_players?: number | null
          equipment?: string[] | null
          tags?: string[] | null
          user_id: string
          creator_email?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          video_url?: string | null
          video_file_path?: string | null
          category?: DrillCategory | null
          num_players?: number | null
          equipment?: string[] | null
          tags?: string[] | null
          user_id?: string
          creator_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drills_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          created_at: string
          name: string
          grid_data: Json
          user_id: string
          creator_email: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          grid_data?: Json
          user_id: string
          creator_email?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          grid_data?: Json
          user_id?: string
          creator_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience type aliases
export type Drill = Database['public']['Tables']['drills']['Row']
export type DrillInsert = Database['public']['Tables']['drills']['Insert']
export type DrillUpdate = Database['public']['Tables']['drills']['Update']

export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type SessionUpdate = Database['public']['Tables']['sessions']['Update']

// Grid data type for session planner (4 rows x 3 columns)
export interface GridCell {
  drillId: string | null
}

export interface GridData {
  cells: {
    [key: string]: GridCell // key format: "row-col" e.g., "activation-0", "dribbling-1"
  }
}
