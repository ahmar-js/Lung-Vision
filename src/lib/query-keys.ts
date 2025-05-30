export const queryKeys = {
  // Authentication related queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    profile: (userId?: string) => [...queryKeys.auth.user(), 'profile', userId] as const,
  },
  
  // Future query keys can be added here
  // Example:
  // patients: {
  //   all: ['patients'] as const,
  //   lists: () => [...queryKeys.patients.all, 'list'] as const,
  //   list: (filters: string) => [...queryKeys.patients.lists(), { filters }] as const,
  //   details: () => [...queryKeys.patients.all, 'detail'] as const,
  //   detail: (id: string) => [...queryKeys.patients.details(), id] as const,
  // },
} as const;

// Helper function to invalidate all auth queries
export const invalidateAuthQueries = (queryClient: any) => {
  return queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
}; 