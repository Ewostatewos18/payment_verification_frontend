import { ApiError } from './api';

export interface ErrorState {
  message: string;
  type: 'network' | 'server' | 'validation' | 'timeout' | 'unknown';
  details?: string;
  retryable: boolean;
}

export class ErrorHandler {
  static handle(error: unknown): ErrorState {
    console.error('ErrorHandler caught:', error);

    // Handle API errors
    if (error && typeof error === 'object' && 'message' in error) {
      const apiError = error as ApiError;
      
      // Network errors
      if (apiError.message.includes('Network Error') || apiError.message.includes('Unable to connect')) {
        return {
          message: 'Unable to connect to the server. Please check your internet connection.',
          type: 'network',
          details: apiError.details,
          retryable: true,
        };
      }

      // Timeout errors
      if (apiError.message.includes('timeout')) {
        return {
          message: 'Request timed out. Please try again.',
          type: 'timeout',
          details: apiError.details,
          retryable: true,
        };
      }

      // Server errors
      if (apiError.status && apiError.status >= 500) {
        return {
          message: 'Server error occurred. Please try again later.',
          type: 'server',
          details: apiError.details,
          retryable: true,
        };
      }

      // Client errors (400-499)
      if (apiError.status && apiError.status >= 400) {
        return {
          message: apiError.message || 'Invalid request. Please check your input.',
          type: 'validation',
          details: apiError.details,
          retryable: false,
        };
      }

      // Generic API error
      return {
        message: apiError.message || 'An error occurred while processing your request.',
        type: 'unknown',
        details: apiError.details,
        retryable: true,
      };
    }

    // Handle generic errors
    if (error instanceof Error) {
      return {
        message: error.message || 'An unexpected error occurred.',
        type: 'unknown',
        retryable: true,
      };
    }

    // Fallback error
    return {
      message: 'An unexpected error occurred. Please try again.',
      type: 'unknown',
      retryable: true,
    };
  }

  static isRetryable(error: ErrorState): boolean {
    return error.retryable;
  }

  static getErrorMessage(error: ErrorState): string {
    return error.message;
  }

  static getErrorDetails(error: ErrorState): string | undefined {
    return error.details;
  }
}
