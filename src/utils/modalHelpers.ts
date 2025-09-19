import { VerificationResponse, ExtractedData } from '../types/verification';

// Helper function to get display data from response
export const getDisplayData = (response: VerificationResponse): ExtractedData | undefined => {
  return response.verified_data || response.cbe_extracted_data || response.extracted_data;
};

// Helper function to check if transaction is successful
export const isTransactionSuccess = (response: VerificationResponse, displayData: ExtractedData | undefined): boolean => {
  return response.status === 'success' && 
    !!displayData && 
    !!(displayData.transaction_id || displayData.possible_transaction_id) &&
    !!displayData.sender_name &&
    !!displayData.receiver_name &&
    !!displayData.amount &&
    !!displayData.transaction_date;
};

// Helper function to check if it's a test transaction
export const isTestTransaction = (displayData: ExtractedData | undefined): boolean => {
  return displayData?.sender_name === 'Test User' && 
    displayData?.receiver_name === 'Test Recipient' && 
    displayData?.amount === 100;
};

// Helper function to get error information
export const getErrorInfo = (response: VerificationResponse) => {
  switch (response.error_type) {
    case 'network':
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the verification service. Please check your internet connection and try again.',
        showRetry: true
      };
    case 'timeout':
      return {
        title: 'Request Timeout',
        message: 'The verification request took too long to complete. Please try again.',
        showRetry: true
      };
    case 'invalid_transaction':
      return {
        title: 'Invalid Transaction ID',
        message: 'Sorry your transaction Id is invalid. Please put the correct ID and retry again.',
        showRetry: false
      };
    case 'validation':
      return {
        title: 'Missing Information',
        message: response.message || 'Please fill in all required fields and try again.',
        showRetry: false
      };
    default:
      return {
        title: 'Invalid Transaction ID',
        message: 'Sorry your transaction Id is invalid. Please put the correct ID and retry again.',
        showRetry: false
      };
  }
};

// Helper function to format currency
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper function to format date
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Helper function to format time
export const formatTime = (timeString: string | undefined): string => {
  if (!timeString) return 'N/A';
  try {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-ET', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return timeString;
  }
};
