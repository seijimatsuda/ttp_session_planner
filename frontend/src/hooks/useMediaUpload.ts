import { useState, useCallback, useRef } from 'react'
import { Upload } from 'tus-js-client'
import { supabase } from '../lib/supabase'
import { validateFile, generateFilePath, getMediaType } from '../lib/storage'
import type { UploadProgress, MediaType } from '../types/media'

interface UseMediaUploadOptions {
  onSuccess?: (filePath: string, mediaType: MediaType) => void
  onError?: (error: string) => void
}

interface UseMediaUploadResult {
  upload: (file: File) => Promise<string | null>
  cancel: () => void
  progress: UploadProgress
  isUploading: boolean
  error: string | null
  reset: () => void
}

export function useMediaUpload(options: UseMediaUploadOptions = {}): UseMediaUploadResult {
  const [progress, setProgress] = useState<UploadProgress>({
    bytesUploaded: 0,
    bytesTotal: 0,
    percentage: 0
  })
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const uploadRef = useRef<Upload | null>(null)

  const reset = useCallback(() => {
    setProgress({ bytesUploaded: 0, bytesTotal: 0, percentage: 0 })
    setError(null)
    setIsUploading(false)
    uploadRef.current = null
  }, [])

  const cancel = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort()
      reset()
    }
  }, [reset])

  const upload = useCallback(async (file: File): Promise<string | null> => {
    // Reset state
    setError(null)
    setProgress({ bytesUploaded: 0, bytesTotal: file.size, percentage: 0 })

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      options.onError?.(validation.error || 'Invalid file')
      return null
    }

    // Get auth session for access token
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      const errorMsg = 'You must be logged in to upload files'
      setError(errorMsg)
      options.onError?.(errorMsg)
      return null
    }

    const userId = session.user.id
    const filePath = generateFilePath(userId, file.name)
    const mediaType = getMediaType(file.type)

    // Get Supabase project URL for TUS endpoint
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl) {
      const errorMsg = 'Supabase URL not configured'
      setError(errorMsg)
      options.onError?.(errorMsg)
      return null
    }

    // Extract project ID from URL (e.g., https://abc123.supabase.co -> abc123)
    const projectId = new URL(supabaseUrl).hostname.split('.')[0]

    setIsUploading(true)

    return new Promise((resolve) => {
      const tusUpload = new Upload(file, {
        endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          'x-upsert': 'false' // Prevent overwrites, avoid CDN cache issues
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: 'drill-media',
          objectName: filePath,
          contentType: file.type,
          cacheControl: '3600'
        },
        chunkSize: 6 * 1024 * 1024, // 6MB chunks (Supabase standard)
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = bytesTotal > 0
            ? Math.round((bytesUploaded / bytesTotal) * 100)
            : 0
          setProgress({ bytesUploaded, bytesTotal, percentage })
        },
        onError: (err) => {
          console.error('Upload failed:', err)
          const errorMsg = err.message || 'Upload failed'
          setError(errorMsg)
          setIsUploading(false)
          options.onError?.(errorMsg)
          resolve(null)
        },
        onSuccess: () => {
          setProgress(prev => ({ ...prev, percentage: 100 }))
          setIsUploading(false)
          options.onSuccess?.(filePath, mediaType)
          resolve(filePath)
        }
      })

      uploadRef.current = tusUpload

      // Check for previous uploads to resume
      tusUpload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length > 0) {
          tusUpload.resumeFromPreviousUpload(previousUploads[0])
        }
        tusUpload.start()
      })
    })
  }, [options])

  return {
    upload,
    cancel,
    progress,
    isUploading,
    error,
    reset
  }
}
