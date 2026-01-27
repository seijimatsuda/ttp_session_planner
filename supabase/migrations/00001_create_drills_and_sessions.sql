-- Migration: Create drills and sessions tables with RLS
-- Created: 2026-01-22
-- Phase: 03-database-schema-services

-- =============================================================================
-- DRILLS TABLE
-- =============================================================================

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

-- RLS policies with (SELECT auth.uid()) wrapper for performance
create policy "Users can view own drills"
  on public.drills for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own drills"
  on public.drills for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own drills"
  on public.drills for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own drills"
  on public.drills for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Performance index for RLS queries
create index drills_user_id_idx on public.drills(user_id);
create index drills_created_at_idx on public.drills(created_at desc);
create index drills_category_idx on public.drills(category);

-- =============================================================================
-- SESSIONS TABLE
-- =============================================================================

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  name text not null,
  grid_data jsonb not null default '{"cells": {}}'::jsonb,
  user_id uuid references auth.users not null,
  creator_email text
);

-- Enable RLS
alter table public.sessions enable row level security;

-- RLS policies with (SELECT auth.uid()) wrapper for performance
create policy "Users can view own sessions"
  on public.sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own sessions"
  on public.sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own sessions"
  on public.sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Performance indexes
create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_created_at_idx on public.sessions(created_at desc);

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant access to authenticated users (required for RLS to work)
grant usage on schema public to authenticated;
grant all on public.drills to authenticated;
grant all on public.sessions to authenticated;
