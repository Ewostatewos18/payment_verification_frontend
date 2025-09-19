import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Types
export interface ApiResponse {
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: Record<string, unknown>;
  verified_data?: Record<string, unknown>;
  extracted_data?: Record<string, unknown>;
  cbe_extracted_data?: Record<string, unknown>;
  error_type?: 'network' | 'timeout' | 'invalid_transaction' | 'validation' | 'unknown';
}

export interface VerificationRequest {
  transaction_id: string;
  sender_account?: string;
  account_number?: string;
}

export interface FileUploadRequest {
  file: File;
  transaction_id?: string;
  account_number?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

// API Client Class
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '120000'),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        const apiError = this.handleError(error);
        const errorType = this.getErrorType(error);
        return Promise.reject({
          ...apiError,
          error_type: errorType
        });
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as Record<string, unknown>;
      return {
        message: (data?.message as string) || `Server Error: ${error.response.status}`,
        status: error.response.status,
        details: (data?.details as string) || error.message,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network Error: Unable to connect to server',
        details: error.message,
      };
    } else {
      // Other error
      return {
        message: 'Request Error: ' + error.message,
        details: error.message,
      };
    }
  }

  private getErrorType(error: AxiosError): 'network' | 'timeout' | 'invalid_transaction' | 'validation' | 'unknown' {
    if (error.request && !error.response) {
      // Check if it's a timeout error first
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return 'timeout';
      }
      // Network error
      return 'network';
    }
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as Record<string, unknown>;
      const message = (data?.message as string) || '';
      const responseData = data?.data as Record<string, unknown>;
      const responseStatus = responseData?.status as string;
      
      if (status === 408 || message.includes('timeout')) {
        return 'timeout';
      }
      
      if (message.includes('Invalid Transaction ID') || message.includes('Transaction not found')) {
        return 'invalid_transaction';
      }
      
      // Check for Manual Entry Required before categorizing as validation error
      if (responseStatus === 'Manual Entry Required' || responseStatus === 'Manual Verification Required' ||
          message.includes('Unable to extract transaction ID from image') && message.includes('Please enter it manually')) {
        return 'unknown'; // This will be handled specially in the page components
      }
      
      if (status >= 400 && status < 500) {
        return 'validation';
      }
    }
    
    return 'unknown';
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/');
      return {
        status: 'success',
        message: 'Backend is running',
        data: response.data,
      };
    } catch (error) {
      throw error;
    }
  }

  // CBE Payment Verification
  async verifyCbePayment(request: VerificationRequest): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/cbe/verify', {
        transaction_id: request.transaction_id,
        account_number: request.sender_account || request.account_number,
      });
      
      return this.transformResponse(response.data);
    } catch (error) {
      throw error;
    }
  }

  // BOA Payment Verification
  async verifyBoaPayment(request: VerificationRequest): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/boa/verify', {
        transaction_id: request.transaction_id,
        sender_account_last_5_digits: (request.sender_account || request.account_number)?.slice(-5),
      });
      
      return this.transformResponse(response.data);
    } catch (error) {
      throw error;
    }
  }

  // Telebirr Payment Verification
  async verifyTelebirrPayment(request: VerificationRequest): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/telebirr/verify', {
        transaction_id: request.transaction_id,
      });
      
      return this.transformResponse(response.data);
    } catch (error) {
      throw error;
    }
  }

  // Image-based Verification
  async verifyCbeImage(request: FileUploadRequest): Promise<ApiResponse> {
    try {
      console.log('CBE Image API Request:', {
        file: request.file?.name,
        account_number: request.account_number,
        transaction_id: request.transaction_id
      });
      
      const formData = new FormData();
      formData.append('image', request.file);
      if (request.transaction_id) {
        formData.append('transaction_id', request.transaction_id);
      }
      if (request.account_number) {
        formData.append('account_number', request.account_number);
      }

      console.log('Making CBE API call to:', `${this.client.defaults.baseURL}/image/cbe/verify`);
      
      const response = await this.client.post('/image/cbe/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('CBE API Response:', response.data);
      return this.transformResponse(response.data);
    } catch (error) {
      console.log('CBE API Error:', error);
      throw error;
    }
  }

  async verifyBoaImage(request: FileUploadRequest): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('image', request.file);
      if (request.transaction_id) {
        formData.append('transaction_id', request.transaction_id);
      }
      if (request.account_number) {
        formData.append('sender_account', request.account_number);
      }

      const response = await this.client.post('/image/boa/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return this.transformResponse(response.data);
    } catch (error) {
      throw error;
    }
  }

  async verifyTelebirrImage(request: FileUploadRequest): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('image', request.file);
      if (request.transaction_id) {
        formData.append('transaction_id', request.transaction_id);
      }
      if (request.account_number) {
        formData.append('account_number', request.account_number);
      }

      const response = await this.client.post('/image/telebirr/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return this.transformResponse(response.data);
    } catch (error) {
      throw error;
    }
  }

  // Transform backend response to frontend format
  private transformResponse(backendData: Record<string, unknown>): ApiResponse {
    // If the backend already returns the correct format, use it
    if (backendData.status && backendData.message) {
      return backendData as unknown as ApiResponse;
    }

    // Transform Laravel response format to our expected format
    const backendDataObj = backendData.data as Record<string, unknown>;
    const transformed: ApiResponse = {
      status: (backendData.success as boolean) ? 'success' : 'error',
      message: (backendData.message as string) || 'Verification completed',
      data: backendDataObj,
      verified_data: {
        transaction_id: backendDataObj.transaction_id,
        sender_name: backendDataObj.sender_name,
        sender_bank_name: backendDataObj.sender_bank_name,
        receiver_name: backendDataObj.receiver_name,
        receiver_bank_name: backendDataObj.receiver_bank_name,
        transaction_status: backendDataObj.status,
        transaction_date: backendDataObj.date,
        date: backendDataObj.date,
        amount: backendDataObj.amount,
        debug_info: backendDataObj.debug_info,
      },
      extracted_data: backendData.extracted_data as Record<string, unknown>,
      cbe_extracted_data: backendData.cbe_extracted_data as Record<string, unknown>,
    };
    
    return transformed;
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

