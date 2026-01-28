import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useCreateSession, useUpdateSession } from '@/hooks/useSessions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  sessionFormSchema,
  sessionFormDefaults,
  type SessionFormData,
} from './SessionForm.schema'
import type { Session, GridData, Json } from '@/lib/database.types'

interface SaveSessionDialogProps {
  isOpen: boolean
  onClose: () => void
  gridData: GridData
  existingSession?: Session | null
  onSuccess?: (sessionId: string) => void
}

/**
 * SaveSessionDialog component for creating new sessions or editing existing ones
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Supports both create (new session) and edit (existing session) modes
 * - Real-time validation on blur
 * - Loading states during save mutation
 * - Success/error feedback via toasts
 * - Form resets when existingSession changes
 */
export function SaveSessionDialog({
  isOpen,
  onClose,
  gridData,
  existingSession,
  onSuccess,
}: SaveSessionDialogProps) {
  const { user } = useAuth()
  const createMutation = useCreateSession()
  const updateMutation = useUpdateSession()
  const isEditMode = !!existingSession

  // Form state
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: existingSession
      ? { name: existingSession.name }
      : sessionFormDefaults,
    mode: 'onBlur',
  })

  // Reset form when dialog opens or existingSession changes
  useEffect(() => {
    if (isOpen) {
      reset(existingSession ? { name: existingSession.name } : sessionFormDefaults)
    }
  }, [isOpen, existingSession, reset])

  // Submit handler
  const onSubmit = async (data: SessionFormData) => {
    if (!user) {
      toast.error(`You must be logged in to ${isEditMode ? 'update' : 'save'} a session`)
      return
    }

    try {
      if (isEditMode) {
        // Edit mode: Update existing session
        const updated = await updateMutation.mutateAsync({
          id: existingSession.id,
          updates: { name: data.name, grid_data: gridData as unknown as Json },
        })
        toast.success('Session updated!')
        onSuccess?.(updated.id)
      } else {
        // Create mode: Create new session
        const created = await createMutation.mutateAsync({
          name: data.name,
          grid_data: gridData as unknown as Json,
          user_id: user.id,
          creator_email: user.email!,
        })
        toast.success('Session saved!')
        onSuccess?.(created.id)
      }
      onClose()
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'save'} session:`, error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'save'} session. Please try again.`)
    }
  }

  const isFormDisabled = isSubmitting || createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop overlay */}
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      {/* Centered container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Dialog panel */}
        <DialogPanel className="max-w-md w-full rounded-lg bg-white p-6 shadow-xl">
          {/* Title */}
          <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
            {isEditMode ? 'Update Session' : 'Save Session'}
          </DialogTitle>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Session name input */}
            <Input
              {...register('name')}
              label="Session Name"
              type="text"
              placeholder="e.g., U12 Technical Training"
              error={errors.name?.message}
              disabled={isFormDisabled}
              autoFocus
            />

            {/* Button row */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isFormDisabled}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting || createMutation.isPending || updateMutation.isPending}
                disabled={isFormDisabled}
              >
                {isEditMode ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
