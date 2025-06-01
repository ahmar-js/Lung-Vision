import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { queryKeys } from '@/lib';
import { tokenManager } from '@/lib/axios';
import type { LoginData, RegisterData, User } from '@/types/auth';

// User query hook - now uses the proper /user/me/ endpoint
export const useUserQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async (): Promise<User | null> => {
      try {
        // If no tokens, don't make the request
        if (!tokenManager.hasValidTokens()) {
          return null;
        }
        
        // Fetch user data from the backend
        const user = await authService.getCurrentUser();
        return user;
      } catch (error: any) {
        // If any error occurs, user is not authenticated
        console.error('User query error:', error);
        
        // Clear tokens if authentication failed
        if (error?.response?.status === 401) {
          tokenManager.clearTokens();
        }
        
        return null;
      }
    },
    enabled: enabled && tokenManager.hasValidTokens(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry auth queries
  });
};

// Login mutation hook
export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (response) => {
      // Set user data in cache from login response
      if (response.user) {
        queryClient.setQueryData(queryKeys.auth.user(), response.user);
      }
      
      // Invalidate and refetch user query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
    onError: (error: any) => {
      // Clear any cached user data on login failure
      queryClient.setQueryData(queryKeys.auth.user(), null);
      
      // Log error for debugging but don't expose internal errors
      console.error('Login mutation error:', error);
    },
  });
};

// Register mutation hook
export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: () => {
      // Don't set user data since registration doesn't log in
      // Just invalidate queries in case there was cached data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error: any) => {
      // Log error for debugging
      console.error('Registration mutation error:', error);
    },
  });
};

// Logout mutation hook
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
    onError: (error: any) => {
      // Even if logout API fails, clear local cache
      queryClient.clear();
      
      // Log error for debugging
      console.error('Logout mutation error:', error);
    },
  });
};

// Token refresh mutation (for internal use)
export const useRefreshTokenMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: () => {
      // Invalidate user query to refetch with new token
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
    onError: (error: any) => {
      // If refresh fails, clear all data
      queryClient.clear();
      
      // Log error for debugging
      console.error('Token refresh mutation error:', error);
    },
  });
}; 