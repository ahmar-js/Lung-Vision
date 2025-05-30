import { QueryClient } from '@tanstack/react-query';

// Environment-based configuration
const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development' || import.meta.env.DEV;
const enableDevTools = import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === 'true' || isDevelopment;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes freshness (shorter than token lifetime)
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) return false;
        // Don't retry on 404s
        if (error?.status === 404) return false;
        // Don't retry on validation errors
        if (error?.status === 400) return false;
        // Retry other errors max twice
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff up to 30s
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) return false;
        // Retry server errors (5xx) once
        return failureCount < 1;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // shorter delays for mutations
    },
  }
});

// Global error handling - only in development
if (isDevelopment) {
  queryClient.getQueryCache().subscribe(event => {
    if (event.type === 'updated' && event.query.state.status === 'error') {
      console.error('Query error:', {
        queryKey: event.query.queryKey,
        error: event.query.state.error,
      });
    }
  });

  queryClient.getMutationCache().subscribe(event => {
    if (event.type === 'updated' && event.mutation.state.status === 'error') {
      console.error('Mutation error:', {
        mutationKey: event.mutation.options.mutationKey,
        error: event.mutation.state.error,
      });
    }
  });
}

// Export configuration for debugging
export const queryConfig = {
  isDevelopment,
  enableDevTools,
  NODE_ENV: import.meta.env.VITE_NODE_ENV || import.meta.env.MODE,
};
