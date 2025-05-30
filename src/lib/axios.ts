import axios from 'axios';

// API configuration from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

// Token storage keys from environment variables
const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'access_token';
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// Token management utilities
export const tokenManager = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    delete apiClient.defaults.headers.common['Authorization'];
  },
  hasValidTokens: () => {
    return !!(tokenManager.getAccessToken() && tokenManager.getRefreshToken());
  }
};

// Initialize auth header if token exists
const initializeAuth = () => {
  const token = tokenManager.getAccessToken();
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Initialize on module load
initializeAuth();

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Refresh token request - matches Django endpoint
        const refreshResponse = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        if (refreshResponse.data.access) {
          // Update stored access token
          localStorage.setItem(ACCESS_TOKEN_KEY, refreshResponse.data.access);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.access}`;
          
          // Update refresh token if rotated (Django rotates refresh tokens)
          if (refreshResponse.data.refresh) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshResponse.data.refresh);
          }
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens
        tokenManager.clearTokens();
        // Let React Query handle the error
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Error class for better error handling
export class ApiError extends Error {
  public status?: number;
  public data?: any;
  
  constructor(
    message: string,
    status?: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Helper function to handle API errors consistently - matches Django DRF error format
export const handleApiError = (error: any): never => {
  if (error.response) {
    // Server responded with error status
    const data = error.response.data;
    
    // Handle Django DRF validation errors
    if (data && typeof data === 'object') {
      // Handle field-specific errors
      if (data.email || data.password || data.full_name) {
        const fieldErrors = [];
        if (data.email) fieldErrors.push(`Email: ${Array.isArray(data.email) ? data.email[0] : data.email}`);
        if (data.password) fieldErrors.push(`Password: ${Array.isArray(data.password) ? data.password[0] : data.password}`);
        if (data.full_name) fieldErrors.push(`Full name: ${Array.isArray(data.full_name) ? data.full_name[0] : data.full_name}`);
        
        throw new ApiError(fieldErrors.join(', '), error.response.status, data);
      }
      
      // Handle general detail messages
      if (data.detail) {
        throw new ApiError(data.detail, error.response.status, data);
      }
      
      // Handle non_field_errors
      if (data.non_field_errors) {
        const message = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        throw new ApiError(message, error.response.status, data);
      }
    }
    
    // Fallback error message
    const message = `Server error: ${error.response.status}`;
    throw new ApiError(message, error.response.status, data);
  } else if (error.request) {
    // Network error
    throw new ApiError('Network error. Please check your connection.');
  } else {
    // Other error
    throw new ApiError(error.message || 'An unexpected error occurred');
  }
};

// Export configuration for debugging
export const config = {
  API_BASE_URL,
  API_TIMEOUT,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  NODE_ENV: import.meta.env.VITE_NODE_ENV || import.meta.env.MODE,
}; 