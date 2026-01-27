import { Toaster as SonnerToaster } from "sonner";

/**
 * Toast notification container component.
 * Renders at the app root to display toast notifications from anywhere in the app.
 *
 * Usage:
 *   import { toast } from "sonner";
 *   toast.success("Saved successfully");
 *   toast.error("Something went wrong");
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        className: "text-sm",
      }}
    />
  );
}
