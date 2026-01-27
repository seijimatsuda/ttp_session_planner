// Media file type enum
export type MediaType = 'video' | 'image'

// Allowed MIME types (must match bucket configuration in 001_storage_bucket.sql)
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-m4v',
  'video/webm',
] as const

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

export const ALLOWED_MIME_TYPES = [
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_IMAGE_TYPES,
] as const

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

// File size limit (must match bucket configuration: 100MB)
export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB in bytes

// Upload progress tracking
export interface UploadProgress {
  bytesUploaded: number
  bytesTotal: number
  percentage: number
}

// Media file metadata (stored in database, not in this phase)
export interface MediaFile {
  id: string
  userId: string
  fileName: string
  filePath: string // path in storage bucket
  mimeType: AllowedMimeType
  size: number
  mediaType: MediaType
  createdAt: string
}

// Validation result
export interface ValidationResult {
  valid: boolean
  error?: string
}
