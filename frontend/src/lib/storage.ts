import { supabase } from './supabase'
import {
  type MediaType,
  type ValidationResult,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from '../types/media'

// Bucket name constant
const BUCKET_NAME = 'drill-media'

/**
 * Validate a file against allowed MIME types and size limits
 */
export function validateFile(file: File): ValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024)
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Determine media type from MIME type
 */
export function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('video/')) {
    return 'video'
  }
  return 'image'
}

/**
 * Generate a unique file path for storage
 * Format: {userId}/{timestamp}_{uuid}_{sanitizedFileName}
 */
export function generateFilePath(userId: string, fileName: string): string {
  // Sanitize filename: keep alphanumeric, dots, hyphens, underscores
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const timestamp = Date.now()
  const uuid = crypto.randomUUID()
  return `${userId}/${timestamp}_${uuid}_${sanitizedFileName}`
}

/**
 * Delete a file from storage
 * @throws Error if deletion fails
 */
export async function deleteFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Get a signed URL for a file
 * @param filePath - Path to the file in storage
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL string
 * @throws Error if URL generation fails
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn)

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }

  return data.signedUrl
}
