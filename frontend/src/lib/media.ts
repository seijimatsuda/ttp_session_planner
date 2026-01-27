/**
 * Media URL utilities for iOS-compatible video streaming
 *
 * URLs are routed through the backend proxy to handle Range requests
 * that iOS Safari requires for video playback and scrubbing.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Generate a proxy URL for media stored in Supabase Storage.
 *
 * @param bucket - Supabase Storage bucket name (e.g., 'drills')
 * @param path - Full path to file including extension (e.g., 'user123/video.mp4')
 * @returns Proxy URL that routes through backend for iOS Range request support
 *
 * @example
 * // For a file at drills/abc123/clip.mp4
 * const url = getProxyMediaUrl('drills', 'abc123/clip.mp4')
 * // Returns: http://localhost:3000/api/media/drills/abc123/clip.mp4
 */
export function getProxyMediaUrl(bucket: string, path: string): string {
  // Ensure path doesn't start with slash (avoid double slashes)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // Safari requires file extension in URL - validate it exists
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(cleanPath)
  if (!hasExtension) {
    console.warn(
      `Media path "${cleanPath}" has no file extension. ` +
      `Safari may fail to play this video. ` +
      `Ensure paths include extensions like .mp4, .mov, .webm`
    )
  }

  return `${API_URL}/api/media/${bucket}/${cleanPath}`
}

/**
 * Check if a URL is a proxy media URL (for debugging/logging).
 */
export function isProxyMediaUrl(url: string): boolean {
  return url.includes('/api/media/')
}
