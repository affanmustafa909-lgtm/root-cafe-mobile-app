import axios from 'axios';

export function friendlyError(error: unknown, fallback?: string): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) return error.message;
    return fallback ?? 'Something went wrong. Please try again.';
  }

  if (!error.response) {
    return 'Please check your internet connection.';
  }

  const status = error.response.status;
  const message = error.response.data?.message;

  if (status === 401) return 'Please sign in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 409) return typeof message === 'string' ? message : 'This conflicts with existing data.';
  if (status === 429) return 'Too many attempts. Please wait a moment.';
  if (status >= 500) return 'Our servers are temporarily unavailable. Please try again.';

  if (typeof message === 'string') {
    const lower = message.toLowerCase();
    if (lower.includes('unavailable') || lower.includes('sold'))
      return 'This item is currently unavailable.';
    if (lower.includes('pickup'))
      return message;
    if (lower.includes('customization') || lower.includes('required'))
      return message;
    return message;
  }

  if (Array.isArray(message)) return message.join(', ');

  return fallback ?? 'Something went wrong. Please try again.';
}
