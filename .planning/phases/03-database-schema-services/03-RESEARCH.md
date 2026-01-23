# Phase 3: Database Schema & Services - Research

**Researched:** 2026-01-22
**Domain:** Supabase PostgreSQL with RLS, TypeScript type generation, TanStack React Query integration
**Confidence:** HIGH

## Summary

This research covers implementing database schemas in Supabase PostgreSQL with Row Level Security (RLS), TypeScript type generation, and TanStack React Query integration for type-safe data access. The standard approach uses Supabase CLI for migrations and type generation, implements RLS policies for multi-tenant data isolation, and leverages TanStack React Query for client-side data management with optional Supabase Cache Helpers for simplified cache key management.

The core stack consists of Supabase PostgreSQL for database hosting, Supabase CLI (v1.8.1+) for type generation and migrations, TanStack React Query (v5) for client-side state management, and the official @supabase/supabase-js client library. Type safety flows from database schema through generated TypeScript definitions to runtime queries, ensuring end-to-end type checking from client to database.

Key architectural decisions include using migrations over direct SQL Editor changes for production environments, wrapping auth.uid() in SELECT statements for RLS performance optimization, organizing service functions by domain entity (drills, sessions), and using .throwOnError() on all Supabase queries so TanStack Query properly handles error states.

**Primary recommendation:** Use Supabase CLI migrations for schema changes, generate TypeScript types automatically, implement RLS with performance-optimized policies (wrapped auth.uid(), indexed columns), and structure queries through reusable service functions consumed by TanStack Query hooks.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | Latest (v2.48.0+) | Supabase client library | Official client with TypeScript support, JSON type inference |
| @tanstack/react-query | v5 | Client-side data fetching/caching | Industry standard for server state management in React |
| Supabase CLI | v1.8.1+ | Type generation and migrations | Official tool for schema-to-TypeScript workflow |
| PostgreSQL | 15+ | Database engine | Supabase-hosted Postgres with RLS support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase-cache-helpers/postgrest-react-query | Latest | Automatic query key generation | Use for simplified cache management (auto-generates keys from queries) |
| pg_jsonschema | Built-in | JSONB validation | Use when storing unstructured data that needs schema validation |
| type-fest | Latest | Type utilities | Use for MergeDeep to override inaccurate generated types |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Query | SWR | SWR is simpler but less feature-rich; TanStack Query is more powerful for complex caching scenarios |
| Supabase Cache Helpers | Manual query keys | Manual keys give more control but require coordination between queries/mutations |
| Migrations | SQL Editor only | SQL Editor is faster for prototyping but migrations provide version control and team collaboration |

**Installation:**
```bash
npm install @supabase/supabase-js @tanstack/react-query
npm install supabase@">=1.8.1" --save-dev
# Optional: Cache helpers
npm install @supabase-cache-helpers/postgrest-react-query
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── supabase.ts          # Supabase client initialization
│   └── database.types.ts     # Generated TypeScript types
├── services/
│   ├── drills.service.ts     # Drill CRUD operations
│   └── sessions.service.ts   # Session CRUD operations
├── hooks/
│   ├── useDrills.ts          # TanStack Query hooks for drills
│   └── useSessions.ts        # TanStack Query hooks for sessions
└── providers/
    └── QueryProvider.tsx     # TanStack Query setup
```

### Pattern 1: Database Migration Workflow
**What:** Version-controlled SQL files for schema changes
**When to use:** All production schema changes, team environments

**Migration files:** `supabase/migrations/<timestamp>_<description>.sql`

**Workflow:**
1. Create migration: `supabase migration new create_drills_table`
2. Write SQL in generated file
3. Apply locally: `supabase migration up`
4. Test changes
5. Push to production: `supabase db push`

**Example migration file:**
```sql
-- Source: https://supabase.com/docs/guides/deployment/database-migrations
-- Create drills table
create table public.drills (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  name text not null,
  video_url text,
  video_file_path text,
  category text check (category in ('activation', 'dribbling', 'passing', 'shooting')),
  num_players integer,
  equipment text[],
  tags text[],
  user_id uuid references auth.users not null,
  creator_email text
);

-- Enable RLS
alter table public.drills enable row level security;

-- RLS policies
create policy "Users view own drills"
  on public.drills for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own drills"
  on public.drills for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own drills"
  on public.drills for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own drills"
  on public.drills for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Performance: Index user_id for RLS
create index drills_user_id_idx on public.drills(user_id);
```

### Pattern 2: TypeScript Type Generation
**What:** Auto-generate types from database schema
**When to use:** After every schema change

**Commands:**
```bash
# For remote projects
npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > src/lib/database.types.ts

# For local development
npx supabase gen types typescript --local > src/lib/database.types.ts
```

**Usage in client:**
```typescript
// Source: https://supabase.com/docs/guides/api/rest/generating-types
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Type shortcuts
export type Drill = Database['public']['Tables']['drills']['Row']
export type DrillInsert = Database['public']['Tables']['drills']['Insert']
export type DrillUpdate = Database['public']['Tables']['drills']['Update']
```

### Pattern 3: Service Layer with Reusable Query Functions
**What:** Centralize database operations in service functions
**When to use:** All database interactions

**Service function pattern:**
```typescript
// Source: https://makerkit.dev/blog/saas/supabase-react-query
// services/drills.service.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

type Client = SupabaseClient<Database>
type Drill = Database['public']['Tables']['drills']['Row']

export async function getDrillsByUser(client: Client, userId: string) {
  return client
    .from('drills')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .throwOnError() // CRITICAL: Makes errors throwable for React Query
}

export async function createDrill(
  client: Client,
  drill: Omit<Drill, 'id' | 'created_at'>
) {
  return client
    .from('drills')
    .insert(drill)
    .select()
    .single()
    .throwOnError()
}

export async function updateDrill(
  client: Client,
  id: string,
  updates: Partial<Drill>
) {
  return client
    .from('drills')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
    .throwOnError()
}

export async function deleteDrill(client: Client, id: string) {
  return client
    .from('drills')
    .delete()
    .eq('id', id)
    .throwOnError()
}
```

### Pattern 4: TanStack Query Hooks
**What:** React Query hooks wrapping service functions
**When to use:** All component-level data access

**Query hook:**
```typescript
// Source: https://makerkit.dev/blog/saas/supabase-react-query
// hooks/useDrills.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { getDrillsByUser, createDrill, updateDrill, deleteDrill } from '@/services/drills.service'

export function useDrills(userId: string) {
  const client = useSupabase()

  return useQuery({
    queryKey: ['drills', userId],
    queryFn: async () => {
      const { data } = await getDrillsByUser(client, userId)
      return data
    },
  })
}

export function useCreateDrill() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (drill: Parameters<typeof createDrill>[1]) =>
      createDrill(client, drill),
    onSuccess: (data, variables) => {
      // Invalidate and refetch drills list
      queryClient.invalidateQueries({
        queryKey: ['drills', variables.user_id],
      })
    },
  })
}

export function useUpdateDrill() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateDrill(client, id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['drills', data.user_id],
      })
    },
  })
}

export function useDeleteDrill() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDrill(client, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['drills'] })
    },
  })
}
```

### Pattern 5: RLS Policy Optimization
**What:** Performance-optimized RLS policies with wrapped functions and indexes
**When to use:** All RLS policies

**Key optimizations:**
1. **Wrap auth.uid() in SELECT**: `(SELECT auth.uid())` instead of `auth.uid()` enables query caching (94-99% performance improvement)
2. **Index user_id columns**: Add indexes on foreign key columns used in policies (99.94% improvement on large tables)
3. **Specify roles with TO clause**: Prevents unnecessary policy evaluation for anon users
4. **Explicit authentication checks**: `auth.uid() IS NOT NULL AND auth.uid() = user_id`

**Optimized policy template:**
```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security
create policy "policy_name"
  on table_name
  for select
  to authenticated  -- Specifies role, prevents anon evaluation
  using (
    (select auth.uid()) = user_id  -- Wrapped for caching
  );

-- Performance index
create index table_name_user_id_idx on table_name(user_id);
```

### Pattern 6: QueryClientProvider Setup
**What:** Configure TanStack Query with appropriate defaults
**When to use:** App initialization

```typescript
// Source: https://makerkit.dev/blog/saas/supabase-react-query
// providers/QueryProvider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute - prevents immediate refetch
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Anti-Patterns to Avoid
- **Direct SQL Editor changes for production:** Use migrations for version control and reproducibility
- **Bare auth.uid() in RLS policies:** Always wrap in SELECT for performance
- **Missing .throwOnError() on queries:** React Query won't catch errors without it
- **No indexes on RLS columns:** Causes severe performance degradation on large tables
- **Exposing service_role keys:** These bypass RLS; keep server-side only
- **Over-using JSONB/arrays:** Normalize when you need to query or join on nested data
- **Enabling RLS without policies:** Locks out all access, including authenticated users
- **Using user_metadata in RLS:** Users can modify this; use auth.uid() or app_metadata

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript types from schema | Manual type definitions | Supabase CLI type generation | Auto-generated types stay synced with schema, includes Insert/Update variants |
| Query cache keys | Manual key strings | Supabase Cache Helpers | Automatically generates unique keys from queries, prevents key coordination bugs |
| JSONB validation | Application-level validation | pg_jsonschema extension | Database-level validation prevents invalid data, enforced at constraint level |
| User-scoped data access | Application logic filtering | RLS policies | Defense-in-depth security, works even if app logic has bugs |
| Migration version control | Manual SQL file tracking | Supabase migrations | Timestamp-based ordering, automatic up/down tracking, seed data support |
| Array element queries | Custom parsing logic | PostgreSQL array operators | Built-in @> (contains), && (overlaps), indexed with GIN |

**Key insight:** Supabase and PostgreSQL provide database-level solutions for problems developers often implement in application code. Using these built-in features provides better performance, security, and maintainability than custom implementations.

## Common Pitfalls

### Pitfall 1: Forgetting to Enable RLS
**What goes wrong:** Tables created without RLS are fully accessible to all users with the anon key, exposing all data.
**Why it happens:** RLS is not enabled by default on tables created via SQL (only via Dashboard Table Editor).
**How to avoid:** Always run `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;` immediately after creating tables in migrations.
**Warning signs:** All users can see each other's data; security audit tools flag missing RLS.

### Pitfall 2: RLS Enabled But No Policies
**What goes wrong:** With RLS enabled but no policies defined, no one can access the data—not even authenticated users.
**Why it happens:** Developers enable RLS thinking it will "just work" without understanding policies are required.
**How to avoid:** Create at least one policy immediately after enabling RLS; test by querying as an authenticated user.
**Warning signs:** All queries return empty results; users report "can't see my data."

### Pitfall 3: Missing .throwOnError() on Supabase Queries
**What goes wrong:** Errors are returned in the response object instead of being thrown. TanStack Query won't detect them, leaving error state empty while data is undefined.
**Why it happens:** Supabase's default error handling returns `{ data, error }` objects.
**How to avoid:** Add `.throwOnError()` to all Supabase queries before returning.
**Warning signs:** UI doesn't show error messages; error boundaries don't catch; isError is false but data is undefined.

### Pitfall 4: Unoptimized RLS Performance
**What goes wrong:** Queries become extremely slow (100x+ slower) as tables grow, especially SELECT operations.
**Why it happens:** RLS policies execute per-row without indexes; bare auth.uid() calls run on every row.
**How to avoid:**
  - Wrap auth.uid() in SELECT: `(SELECT auth.uid())`
  - Add indexes on columns used in policies: `CREATE INDEX table_user_id_idx ON table(user_id);`
  - Add explicit `.eq('user_id', userId)` filters in queries matching policy logic
**Warning signs:** Queries that were fast with small datasets become sluggish; database CPU spikes.

### Pitfall 5: Using user_metadata in RLS Policies
**What goes wrong:** Security vulnerability—users can modify their own user_metadata via the API, bypassing intended restrictions.
**Why it happens:** Developers assume all JWT claims are immutable.
**How to avoid:** Use auth.uid() for user identity or app_metadata (admin-controlled) for roles/permissions. Never trust user_metadata in security decisions.
**Warning signs:** Users report being able to access data they shouldn't; security audits flag user-controlled policy inputs.

### Pitfall 6: Exposing service_role Key in Client Code
**What goes wrong:** Anyone with the key can bypass RLS and access/modify all data in the database.
**Why it happens:** Developers use service_role for "quick testing" or to bypass RLS issues, then forget to remove it.
**How to avoid:** Use service_role only in server-side code (API routes, serverless functions). Never commit it to frontend environment variables.
**Warning signs:** Browser DevTools shows service_role in network requests; git history contains service keys.

### Pitfall 7: Missing Indexes on Foreign Keys Used in RLS
**What goes wrong:** Even with wrapped auth.uid(), queries slow down dramatically as row counts increase.
**Why it happens:** RLS policies filter on user_id but no index exists for fast lookups.
**How to avoid:** Create indexes on all foreign key columns used in RLS policies: `CREATE INDEX table_user_id_idx ON table(user_id);`
**Warning signs:** EXPLAIN ANALYZE shows sequential scans on large tables; performance degrades linearly with data volume.

### Pitfall 8: Over-Normalizing Array/JSONB Columns
**What goes wrong:** Simple string arrays stored as separate tables with join tables, adding unnecessary complexity.
**Why it happens:** Following "always normalize" advice without considering use case.
**How to avoid:** Use arrays for homogeneous collections rarely queried individually (tags, equipment). Use JSONB for variable-schema data (grid_data). Normalize when you need to filter, join, or maintain referential integrity.
**Warning signs:** Three tables (drills, tags, drill_tags) for simple tag storage; complex JOINs for simple data.

### Pitfall 9: Not Testing RLS Policies Across User Roles
**What goes wrong:** Policies work for authenticated users but fail for anon, or vice versa.
**Why it happens:** Testing only with a single user/role combination.
**How to avoid:** Test policies with: (1) authenticated user owns data, (2) authenticated user doesn't own data, (3) anon user, (4) different user roles if applicable.
**Warning signs:** Production bugs where users see wrong data; access denied errors in specific scenarios.

### Pitfall 10: Overusing JSONB for Relational Data
**What goes wrong:** Loss of referential integrity, query performance, and type safety for data that's actually structured.
**Why it happens:** JSONB seems convenient for "flexible" schemas without thinking about queryability.
**How to avoid:** Use JSONB only for truly unstructured/variable data (webhook payloads, user preferences). Use proper columns/tables for structured data you'll query frequently.
**Warning signs:** Complex JSONB queries with ->, ->>, and #>; can't use foreign keys; TypeScript types are overly generic.

## Code Examples

Verified patterns from official sources:

### Complete Migration Example
```sql
-- Source: https://supabase.com/docs/guides/deployment/database-migrations
-- Migration: 20260122_create_sessions_table.sql

-- Create sessions table
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  name text not null,
  grid_data jsonb not null,
  user_id uuid references auth.users not null,
  creator_email text
);

-- Enable RLS
alter table public.sessions enable row level security;

-- RLS policies with performance optimizations
create policy "Users view own sessions"
  on public.sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own sessions"
  on public.sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own sessions"
  on public.sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own sessions"
  on public.sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Performance indexes
create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_created_at_idx on public.sessions(created_at desc);

-- JSONB validation with pg_jsonschema (optional)
alter table public.sessions
  add constraint valid_grid_data
  check (
    jsonb_matches_schema(
      '{
        "type": "object",
        "required": ["layout", "items"],
        "properties": {
          "layout": {"type": "array"},
          "items": {"type": "object"}
        }
      }'::jsonb,
      grid_data
    )
  );
```

### Complete Service + Hook Example
```typescript
// Source: https://makerkit.dev/blog/saas/supabase-react-query

// services/sessions.service.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

type Client = SupabaseClient<Database>
type Session = Database['public']['Tables']['sessions']['Row']
type SessionInsert = Database['public']['Tables']['sessions']['Insert']

export async function getSessionsByUser(client: Client, userId: string) {
  return client
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .throwOnError()
}

export async function getSessionById(client: Client, id: string) {
  return client
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()
    .throwOnError()
}

export async function createSession(client: Client, session: SessionInsert) {
  return client
    .from('sessions')
    .insert(session)
    .select()
    .single()
    .throwOnError()
}

export async function updateSession(
  client: Client,
  id: string,
  updates: Partial<Session>
) {
  return client
    .from('sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
    .throwOnError()
}

export async function deleteSession(client: Client, id: string) {
  return client
    .from('sessions')
    .delete()
    .eq('id', id)
    .throwOnError()
}

// hooks/useSessions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import {
  getSessionsByUser,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
} from '@/services/sessions.service'

export function useSessions(userId: string) {
  const client = useSupabase()

  return useQuery({
    queryKey: ['sessions', userId],
    queryFn: async () => {
      const { data } = await getSessionsByUser(client, userId)
      return data
    },
    enabled: !!userId,
  })
}

export function useSession(id: string) {
  const client = useSupabase()

  return useQuery({
    queryKey: ['sessions', id],
    queryFn: async () => {
      const { data } = await getSessionById(client, id)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateSession() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (session: Parameters<typeof createSession>[1]) =>
      createSession(client, session).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['sessions', data.user_id],
      })
    },
  })
}

export function useUpdateSession() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateSession(client, id, updates).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.setQueryData(['sessions', data.id], data)
    },
  })
}

export function useDeleteSession() {
  const client = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSession(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}
```

### Array Column Usage
```typescript
// Source: https://supabase.com/docs/guides/database/arrays

// Insert with array columns
const { data, error } = await supabase
  .from('drills')
  .insert({
    name: 'Warm-up drill',
    equipment: ['cones', 'balls', 'bibs'],
    tags: ['warm-up', 'passing', 'beginner'],
    user_id: userId,
  })
  .select()
  .single()
  .throwOnError()

// Query with array contains
const { data } = await supabase
  .from('drills')
  .select('*')
  .contains('tags', ['passing'])  // Has 'passing' tag
  .throwOnError()

// Query with array overlap
const { data } = await supabase
  .from('drills')
  .select('*')
  .overlaps('equipment', ['balls', 'goals'])  // Has any of these
  .throwOnError()
```

### JSONB Column Usage with Type Safety
```typescript
// Source: https://supabase.com/docs/guides/database/json

// Define custom type for JSONB column
type GridData = {
  layout: Array<{ x: number; y: number; w: number; h: number; i: string }>
  items: Record<string, { type: string; content: any }>
}

// Extend generated types
import { MergeDeep } from 'type-fest'
import { Database } from './database.types'

type CustomDatabase = MergeDeep<
  Database,
  {
    public: {
      Tables: {
        sessions: {
          Row: {
            grid_data: GridData
          }
          Insert: {
            grid_data: GridData
          }
          Update: {
            grid_data?: GridData
          }
        }
      }
    }
  }
>

// Use custom types with client
const supabase = createClient<CustomDatabase>(url, key)

// Insert with typed JSONB
const { data } = await supabase
  .from('sessions')
  .insert({
    name: 'Session 1',
    grid_data: {
      layout: [{ x: 0, y: 0, w: 2, h: 2, i: '1' }],
      items: { '1': { type: 'drill', content: {} } },
    },
    user_id: userId,
  })
  .select()
  .single()
  .throwOnError()

// Query nested JSONB with -> and ->>
const { data } = await supabase
  .from('sessions')
  .select('id, name, grid_data->layout')  // Returns layout as JSONB
  .throwOnError()

const { data: textData } = await supabase
  .from('sessions')
  .select('id, name, grid_data->>layout')  // Returns layout as text
  .throwOnError()
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual TypeScript types | Supabase CLI type generation | v1.8.1 (2023) | Automated type sync with schema, Insert/Update variants |
| Bare auth.uid() in RLS | (SELECT auth.uid()) wrapper | Performance docs (2024) | 94-99% query performance improvement |
| React Query v4 | React Query v5 (TanStack Query) | 2024 rebrand | Simplified API, better TypeScript inference |
| Manual query keys | Supabase Cache Helpers | Community (2023+) | Auto-generated keys from queries, zero-config cache management |
| json column type | jsonb column type | PostgreSQL best practice | Binary format enables faster querying and indexing |
| Postgres 14 | Postgres 15+ | Supabase default | Views support security_invoker for RLS enforcement |
| supabase-js v1 | supabase-js v2.48.0+ | 2024 | Enhanced JSON type inference, -> vs ->> operator typing |

**Deprecated/outdated:**
- **Bare auth.uid() in policies**: Performance penalty; wrap in SELECT for caching
- **No .throwOnError()**: Errors won't be caught by React Query; always include it
- **SQL Editor for production changes**: Use migrations for version control and team collaboration
- **json over jsonb**: jsonb is recommended for "almost all cases"
- **Manual cache key coordination**: Supabase Cache Helpers automate this

## Open Questions

Things that couldn't be fully resolved:

1. **Supabase Cache Helpers stability**
   - What we know: Community-maintained library with active development, last updated 22 days ago
   - What's unclear: Long-term support commitment, whether it will become official
   - Recommendation: Safe to use but have fallback plan to manual keys if needed; manual approach is always viable

2. **Optimal staleTime for different data types**
   - What we know: Official examples use 60 seconds (1 minute)
   - What's unclear: Whether drills/sessions need different staleTime values
   - Recommendation: Start with 60 seconds globally, adjust per-query if needed based on how frequently data changes

3. **pg_jsonschema performance impact**
   - What we know: Validates JSONB against JSON Schema at insert/update time
   - What's unclear: Performance impact on write operations with large JSONB documents
   - Recommendation: Use for validation but monitor write performance; consider application-level validation if constraints cause issues

## Sources

### Primary (HIGH confidence)
- Supabase Official Docs: Type Generation - https://supabase.com/docs/guides/api/rest/generating-types
- Supabase Official Docs: Row Level Security - https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Official Docs: Database Migrations - https://supabase.com/docs/guides/deployment/database-migrations
- Supabase Official Docs: JSONB Guide - https://supabase.com/docs/guides/database/json
- Supabase Official Docs: Array Guide - https://supabase.com/docs/guides/database/arrays
- Supabase Official Docs: TypeScript Support - https://supabase.com/docs/reference/javascript/typescript-support

### Secondary (MEDIUM confidence)
- MakerKit: Supabase + React Query Integration - https://makerkit.dev/blog/saas/supabase-react-query
- Supabase Blog: React Query with Next.js and Cache Helpers - https://supabase.com/blog/react-query-nextjs-app-router-cache-helpers
- ProsperaSoft: RLS Misconfigurations - https://prosperasoft.com/blog/database/supabase/supabase-rls-issues/
- Leanware: Supabase Best Practices - https://www.leanware.co/insights/supabase-best-practices

### Tertiary (LOW confidence)
- Supabase Cache Helpers GitHub - https://github.com/psteinroe/supabase-cache-helpers (community-maintained)
- Various Medium articles on service layer patterns (dates unverified)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Supabase docs and TanStack Query docs confirm all libraries and versions
- Architecture: HIGH - Official docs provide migration workflow, type generation, RLS patterns with examples
- Pitfalls: HIGH - Official troubleshooting docs and performance guides document common mistakes
- Service layer patterns: MEDIUM - Based on community tutorials verified against official API docs
- Cache Helpers: MEDIUM - Community library with good adoption but not officially maintained by Supabase

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable ecosystem, Postgres/Supabase patterns are well-established)
