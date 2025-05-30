# API Architecture with Axios & React Query

This document explains the new API architecture that integrates Axios with TanStack React Query for efficient data fetching and state management.

## 📁 Project Structure

```
src/
├── lib/
│   ├── axios.ts          # Axios instance with interceptors
│   ├── react-query.ts    # React Query configuration
│   ├── query-keys.ts     # Centralized query keys
│   └── validations.ts    # Zod validation schemas
├── services/
│   ├── base.ts           # Base service class
│   ├── auth.ts           # Authentication service
│   └── index.ts          # Services exports
├── hooks/
│   ├── useAuth.ts        # Main auth hook
│   ├── useAuthQueries.ts # React Query auth hooks
│   └── index.ts          # Hooks exports
└── types/
    └── auth.ts           # TypeScript types
```

## 🔧 Core Components

### 1. Axios Instance (`src/lib/axios.ts`)

**Features:**
- Centralized HTTP client configuration
- Automatic token management
- Request/response interceptors
- Automatic token refresh on 401 errors
- Comprehensive error handling

**Key Functions:**
```typescript
// Token management
tokenManager.setTokens(access, refresh)
tokenManager.clearTokens()
tokenManager.hasValidTokens()

// Error handling
handleApiError(error) // Throws standardized ApiError
```

### 2. React Query Configuration (`src/lib/react-query.ts`)

**Optimizations:**
- 5-minute stale time for queries
- 10-minute garbage collection
- Smart retry logic (no retries on 4xx errors)
- Exponential backoff with caps
- Global error logging

### 3. Query Keys (`src/lib/query-keys.ts`)

**Benefits:**
- Centralized key management
- Type-safe query keys
- Easy cache invalidation
- Consistent naming patterns

```typescript
// Usage
queryKeys.auth.user()           // ['auth', 'user']
queryKeys.auth.profile(userId)  // ['auth', 'user', 'profile', userId]
```

### 4. Services Layer (`src/services/`)

**Base Service Pattern:**
```typescript
class PatientService extends BaseService {
  constructor() {
    super('/patients');
  }

  async getPatients() {
    return this.get<Patient[]>('/');
  }

  async createPatient(data: CreatePatientData) {
    return this.post<Patient>(data, '/');
  }
}
```

## 🚀 Usage Examples

### Authentication Hooks

```typescript
import { useAuth, useLoginMutation } from '@/hooks';

function LoginComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const loginMutation = useLoginMutation();

  const handleLogin = async (data) => {
    try {
      await loginMutation.mutateAsync(data);
      // User is automatically updated in cache
    } catch (error) {
      // Error handling
    }
  };

  return (
    // JSX
  );
}
```

### Custom Query Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import { patientService } from '@/services';

export const usePatientsQuery = (filters?: PatientFilters) => {
  return useQuery({
    queryKey: ['patients', 'list', filters],
    queryFn: () => patientService.getPatients(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
```

### Custom Mutation Hook

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services';

export const useCreatePatientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientData) => patientService.createPatient(data),
    onSuccess: () => {
      // Invalidate patients list to refetch
      queryClient.invalidateQueries({ queryKey: ['patients', 'list'] });
    },
  });
};
```

## 🔐 Authentication Flow

1. **Login:** User credentials → `authService.login()` → Tokens stored → User data cached
2. **Auto-refresh:** 401 error → Axios interceptor → Refresh token → Retry request
3. **Logout:** `authService.logout()` → Clear tokens → Clear React Query cache

## 🎯 Benefits

### Performance
- **Caching:** React Query automatically caches responses
- **Background Updates:** Stale-while-revalidate pattern
- **Deduplication:** Multiple identical requests are deduplicated
- **Optimistic Updates:** UI updates before server confirmation

### Developer Experience
- **Type Safety:** Full TypeScript support throughout
- **DevTools:** React Query DevTools for debugging
- **Error Handling:** Centralized error management
- **Code Reuse:** Base service pattern for consistency

### Scalability
- **Modular Services:** Easy to add new API endpoints
- **Query Key Management:** Centralized cache invalidation
- **Interceptor Pattern:** Global request/response handling
- **Service Layer:** Clean separation of concerns

## 🛠️ Adding New Features

### 1. Create a New Service

```typescript
// src/services/patient.ts
import { BaseService } from './base';

export class PatientService extends BaseService {
  constructor() {
    super('/patients');
  }

  async getPatients(filters?: PatientFilters) {
    return this.get<Patient[]>('/', { params: filters });
  }
}

export const patientService = new PatientService();
```

### 2. Add Query Keys

```typescript
// src/lib/query-keys.ts
export const queryKeys = {
  // ... existing keys
  patients: {
    all: ['patients'] as const,
    lists: () => [...queryKeys.patients.all, 'list'] as const,
    list: (filters: PatientFilters) => [...queryKeys.patients.lists(), { filters }] as const,
  },
};
```

### 3. Create Query Hooks

```typescript
// src/hooks/usePatientQueries.ts
export const usePatientsQuery = (filters?: PatientFilters) => {
  return useQuery({
    queryKey: queryKeys.patients.list(filters),
    queryFn: () => patientService.getPatients(filters),
  });
};
```

## 🔍 Debugging

### React Query DevTools
- Available in development mode
- View cache state, query status, and mutations
- Debug stale/fresh data states

### Error Logging
- Global error subscription in React Query config
- Standardized error format with `ApiError` class
- Network error vs. server error distinction

### Token Management
- Debug info available in development mode
- Token validation and refresh logging
- Clear token state visibility

This architecture provides a robust, scalable foundation for API interactions with excellent developer experience and performance optimizations. 