// frontend/src/components/ui/Dialog.tsx
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Called when dialog should close (ESC key, backdrop click, or Cancel button) */
  onClose: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message content */
  message: string;
  /** Called when confirm button is clicked */
  onConfirm: () => void;
  /** Text for confirm button (default: "Delete") */
  confirmText?: string;
  /** Style variant for confirm button (default: "danger") */
  confirmVariant?: "danger" | "primary";
  /** Whether the confirm action is in progress (disables buttons) */
  loading?: boolean;
}

/**
 * Accessible confirmation dialog for destructive actions.
 * Handles focus management, ESC key, click-outside, and ARIA attributes automatically via Headless UI.
 *
 * @example
 * <ConfirmDialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Delete Session?"
 *   message="This action cannot be undone."
 *   onConfirm={handleDelete}
 *   loading={isDeleting}
 * />
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "Delete",
  confirmVariant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop overlay */}
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      {/* Centered container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Dialog panel */}
        <DialogPanel className="max-w-sm w-full rounded-lg bg-white p-6 shadow-xl">
          {/* Title */}
          <DialogTitle className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </DialogTitle>

          {/* Message */}
          <p className="text-sm text-gray-600 mb-6">{message}</p>

          {/* Button row */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
