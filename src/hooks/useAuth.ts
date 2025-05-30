import { useState, useCallback } from 'react';
import { 
  useUserQuery, 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation 
} from './useAuthQueries';
import type { LoginData, RegisterData, MessageState } from '@/types/auth';

export const useAuth = () => {
  const [message, setMessage] = useState<MessageState | null>(null);

  // React Query hooks
  const { data: user, isLoading: isUserLoading, error: userError } = useUserQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  // Derived state
  const isAuthenticated = !!user;
  const isLoading = isUserLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending;

  // Login function with React Query
  const login = useCallback(async (data: LoginData) => {
    setMessage(null);
    
    try {
      await loginMutation.mutateAsync(data);
      setMessage({ type: "success", text: "Login successful! Welcome back." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
      setMessage({ type: "error", text: errorMessage });
      throw error;
    }
  }, [loginMutation]);

  // Register function with React Query
  const register = useCallback(async (data: RegisterData) => {
    setMessage(null);
    
    try {
      await registerMutation.mutateAsync(data);
      setMessage({ type: "success", text: "Registration successful! Please log in." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      setMessage({ type: "error", text: errorMessage });
      throw error;
    }
  }, [registerMutation]);

  // Logout function with React Query
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      setMessage(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear message even if logout fails
      setMessage(null);
    }
  }, [logoutMutation]);

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