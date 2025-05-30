import { apiClient, tokenManager, handleApiError, config } from '@/lib/axios';
import type { User, LoginResponse, RegisterData, LoginData } from '@/types/auth';

// Authentication service functions - matches Django backend API
export const authService = {
  // Register new user - POST /api/register/
  register: async (data: RegisterData): Promise<{ detail: string }> => {
    try {
      const response = await apiClient.post('/register/', {
        full_name: data.fullName,
        email: data.email,
        password: data.password,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Login user - POST /api/login/
  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post('/login/', {
        email: data.email,
        password: data.password,
      });
      
      // Store tokens using token manager
      if (response.data.access && response.data.refresh) {
        tokenManager.setTokens(response.data.access, response.data.refresh);
      }
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Refresh token - POST /api/token/refresh/
  refreshToken: async (): Promise<{ access: string; refresh?: string }> => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/token/refresh/', {
        refresh: refreshToken,
      });

      // Update stored access token using environment-configured key
      if (response.data.access) {
        localStorage.setItem(config.ACCESS_TOKEN_KEY, response.data.access);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      }

      // Update refresh token if rotated (Django rotates refresh tokens)
      if (response.data.refresh) {
        localStorage.setItem(config.REFRESH_TOKEN_KEY, response.data.refresh);
      }

      return response.data;
    } catch (error) {
      // If refresh fails, clear tokens
      tokenManager.clearTokens();
      return handleApiError(error);
    }
  },

  // Logout user - POST /api/token/logout/ (blacklist token)
  logout: async (): Promise<void> => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/token/logout/', {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear tokens and authorization header
      tokenManager.clearTokens();
    }
  },

  // Verify token - POST /api/token/verify/
  verifyToken: async (): Promise<boolean> => {
    try {
      const token = tokenManager.getAccessToken();
      if (!token) return false;

      await apiClient.post('/token/verify/', { 
        token: token 
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get current user info - Note: This endpoint doesn't exist in your backend yet
  // You'll need to add this endpoint to your Django backend
  getCurrentUser: async (): Promise<User> => {
    try {
      // This endpoint needs to be created in Django backend
      // For now, we'll extract user info from the login response
      // or create a dedicated endpoint like /api/user/me/
      
      // Temporary solution: decode user info from token or use stored data
      // In a real implementation, you should add this endpoint to Django
      const response = await apiClient.get('/user/me/');
      return response.data;
    } catch (error) {
      // If the endpoint doesn't exist, we can't get user data
      // The user info should be stored during login
      return handleApiError(error);
    }
  },
}; 