/**
 * Error handling utilities
 */

export type ApiErrorData = {
  message?: string | string[];
};

export type FetchErrorLike = {
  data?: ApiErrorData;
  message?: string;
};

/**
 * Extracts a user-friendly error message from an error object
 * @param error - The error object (can be any type)
 * @param fallback - Default message if no error message can be extracted
 * @returns A user-friendly error message string
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as FetchErrorLike;
    
    // Check if error.data.message exists
    if (err.data?.message) {
      // Handle array of messages
      if (Array.isArray(err.data.message)) {
        return err.data.message.join(', ');
      }
      // Handle string message
      if (typeof err.data.message === 'string') {
        return err.data.message;
      }
    }
    
    // Fallback to error.message
    if (err.message && typeof err.message === 'string') {
      return err.message;
    }
  }
  
  return fallback;
}
