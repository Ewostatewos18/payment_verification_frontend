import { ApiError } from './api';

export interface ErrorState {
  message: string;
  type: 'network' | 'timeout' | 'invalid_transaction' | 'validation' | 'unknown';
  details?: string;
  retryable: boolean;
}

export class ErrorHandler {
  static handle(error: unknown): ErrorState {

    // Handle API errors
    if (error && typeof error === 'object' && 'message' in error) {
      const apiError = error as ApiError;
      
      // Network connectivity errors (cURL errors, connection refused, etc.)
      if (apiError.message.includes('Network Error') || 
          apiError.message.includes('Unable to connect') ||
          apiError.message.includes('cURL error') ||
          apiError.message.includes('Failed to connect') ||
          apiError.message.includes('Connection refused') ||
          apiError.message.includes('Connection timed out')) {
        return {
          message: 'Unable to connect to the verification service. This may be due to network restrictions or geographic blocking.',
          type: 'network',
          details: apiError.details,
          retryable: true,
        };
      }

      // Service unavailable errors (external API down, maintenance, etc.)
      if (apiError.message.includes('Service Unavailable') ||
          apiError.message.includes('temporarily unavailable') ||
          apiError.message.includes('maintenance') ||
          apiError.message.includes('unavailable')) {
        return {
          message: 'The verification service is temporarily unavailable. Please try again later.',
          type: 'timeout',
          details: apiError.details,
          retryable: true,
        };
      }

      // Invalid transaction ID errors
      if (apiError.message.includes('Invalid Transaction ID') ||
          apiError.message.includes('Transaction not found') ||
          apiError.message.includes('Invalid transaction') ||
          apiError.message.includes('Transaction ID not found')) {
        return {
          message: 'Invalid Transaction ID. Please check your transaction ID and try again.',
          type: 'invalid_transaction',
          details: apiError.details,
          retryable: false,
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
          type: 'unknown',
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
