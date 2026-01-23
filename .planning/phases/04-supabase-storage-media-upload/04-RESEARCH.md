# Phase 4: Supabase Storage & Media Upload - Research

**Researched:** 2026-01-22
**Domain:** Supabase Storage with React upload UI
**Confidence:** HIGH

## Summary

Supabase Storage is an S3-compatible object storage service that integrates with PostgreSQL Row Level Security for fine-grained access control. For this phase, we'll use standard uploads for files under 6MB and resumable uploads (TUS protocol) for larger files up to 100MB, with built-in progress tracking.

The standard approach is to create a private storage bucket with RLS policies that allow authenticated users to upload, view, and delete their own media files. File validation happens at both the client side (before upload for UX) and server side (bucket configuration for security). Progress tracking is built into the resumable upload API using the TUS protocol.

Supabase provides first-class JavaScript/TypeScript support through `@supabase/supabase-js`, with upload methods that return standard promise-based responses. The CDN automatically distributes files globally, though cache invalidation requires careful handling when files are replaced or deleted.

**Primary recommendation:** Use resumable uploads for all files to enable progress tracking, configure bucket-level file size limits and MIME type restrictions, implement owner-based RLS policies for security, and avoid file overwrites to prevent CDN cache issues.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | Latest (2.x) | Supabase client SDK | Official SDK with TypeScript support, handles auth + storage |
| tus-js-client | Latest | Resumable upload protocol | TUS protocol implementation for progress tracking |
| React | 18.x+ | UI framework | Project standard, hooks for upload state |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-drag-drop-files | Latest | Drag-and-drop UI | Optional, for enhanced upload UX |
| @supabase/ui | Latest | Pre-built dropzone component | Optional, rapid prototyping |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TUS resumable | Standard multipart upload | Standard is simpler but lacks progress events, only for files <6MB |
| Custom upload component | @supabase/ui Dropzone | Pre-built component faster but less customizable |
| Client validation only | Server-only validation | Must validate both sides: client for UX, server for security |

**Installation:**
```bash
npm install @supabase/supabase-js tus-js-client
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── MediaUpload.tsx        # Upload UI with progress
│   ├── MediaList.tsx           # Display uploaded media
│   └── MediaPreview.tsx        # Image/video preview
├── lib/
│   ├── supabase.ts             # Supabase client config
│   └── storage.ts              # Storage helper functions
├── hooks/
│   └── useMediaUpload.ts       # Upload state management
└── types/
    └── media.ts                # Media file types
```

### Pattern 1: Upload with Progress Tracking (Resumable Upload)
**What:** Use TUS protocol for all uploads to get progress events, even for files under 6MB
**When to use:** Any upload where user needs feedback, especially video files
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/storage/uploads/resumable-uploads
import { Upload } from 'tus-js-client'

async function uploadWithProgress(file: File, onProgress: (percent: number) => void) {
  const projectId = 'your-project-id'
  const accessToken = session.access_token

  const upload = new Upload(file, {
    endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-upsert': 'false', // Prevent overwrites
    },
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    metadata: {
      bucketName: 'media',
      objectName: `${userId}/${file.name}`,
      contentType: file.type,
      cacheControl: '3600',
    },
    chunkSize: 6 * 1024 * 1024, // 6MB chunks (fixed)
    onProgress: (bytesUploaded, bytesTotal) => {
      const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
      onProgress(Number(percentage))
    },
    onError: (error) => {
      console.error('Upload failed:', error)
    },
    onSuccess: () => {
      console.log('Upload complete!')
    },
  })

  // Start upload
  const previousUploads = await upload.findPreviousUploads()
  if (previousUploads.length > 0) {
    upload.resumeFromPreviousUpload(previousUploads[0])
  }

  upload.start()
}
```

### Pattern 2: Simple Upload for Small Files (Standard Upload)
**What:** Direct upload method for files under 6MB without progress tracking
**When to use:** Profile pictures, small images where instant feedback is acceptable
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/storage/uploads/standard-uploads
async function uploadFile(file: File, path: string) {
  const { data, error } = await supabase
    .storage
    .from('media')
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false, // Prevent overwrites
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  return data
}
```

### Pattern 3: Owner-Based RLS Policies
**What:** Policies that restrict users to only their own files using owner_id
**When to use:** Multi-user applications where users manage their own media
**Example:**
```sql
-- Source: https://supabase.com/docs/guides/storage/security/ownership

-- Allow authenticated users to upload to their own folder
create policy "Users can upload their own media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
create policy "Users can view their own media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'media'
  and owner_id = auth.uid()::text
);

-- Allow users to delete their own files
create policy "Users can delete their own media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'media'
  and owner_id = auth.uid()::text
);
```

### Pattern 4: File Validation (Client + Server)
**What:** Validate file type and size on both client and server
**When to use:** Always - client for UX, server for security
**Example:**
```typescript
// Client-side validation (UX)
function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 100 * 1024 * 1024 // 100MB
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm']
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const ALLOWED_TYPES = [...ALLOWED_VIDEO_TYPES, ...ALLOWED_IMAGE_TYPES]

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File must be under 100MB' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' }
  }

  return { valid: true }
}
```

```sql
-- Server-side validation (Security) - via bucket configuration
-- Note: This is set during bucket creation, not via SQL
-- Using Dashboard: Storage > Bucket Settings
-- Or via API when creating bucket with:
-- file_size_limit: '100mb'
-- allowed_mime_types: ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm',
--                      'image/jpeg', 'image/png', 'image/gif', 'image/webp']
```

### Pattern 5: React Hook for Upload State
**What:** Custom hook to manage upload state, progress, and errors
**When to use:** Component-level upload management
**Example:**
```typescript
// Source: Adapted from https://supabase.com/blog/react-native-storage
import { useState, useCallback } from 'react'

interface UseMediaUploadResult {
  upload: (file: File) => Promise<void>
  progress: number
  loading: boolean
  error: string | null
  url: string | null
  reset: () => void
}

function useMediaUpload(): UseMediaUploadResult {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)

  const upload = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      // Validate file
      const validation = validateFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Generate unique path
      const userId = (await supabase.auth.getUser()).data.user?.id
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${userId}/${fileName}`

      // Upload with progress
      await uploadWithProgress(file, (percent) => {
        setProgress(percent)
      })

      // Get URL after upload
      const { data } = await supabase
        .storage
        .from('media')
        .getPublicUrl(filePath) // or createSignedUrl for private

      setUrl(data.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setProgress(0)
    setError(null)
    setUrl(null)
  }, [])

  return { upload, progress, loading, error, url, reset }
}
```

### Pattern 6: Deleting Files
**What:** Remove files from storage with proper RLS checks
**When to use:** User deletes their uploaded media
**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/storage-from-remove
async function deleteFile(filePath: string) {
  const { data, error } = await supabase
    .storage
    .from('media')
    .remove([filePath]) // Array of paths

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }

  return data
}

// For multiple files
async function deleteFiles(filePaths: string[]) {
  const { data, error } = await supabase
    .storage
    .from('media')
    .remove(filePaths)

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }

  return data
}
```

### Pattern 7: Getting File URLs (Private Files)
**What:** Generate signed URLs with expiration for private buckets
**When to use:** Serving user-uploaded media that should be access-controlled
**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/storage-from-createsignedurl
async function getSignedUrl(filePath: string, expiresIn: number = 3600) {
  const { data, error } = await supabase
    .storage
    .from('media')
    .createSignedUrl(filePath, expiresIn) // expires in seconds

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}
```

### Anti-Patterns to Avoid
- **File overwrites with same name:** Causes CDN cache issues; use unique filenames with timestamps or UUIDs instead
- **Missing client-side validation:** Always validate before upload for better UX
- **Global content-type header:** Setting `'Content-Type': 'application/json'` globally breaks file uploads
- **Using service key in client:** Service keys bypass RLS entirely; only use in trusted server environments
- **No progress feedback:** Users abandon uploads without progress indication
- **Bucket-level delete operations:** Delete individual files, not entire buckets in production

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Resumable uploads | Custom chunk upload system | TUS protocol via tus-js-client | TUS handles resume after network failures, upload URL management, concurrent upload conflicts |
| Progress tracking | Manual XMLHttpRequest progress events | TUS onProgress callback | Built into resumable upload protocol, works across disconnections |
| File validation | Custom MIME type checking | Bucket-level allowed_mime_types + client validation | Server-side enforcement prevents bypass, bucket config is declarative |
| CDN caching | Custom cache busting logic | Unique filenames (timestamp/UUID) + avoid overwrites | Supabase CDN has 60s propagation delay, cache busting via query params is unreliable |
| Access control | Custom authentication middleware | Supabase RLS policies on storage.objects | Policies integrate with auth, enforce at database level, prevent privilege escalation |
| Signed URLs | Custom token generation | createSignedUrl() method | Handles expiration, signatures, security properly |

**Key insight:** Supabase Storage integrates deeply with PostgreSQL RLS and the auth system. Custom solutions lose these security integrations and create maintenance burden. The TUS protocol for resumable uploads is battle-tested across millions of uploads and handles edge cases (network failures, concurrent uploads, resume after 24h) that custom implementations miss.

## Common Pitfalls

### Pitfall 1: CDN Cache Issues with File Overwrites
**What goes wrong:** When you upload a file with the same name (using `upsert: true`), the old version is cached by the CDN for up to 60 seconds. Users see stale content even after successful uploads.
**Why it happens:** The CDN needs time to propagate cache invalidation across 285+ edge nodes globally. Browser caches compound the problem.
**How to avoid:**
- Never use `upsert: true` for user-facing content
- Use unique filenames: `${Date.now()}-${originalName}` or UUID-based names
- If replacing files is required, upload to new path and update database reference atomically
- For frequently updated assets, set lower `cacheControl` values (e.g., '60' for 1 minute)
**Warning signs:** Users report seeing old images/videos after upload, downloads return old content

### Pitfall 2: Missing RLS Policies Block All Operations
**What goes wrong:** Storage buckets have no default RLS policies. Without policies, all upload/download operations fail with 403 Access Denied, even for authenticated users.
**Why it happens:** Supabase defaults to secure-by-default. Storage requires explicit RLS policies on the `storage.objects` table.
**How to avoid:**
- Always create RLS policies immediately after bucket creation
- Minimum policies: INSERT for uploads, SELECT for downloads, DELETE for deletions
- Test with an authenticated user in different browser/incognito to verify policies work
- Use helper functions like `storage.foldername()` to restrict folder access
**Warning signs:** All storage operations return 403 errors, Dashboard upload works but client uploads fail (Dashboard uses service key)

### Pitfall 3: File Size Limit Confusion (Global vs Bucket)
**What goes wrong:** Uploads fail with `EntityTooLarge` (413) errors even though bucket limit seems sufficient.
**Why it happens:** There are TWO limits: global limit (applies to all buckets) and per-bucket limit. Bucket limit cannot exceed global limit. Free tier global limit is capped at 50MB.
**How to avoid:**
- Check global limit first: Project Settings > Storage Settings
- Set global limit to maximum needed across all buckets (e.g., 100MB for video uploads)
- Set per-bucket limits for specific use cases (e.g., 5MB for avatars bucket, 100MB for media bucket)
- Validate file size client-side before upload to provide better error messages
**Warning signs:** 413 errors despite bucket limit being higher than file size, free tier projects failing on >50MB files

### Pitfall 4: Service Key Exposure in Client Code
**What goes wrong:** Using the service role key in browser/client code bypasses all RLS policies, allowing any user to access/delete any file.
**Why it happens:** Developers copy server-side code to client, or expose service key in environment variables accessible to frontend.
**How to avoid:**
- Only use anon/public key in client code
- Service key only in server-side code (API routes, backend services)
- Check environment variable names: `SUPABASE_ANON_KEY` for client, `SUPABASE_SERVICE_ROLE_KEY` for server only
- Use separate environment files for client vs server
**Warning signs:** RLS policies seem to have no effect, unauthorized users can access files, security audit flags exposed keys

### Pitfall 5: MIME Type Validation Only Checks Filename Extension
**What goes wrong:** Users can upload malicious files by renaming them with allowed extensions (e.g., `malware.exe` → `malware.jpg`).
**Why it happens:** Supabase's `allowed_mime_types` validation checks the filename extension and declared content-type, not actual file contents.
**How to avoid:**
- Treat bucket-level MIME type restrictions as a convenience check, not security
- Implement server-side content inspection for sensitive applications
- Use image processing libraries to validate actual file format (e.g., sharp, jimp)
- For user-generated content, consider additional malware scanning
- Educate users: validation prevents accidents, not determined attackers
**Warning signs:** Security scans find executable files in storage, file processing fails on "images" that aren't actually images

### Pitfall 6: Upload URL Expiration (24 Hour Limit)
**What goes wrong:** Resumable upload fails mid-upload or on resume attempt with errors about invalid/expired URLs.
**Why it happens:** TUS upload URLs are valid for 24 hours. For very large files or slow connections, upload might not complete within this window.
**How to avoid:**
- TUS client libraries automatically generate new URLs on expiration
- Ensure `tus-js-client` is configured with `uploadDataDuringCreation: true`
- Don't manually cache upload URLs - let TUS library manage them
- For gigantic files, chunk size (6MB) affects total upload time - plan accordingly
**Warning signs:** Uploads fail after many hours, errors mention expired URLs, resume attempts fail

### Pitfall 7: Concurrent Upload Conflicts (409 Errors)
**What goes wrong:** When multiple users/tabs upload to the same path simultaneously, one gets 409 Conflict error.
**Why it happens:** Only one client can write to a specific upload URL at a time to prevent data corruption.
**How to avoid:**
- Use unique filenames per upload (timestamp + random ID)
- Path structure: `${userId}/${Date.now()}-${randomId}-${fileName}`
- Don't upload to generic paths like `temp/upload.jpg`
- If conflicts occur, catch 409 errors and retry with new filename
**Warning signs:** Intermittent 409 errors, uploads fail when multiple users active, race conditions in tests

### Pitfall 8: Owner ID Not Set for Service Key Uploads
**What goes wrong:** Files uploaded via Dashboard or service key have `owner_id = null`, breaking RLS policies that check `owner_id = auth.uid()`.
**Why it happens:** Service key bypasses authentication, so there's no JWT `sub` claim to extract user ID from.
**How to avoid:**
- Only use client SDK with user authentication for files that need ownership
- If using service key for admin uploads, create separate policies that don't check `owner_id`
- Consider manual owner_id assignment in application code after service key upload
- Use separate buckets for user-uploaded (RLS protected) vs admin-uploaded (service key) content
**Warning signs:** Dashboard-uploaded files aren't visible to users, owner-based policies don't work for some files

## Code Examples

Verified patterns from official sources:

### Complete Upload Component with Progress
```typescript
// Source: Adapted from https://supabase.com/docs/guides/storage/uploads/resumable-uploads
import { useState } from 'react'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import { Upload } from 'tus-js-client'

export function MediaUploadComponent() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID
    const userId = session?.user.id
    const filePath = `${userId}/${Date.now()}-${file.name}`

    const upload = new Upload(file, {
      endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session?.access_token}`,
        'x-upsert': 'false',
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: 'media',
        objectName: filePath,
        contentType: file.type,
        cacheControl: '3600',
      },
      chunkSize: 6 * 1024 * 1024,
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100)
        setProgress(percentage)
      },
      onError: (error) => {
        console.error('Upload failed:', error)
        setError(error.message)
        setUploading(false)
      },
      onSuccess: () => {
        console.log('Upload complete!')
        setUploading(false)
        setProgress(100)
      },
    })

    const previousUploads = await upload.findPreviousUploads()
    if (previousUploads.length > 0) {
      upload.resumeFromPreviousUpload(previousUploads[0])
    }

    upload.start()
  }

  return (
    <div>
      <input
        type="file"
        accept="video/mp4,video/quicktime,video/x-m4v,video/webm,image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {uploading && (
        <div>
          <progress value={progress} max={100} />
          <p>{progress.toFixed(1)}%</p>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 100 * 1024 * 1024 // 100MB
  const ALLOWED_TYPES = [
    'video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp'
  ]

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File must be under 100MB' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` }
  }

  return { valid: true }
}
```

### Creating Storage Bucket with Configuration
```typescript
// Source: https://supabase.com/docs/reference/javascript/storage-createbucket
// Note: Typically done once during setup, not in application code

async function setupMediaBucket() {
  const { data, error } = await supabase
    .storage
    .createBucket('media', {
      public: false, // Private bucket requires authentication
      fileSizeLimit: '100mb', // Maximum file size
      allowedMimeTypes: [
        'video/mp4',
        'video/quicktime',
        'video/x-m4v',
        'video/webm',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ]
    })

  if (error) {
    console.error('Bucket creation failed:', error)
    return
  }

  console.log('Bucket created:', data)
}
```

### Complete RLS Policy Setup
```sql
-- Source: https://supabase.com/docs/guides/storage/security/access-control

-- Policy 1: Allow authenticated users to upload to their own folder
create policy "Users can upload their own media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Policy 2: Allow users to view their own files
create policy "Users can view their own media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'media'
  and owner_id = (select auth.uid()::text)
);

-- Policy 3: Allow users to delete their own files
create policy "Users can delete their own media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'media'
  and owner_id = (select auth.uid()::text)
);

-- Policy 4: Restrict file types using extension helper
create policy "Only allow approved file types"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'media'
  and (
    storage.extension(name) in ('mp4', 'mov', 'm4v', 'webm', 'jpg', 'jpeg', 'png', 'gif', 'webp')
  )
);
```

### List and Delete User's Files
```typescript
// Source: https://supabase.com/docs/reference/javascript/storage-from-list
// List files in user's folder
async function listUserFiles(userId: string) {
  const { data, error } = await supabase
    .storage
    .from('media')
    .list(userId, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data
}

// Delete file with error handling
async function deleteUserFile(filePath: string) {
  const { data, error } = await supabase
    .storage
    .from('media')
    .remove([filePath])

  if (error) {
    // Common errors:
    // - 403: RLS policy denied deletion (not owner)
    // - 404: File doesn't exist
    throw new Error(`Delete failed: ${error.message}`)
  }

  return data
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Standard uploads only | Resumable uploads (TUS) for files >6MB | 2023 | Progress tracking, resume after failures, better reliability |
| `owner` field | `owner_id` field | 2024 | Consistent with auth.uid() type, clearer naming |
| Client-only validation | Bucket-level validation + client | 2024 | Server-side enforcement prevents security bypass |
| Query param cache busting | Unique filenames | Ongoing | Reliable cache invalidation, no CDN propagation issues |
| Public URLs for all | Signed URLs for private buckets | 2023 | Better security, time-limited access, RLS integration |

**Deprecated/outdated:**
- **`owner` field**: Use `owner_id` instead for RLS policies
- **Cache busting via query params**: Unreliable due to 60s CDN propagation delay, use unique filenames
- **Standard uploads for large files**: Use resumable uploads for better reliability and progress tracking

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal chunk size for different network conditions**
   - What we know: TUS uses fixed 6MB chunks, cannot be customized currently
   - What's unclear: Whether Supabase plans to make chunk size configurable
   - Recommendation: Accept 6MB as standard, plan upload time estimates accordingly

2. **Bucket creation in application code vs manual setup**
   - What we know: Can create buckets via API, Dashboard, or SQL
   - What's unclear: Best practice for production - create programmatically or manually during deployment
   - Recommendation: Manual creation via Dashboard for production (one-time setup), programmatic for development/testing environments

3. **Image transformation/optimization capabilities**
   - What we know: Supabase Storage supports image transformations via URL parameters
   - What's unclear: Full transformation API not covered in core storage docs
   - Recommendation: Research image transformation docs separately if needed for thumbnails/responsive images

## Sources

### Primary (HIGH confidence)
- Supabase Storage Docs - https://supabase.com/docs/guides/storage
- Storage Quickstart - https://supabase.com/docs/guides/storage/quickstart
- Resumable Uploads - https://supabase.com/docs/guides/storage/uploads/resumable-uploads
- Standard Uploads - https://supabase.com/docs/guides/storage/uploads/standard-uploads
- File Limits - https://supabase.com/docs/guides/storage/uploads/file-limits
- Access Control - https://supabase.com/docs/guides/storage/security/access-control
- Ownership - https://supabase.com/docs/guides/storage/security/ownership
- Helper Functions - https://supabase.com/docs/guides/storage/schema/helper-functions
- Error Codes - https://supabase.com/docs/guides/storage/debugging/error-codes
- CDN Fundamentals - https://supabase.com/docs/guides/storage/cdn/fundamentals
- JavaScript API Reference (upload) - https://supabase.com/docs/reference/javascript/storage-from-upload
- JavaScript API Reference (remove) - https://supabase.com/docs/reference/javascript/storage-from-remove
- JavaScript API Reference (signed URLs) - https://supabase.com/docs/reference/javascript/storage-from-createsignedurl

### Secondary (MEDIUM confidence)
- React Native Storage Blog (React patterns) - https://supabase.com/blog/react-native-storage
- Supabase UI Dropzone - https://supabase.com/ui/docs/nextjs/dropzone
- GitHub Discussions (CDN cache issues) - https://github.com/orgs/supabase/discussions/5737
- Storage Troubleshooting - https://supabase.com/docs/guides/storage/troubleshooting

### Tertiary (LOW confidence)
- Community tutorials on DEV.to and Medium - various patterns, should verify against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official SDK, well-documented TUS integration
- Architecture: HIGH - Official docs provide complete patterns, battle-tested in production
- Pitfalls: HIGH - Documented in official troubleshooting, GitHub issues, error codes reference

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable API, but check for new features)
