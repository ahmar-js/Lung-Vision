import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useUserQuery, 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation 
} from './useAuthQueries';
import type { LoginData, RegisterData, MessageState } from '@/types/auth';

export const useAuth = () => {
  const [message, setMessage] = useState<MessageState | null>(null);
  const navigate = useNavigate();

  // React Query hooks
  const { data: user, isLoading: isUserLoading, error: userError } = useUserQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  // Derived state
  const isAuthenticated = !!user;
  const isLoading = isUserLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending;

  // Login function with React Query and navigation
  const login = useCallback(async (data: LoginData) => {
    setMessage(null);
    
    try {
      await loginMutation.mutateAsync(data);
      setMessage({ type: "success", text: "Login successful! Welcome back." });
      // Navigate to dashboard after successful login
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";
      
      // Extract user-friendly error message
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.status === 401) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error?.response?.status === 429) {
        errorMessage = "Too many login attempts. Please wait a moment and try again.";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      setMessage({ type: "error", text: errorMessage });
      throw error;
    }
  }, [loginMutation, navigate]);

  // Register function with React Query
  const register = useCallback(async (data: RegisterData) => {
    setMessage(null);
    
    try {
      await registerMutation.mutateAsync(data);
      setMessage({ type: "success", text: "Registration successful! Please log in with your new account." });
      // Stay on the same page but user can switch to login tab
    } catch (error: any) {
      let errorMessage = "Registration failed. Please try again.";
      
      // Extract user-friendly error message
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.status === 400) {
        const data = error?.response?.data;
        if (data?.email && Array.isArray(data.email)) {
          errorMessage = data.email[0];
        } else if (data?.password && Array.isArray(data.password)) {
          errorMessage = data.password[0];
        } else if (data?.full_name && Array.isArray(data.full_name)) {
          errorMessage = data.full_name[0];
        }
      } else if (error?.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      setMessage({ type: "error", text: errorMessage });
      throw error;
    }
  }, [registerMutation]);

  // Logout function with React Query and navigation
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      setMessage(null);
      // Navigate to login page after successful logout
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear message and navigate even if logout fails
      setMessage(null);
      navigate('/login', { replace: true });
    }
  }, [logoutMutation, navigate]);

  // Clear message function
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    // User state
    user,
    isAuthenticated,
    isLoading,
    
    // Message state
    message,
    clearMessage,
    
    // Actions
    login,
    register,
    logout,
    
    // Mutation states for more granular control
    loginState: {
      isLoading: loginMutation.isPending,
      error: loginMutation.error,
      isSuccess: loginMutation.isSuccess,
    },
    registerState: {
      isLoading: registerMutation.isPending,
      error: registerMutation.error,
      isSuccess: registerMutation.isSuccess,
    },
    logoutState: {
      isLoading: logoutMutation.isPending,
      error: logoutMutation.error,
      isSuccess: logoutMutation.isSuccess,
    },
  };
}; 