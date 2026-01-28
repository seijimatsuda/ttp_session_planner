/**
 * Error handling utilities for converting technical errors into user-friendly messages.
 * Used across auth operations, mutations, and async error handling.
 */

/**
 * Converts unknown errors (from async operations, API calls, etc.) into
 * user-friendly error messages with actionable guidance.
 *
 * Handles specific error patterns from:
 * - Supabase authentication errors
 * - Network errors
 * - Generic Supabase errors
 *
 * @param error - Unknown error object from try-catch or async operation
 * @returns User-friendly error message string
 *
 * @example
 * ```typescript
 * try {
 *   await supabase.auth.signInWithPassword({ email, password });
 * } catch (error) {
 *   toast.error(getUserFriendlyError(error));
 * }
 * ```
 */
export function getUserFriendlyError(error: unknown): string {
  // Check if error has a message property
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message);

    // Supabase auth error patterns
    if (message.includes('Invalid login credentials')) {
      return 'Email or password is incorrect.';
    }

    if (message.includes('Email not confirmed')) {
      return 'Please confirm your email before logging in.';
    }

    if (message.includes('User already registered')) {
      return 'An account with this email already exists.';
    }

    if (message.includes('Password should be at least')) {
      return 'Password must be at least 6 characters.';
    }

    // Network error patterns
    if (message.includes('Failed to fetch') || message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }

    // Return the original message if it's already user-friendly
    // (many Supabase errors are already well-formatted)
    return message;
  }

  // Fallback for unknown error types
  return 'Something went wrong. Please try again.';
}
