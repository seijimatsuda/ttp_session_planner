---
phase: 04-supabase-storage-media-upload
plan: 01
subsystem: storage-infrastructure
tags: [supabase-storage, rls, media-upload, typescript]

dependency-graph:
  requires: [01-03-supabase-init, 03-01-database-schema]
  provides: [drill-media-bucket, storage-service, media-types]
  affects: [04-02-upload-component, 04-03-media-player]

tech-stack:
  added: []
  patterns:
    - "RLS policies with (SELECT auth.uid()) optimization"
    - "storage.foldername() for path-based access control"
    - "Signed URLs for private file access"
    - "Constants matching server/client config"

key-files:
  created:
    - supabase/migrations/001_storage_bucket.sql
    - frontend/src/types/media.ts
    - frontend/src/lib/storage.ts
  modified: []

decisions:
  - id: storage-bucket-private
    choice: "Private bucket with signed URLs"
    why: "Security first - files not publicly accessible, requires auth"
  - id: owner-id-vs-foldername
    choice: "owner_id for SELECT/DELETE, foldername for INSERT"
    why: "INSERT has no owner_id yet (set after upload), so validate path matches user"
  - id: types-match-bucket-config
    choice: "TypeScript constants mirror SQL migration arrays"
    why: "Single source of truth pattern - client validates before upload attempt"

metrics:
  duration: 2min
  completed: 2026-01-27
---

# Phase 04 Plan 01: Storage Bucket & Service Summary

**One-liner:** Private drill-media bucket with RLS policies and TypeScript storage service layer for secure media uploads.

## What Was Built

### 1. Storage Bucket Migration (supabase/migrations/001_storage_bucket.sql)

Created the `drill-media` storage bucket with:
- **Private access:** Files not publicly accessible
- **100MB file size limit** enforced at Supabase level
- **MIME type restrictions:** MP4, MOV, M4V, WebM (video) + JPEG, PNG, GIF, WebP (images)

RLS policies implemented:
- **INSERT:** Users can upload to paths starting with their user_id via `storage.foldername()`
- **SELECT:** Users can view files where `owner_id` matches their `auth.uid()`
- **DELETE:** Users can delete files where `owner_id` matches their `auth.uid()`

All policies use `(SELECT auth.uid())` wrapper for query planner optimization.

### 2. Media Types (frontend/src/types/media.ts)

TypeScript type definitions mirroring bucket configuration:
- `MediaType` union: `'video' | 'image'`
- `ALLOWED_VIDEO_TYPES` and `ALLOWED_IMAGE_TYPES` constants
- `ALLOWED_MIME_TYPES` combined array (matches SQL migration exactly)
- `MAX_FILE_SIZE` constant (100MB)
- `UploadProgress` interface for progress tracking
- `MediaFile` interface for database records
- `ValidationResult` interface for validation functions

### 3. Storage Service (frontend/src/lib/storage.ts)

Utility functions for storage operations:
- `validateFile(file: File)` - Validates size and MIME type
- `getMediaType(mimeType: string)` - Determines 'video' or 'image'
- `generateFilePath(userId, fileName)` - Creates unique paths: `{userId}/{timestamp}_{uuid}_{sanitizedFileName}`
- `deleteFile(filePath)` - Removes file from bucket
- `getSignedUrl(filePath, expiresIn?)` - Generates temporary access URLs (default 1 hour)

## Implementation Notes

### Why owner_id for SELECT/DELETE but foldername for INSERT

When a file is uploaded to Supabase Storage, the `owner_id` column is automatically set by Supabase based on the authenticated user. However, during the INSERT operation, we need a different validation mechanism since `owner_id` doesn't exist yet.

The solution:
- **INSERT:** Validate that the file path starts with the user's ID using `storage.foldername(name)[1]`
- **SELECT/DELETE:** Use the reliable `owner_id` column that Supabase populates after upload

### File Path Pattern

`{user_id}/{timestamp}_{uuid}_{sanitizedFileName}`

Example: `abc123/1706320800000_f47ac10b-58cc_my_video.mp4`

This pattern ensures:
- User isolation via folder prefix
- No collisions via timestamp + UUID
- Original filename preserved for user context (sanitized)

## Task Commits

| Task | Description | Commit | Key Files |
|------|-------------|--------|-----------|
| 1 | Storage bucket migration | d100838 | supabase/migrations/001_storage_bucket.sql |
| 2 | Media types | ce8029c | frontend/src/types/media.ts |
| 3 | Storage service | 56988ac | frontend/src/lib/storage.ts |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] Migration file contains bucket creation with 100MB limit and 8 MIME types
- [x] Three RLS policies exist (INSERT, SELECT, DELETE)
- [x] Policies reference correct bucket_id ('drill-media')
- [x] TypeScript types match bucket configuration
- [x] Full project TypeScript compilation passes

## Next Phase Readiness

**Ready for 04-02:** Upload component implementation can now:
- Import `validateFile`, `generateFilePath`, `getMediaType` from storage service
- Use `ALLOWED_MIME_TYPES`, `MAX_FILE_SIZE` from types for UI validation
- Access `drill-media` bucket via Supabase client

**Dependency note:** Migration needs to be applied to Supabase before testing upload functionality.
