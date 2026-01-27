import { Router, Request, Response } from 'express'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import { supabaseAdmin } from '../config/supabase.js'

export const mediaRouter = Router()

const CHUNK_SIZE = 10 ** 6 // 1MB chunks for streaming

/**
 * Parse Range header safely, handling all formats:
 * - Standard: bytes=0-1000
 * - Open-ended: bytes=1000-
 * - Suffix: bytes=-500 (last 500 bytes)
 */
function parseRange(
  rangeHeader: string | undefined,
  fileSize: number
): { start: number; end: number } | null {
  if (!rangeHeader) {
    return null
  }

  const parts = rangeHeader.replace(/bytes=/, '').split('-')
  const startStr = parts[0]
  const endStr = parts[1]

  // Handle suffix-byte-range-spec (e.g., bytes=-500 means last 500 bytes)
  if (startStr === '') {
    const suffixLength = parseInt(endStr, 10)
    if (isNaN(suffixLength)) {
      return null
    }
    return {
      start: Math.max(0, fileSize - suffixLength),
      end: fileSize - 1
    }
  }

  const start = parseInt(startStr, 10)
  if (isNaN(start)) {
    return null
  }

  // Handle open-ended range (e.g., bytes=1000-)
  const end = endStr ? parseInt(endStr, 10) : fileSize - 1

  return {
    start,
    end: Math.min(end, fileSize - 1)
  }
}

/**
 * Validate range boundaries
 */
function isValidRange(
  start: number,
  end: number,
  fileSize: number
): boolean {
  return start >= 0 && start < fileSize && end < fileSize && start <= end
}

/**
 * Media proxy route handler
 * GET /:bucket/*path - Streams media files from Supabase Storage with Range request support
 * Express 5 requires named wildcard parameters (path-to-regexp v8 syntax)
 */
mediaRouter.get('/:bucket/*path', async (req: Request, res: Response) => {
  try {
    // Extract and normalize params - Express types can be string | string[]
    const bucketParam = req.params.bucket
    const pathParam = req.params.path
    const bucket = Array.isArray(bucketParam) ? bucketParam[0] : bucketParam
    const path = Array.isArray(pathParam) ? pathParam[0] : pathParam

    if (!bucket || !path) {
      res.status(400).json({ error: 'Missing bucket or path' })
      return
    }

    // Generate signed URL from Supabase Storage (1 hour expiry for long videos)
    const { data: signedData, error: signedUrlError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, 3600)

    if (signedUrlError || !signedData?.signedUrl) {
      console.error('Signed URL error:', signedUrlError)
      res.status(404).json({ error: 'File not found' })
      return
    }

    // Fetch file metadata via HEAD request
    const headResponse = await fetch(signedData.signedUrl, { method: 'HEAD' })

    if (!headResponse.ok) {
      res.status(404).json({ error: 'File not found' })
      return
    }

    const contentLengthHeader = headResponse.headers.get('content-length')
    const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0
    const contentType = headResponse.headers.get('content-type') || 'application/octet-stream'

    if (!fileSize) {
      res.status(500).json({ error: 'Unable to determine file size' })
      return
    }

    const rangeHeader = req.headers.range
    const range = parseRange(rangeHeader, fileSize)

    // Non-Range request: return entire file with Accept-Ranges header
    if (!range) {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      })

      const response = await fetch(signedData.signedUrl)
      if (!response.ok || !response.body) {
        res.status(500).json({ error: 'Failed to fetch file' })
        return
      }

      // Convert web ReadableStream to Node.js Readable for pipeline
      const nodeStream = Readable.fromWeb(response.body as import('stream/web').ReadableStream)
      await pipeline(nodeStream, res)
      return
    }

    // Validate range
    if (!isValidRange(range.start, range.end, fileSize)) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`
      })
      res.end()
      return
    }

    // Limit chunk size to 1MB for efficient streaming
    const end = Math.min(range.start + CHUNK_SIZE - 1, range.end)
    const contentLength = end - range.start + 1

    // Set 206 Partial Content headers
    const headers = {
      'Content-Range': `bytes ${range.start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType
    }

    res.writeHead(206, headers)

    // Fetch with Range header from Supabase
    const response = await fetch(signedData.signedUrl, {
      headers: {
        Range: `bytes=${range.start}-${end}`
      }
    })

    if (!response.ok || !response.body) {
      // Headers already sent, log error
      console.error('Failed to fetch range from Supabase')
      res.end()
      return
    }

    // Stream the response using pipeline for proper error handling
    const nodeStream = Readable.fromWeb(response.body as import('stream/web').ReadableStream)
    await pipeline(nodeStream, res)
  } catch (error) {
    console.error('Media proxy error:', error)
    // Only send error response if headers not yet sent
    if (!res.headersSent) {
      res.status(500).json({ error: 'Media streaming error' })
    }
  }
})
