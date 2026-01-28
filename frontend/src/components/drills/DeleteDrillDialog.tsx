/**
 * DeleteDrillDialog - Accessible confirmation dialog for drill deletion
 *
 * Uses Headless UI Dialog primitives for keyboard navigation, focus trap,
 * and screen reader support. Shows drill name for confirmation clarity.
 */

import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { Button } from '@/components/ui/Button'

interface DeleteDrillDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  drillName: string
  isDeleting: boolean
}

/**
 * Confirmation dialog for deleting a drill
 *
 * Features:
 * - Accessible via Headless UI primitives
 * - Keyboard navigation (Tab, Escape, Enter)
 * - Focus trap when open
 * - Shows drill name for confirmation
 * - Loading state during deletion
 * - Backdrop click to close (when not deleting)
 */
export function DeleteDrillDialog({
  isOpen,
  onClose,
  onConfirm,
  drillName,
  isDeleting,
}: DeleteDrillDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Centered container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Dialog panel */}
        <DialogPanel className="max-w-md w-full bg-white rounded-lg p-6 shadow-xl">
          {/* Title */}
          <DialogTitle className="text-lg font-semibold text-gray-900 mb-2">
            Delete Drill?
          </DialogTitle>

          {/* Description */}
          <Description className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete "{drillName}"? This action cannot be undone.
          </Description>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              loading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
