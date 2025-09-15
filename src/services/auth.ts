import { apiClient, tokenManager, handleApiError, config } from '@/lib/axios';
import type { User, LoginResponse, RegistrationResponse, RegisterData, LoginData } from '@/types/auth';
import type { DoctorRegistrationFormData, ResearcherRegistrationFormData } from '@/lib/validations';

// Authentication service functions - matches Django backend API
export const authService = {
  // Register new user - POST /api/register/ (legacy endpoint)
  register: async (data: RegisterData): Promise<{ detail: string }> => {
    try {
      const response = await apiClient.post('/register/', {
        full_name: data.fullName,
        email: data.email,
        password: data.password,
      });
      return response.data;
    } catch (error: any) {
      // Handle specific registration errors
      if (error.response?.status === 400) {
        const data = error.response.data;
        if (data.email && Array.isArray(data.email) && data.email[0].includes('already exists')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
      }
      return handleApiError(error);
    }
  },

  // Register doctor - POST /api/auth/doctor/register/
  registerDoctor: async (data: DoctorRegistrationFormData): Promise<RegistrationResponse> => {
    try {
      const formData = new FormData();
      
      // Basic fields
      formData.append('full_name', data.fullName);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirm_password', data.confirmPassword);
      formData.append('country', data.country);
      formData.append('terms_accepted', 'true');
      
      // Optional phone number
      if (data.phoneNumber) {
        formData.append('phone_number', data.phoneNumber);
      }
      
      // Doctor-specific fields
      formData.append('medical_license_number', data.medicalLicenseNumber);
      formData.append('specialization', data.specialization);
      formData.append('hospital_affiliation', data.hospitalAffiliation);
      
      // File upload
      if (data.medicalLicense) {
        formData.append('medical_license_file', data.medicalLicense);
      }

      const response = await apiClient.post('/auth/doctor/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Store tokens if registration includes automatic login
      if (response.data.tokens?.access && response.data.tokens?.refresh) {
        tokenManager.setTokens(response.data.tokens.access, response.data.tokens.refresh);
      }

      return response.data;
    } catch (error: any) {
      // Handle specific registration errors
      if (error.response?.status === 400) {
        const data = error.response.data;
        if (data.email && Array.isArray(data.email) && data.email[0].includes('already exists')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
      }
      return handleApiError(error);
    }
  },

  // Register researcher - POST /api/auth/researcher/register/
  registerResearcher: async (data: ResearcherRegistrationFormData): Promise<RegistrationResponse> => {
    try {
      const formData = new FormData();
      
      // Basic fields
      formData.append('full_name', data.fullName);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirm_password', data.confirmPassword);
      formData.append('country', data.country);
      formData.append('terms_accepted', 'true');
      
      // Researcher-specific fields
      formData.append('research_institution', data.researchInstitution);
      formData.append('affiliation_type', data.affiliationType);
      formData.append('purpose_of_use', data.purposeOfUse);
      
      // Optional fields
      if (data.orcidId) {
        formData.append('orcid_id', data.orcidId);
      }
      
      // File upload
      if (data.institutionalId) {
        formData.append('institutional_id_file', data.institutionalId);
      }

      const response = await apiClient.post('/auth/researcher/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Store tokens if registration includes automatic login
      if (response.data.tokens?.access && response.data.tokens?.refresh) {
        tokenManager.setTokens(response.data.tokens.access, response.data.tokens.refresh);
      }

      return response.data;
    } catch (error: any) {
      // Handle specific registration errors
      if (error.response?.status === 400) {
        const data = error.response.data;
        if (data.email && Array.isArray(data.email) && data.email[0].includes('already exists')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
      }
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
    } catch (error: any) {
      // Handle specific login errors
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      return handleApiError(error);
    }
  },

  // Refresh token - POST /api/token/refresh/
  refreshToken: async (): Promise<{ access: string; refresh?: string }> => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Session expired. Please log in again.');
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
    } catch (error: any) {
      // If refresh fails, clear tokens
      tokenManager.clearTokens();
      
      // Provide user-friendly message
      if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
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

  // Get current user info - GET /api/user/me/
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/user/me/');
      return response.data;
    } catch (error: any) {
      // Handle specific user fetch errors
      if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
      return handleApiError(error);
    }
  },
}; 