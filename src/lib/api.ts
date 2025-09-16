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
}

export interface VerificationRequest {
  transaction_id: string;
  sender_account?: string;
  account_number?: string;
}

export interface FileUploadRequest {
  file: File;
  transaction_id?: string;
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
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log(`🌍 Environment: ${process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'}`);
        console.log(`🔗 Base URL: ${API_BASE_URL}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        console.log('📦 Response Data:', response.data);
        return response;
      },
      (error: AxiosError) => {
        console.error('❌ API Error:', error.response?.status, error.message);
        return Promise.reject(this.handleError(error));
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
        sender_account_last_5_digits: request.sender_account?.slice(-5),
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
      const formData = new FormData();
      formData.append('file', request.file);
      if (request.transaction_id) {
        formData.append('transaction_id', request.transaction_id);
      }

      const response = await this.client.post('/image/cbe/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return this.transformResponse(response.data);
    } catch (error) {
      throw error;
    }
  }

  async verifyBoaImage(request: FileUploadRequest): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      if (request.transaction_id) {
        formData.append('transaction_id', request.transaction_id);
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
      formData.append('file', request.file);
      if (request.transaction_id) {
        formData.append('transaction_id', request.transaction_id);
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

