import { useState, useRef, useCallback, useEffect } from 'react'
import { useMediaUpload } from '../hooks/useMediaUpload'
import { deleteFile, getSignedUrl } from '../lib/storage'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, type MediaType } from '../types/media'

interface MediaUploadProps {
  onUploadComplete?: (filePath: string, mediaType: MediaType) => void
  onDelete?: () => void
  initialFilePath?: string
  initialMediaType?: MediaType
  className?: string
}

export function MediaUpload({
  onUploadComplete,
  onDelete,
  initialFilePath,
  initialMediaType,
  className = ''
}: MediaUploadProps) {
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(initialFilePath || null)
  const [mediaType, setMediaType] = useState<MediaType | null>(initialMediaType || null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { upload, cancel, progress, isUploading, error, reset } = useMediaUpload({
    onSuccess: async (filePath, type) => {
      setUploadedFilePath(filePath)
      setMediaType(type)
      // Get signed URL for preview
      try {
        const url = await getSignedUrl(filePath)
        setPreviewUrl(url)
      } catch (err) {
        console.error('Failed to get preview URL:', err)
      }
      onUploadComplete?.(filePath, type)
    }
  })

  // Load preview URL for initial file
  useEffect(() => {
    if (initialFilePath) {
      getSignedUrl(initialFilePath)
        .then(setPreviewUrl)
        .catch(console.error)
    }
  }, [initialFilePath])

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset delete error when starting new upload
    setDeleteError(null)

    await upload(file)

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [upload])

  const handleDelete = useCallback(async () => {
    if (!uploadedFilePath) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteFile(uploadedFilePath)
      setUploadedFilePath(null)
      setMediaType(null)
      setPreviewUrl(null)
      reset()
      onDelete?.()
    } catch (err) {
      console.error('Delete failed:', err)
      setDeleteError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }, [uploadedFilePath, reset, onDelete])

  const handleCancel = useCallback(() => {
    cancel()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [cancel])

  // Format file size for display
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const acceptTypes = ALLOWED_MIME_TYPES.join(',')

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      {!uploadedFilePath && !isUploading && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            className="hidden"
            id="media-upload-input"
          />
          <label
            htmlFor="media-upload-input"
            className="cursor-pointer block"
          >
            <div className="text-gray-600 mb-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Video (MP4, MOV, M4V, WebM) or Image (JPG, PNG, GIF, WebP)
            </p>
            <p className="text-xs text-gray-500">
              Max {formatBytes(MAX_FILE_SIZE)}
            </p>
          </label>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Uploading...</span>
            <button
              onClick={handleCancel}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
              type="button"
            >
              Cancel
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatBytes(progress.bytesUploaded)} / {formatBytes(progress.bytesTotal)}</span>
            <span>{progress.percentage}%</span>
          </div>
        </div>
      )}

      {/* Upload Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={reset}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      {/* Delete Error */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      {/* Preview & Delete */}
      {uploadedFilePath && !isUploading && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          {/* Preview */}
          {previewUrl && mediaType === 'image' && (
            <img
              src={previewUrl}
              alt="Uploaded media"
              className="max-h-48 mx-auto rounded"
            />
          )}
          {previewUrl && mediaType === 'video' && (
            <video
              src={previewUrl}
              controls
              playsInline
              className="max-h-48 mx-auto rounded"
            >
              Your browser does not support video playback.
            </video>
          )}

          {/* File info & Delete button */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600 truncate max-w-[200px]">
              {uploadedFilePath.split('/').pop()}
            </span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
              type="button"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
