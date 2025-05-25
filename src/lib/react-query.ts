import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes freshness
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false; // no retry on 404
        return failureCount < 2; // retry max twice
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff up to 30s
      // onSuccess and onSettled can be added here 
    },
  }
});

queryClient.getQueryCache().subscribe(event => {
  if (event.type === 'updated' && event.query.state.status === 'error') {
    console.error('Global query error:', event.query.queryKey, event.query.state.error);
  }
});
