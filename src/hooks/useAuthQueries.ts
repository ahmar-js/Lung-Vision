import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { queryKeys, invalidateAuthQueries } from '@/lib/query-keys';
import { tokenManager } from '@/lib/axios';
import type { LoginData, RegisterData, User } from '@/types/auth';

// User query hook - modified to work without dedicated user endpoint
export const useUserQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async (): Promise<User | null> => {
      try {
        // First verify if we have a valid token
        const isValid = await authService.verifyToken();
        if (!isValid) {
          return null;
        }
        
        // Since there's no /user/me/ endpoint yet, we'll rely on cached data
        // User data will be set during login and persist until logout
        // If we reach here with valid tokens but no cached data, 
        // it means the user needs to login again
        return null;
      } catch (error) {
        // If any error occurs, user is not authenticated
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
      
      // Invalidate and refetch any auth-related queries
      invalidateAuthQueries(queryClient);
    },
    onError: (error) => {
      // Clear any cached user data on login failure
      queryClient.setQueryData(queryKeys.auth.user(), null);
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
      invalidateAuthQueries(queryClient);
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
    onError: () => {
      // Even if logout API fails, clear local cache
      queryClient.clear();
    },
  });
};

// Token refresh mutation (for internal use)
export const useRefreshTokenMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: () => {
      // Don't invalidate user query since we don't have a user endpoint
      // The user data should remain in cache
    },
    onError: () => {
      // If refresh fails, clear all data
      queryClient.clear();
    },
  });
}; 