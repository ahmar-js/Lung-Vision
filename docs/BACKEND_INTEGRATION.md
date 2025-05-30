# Backend Integration Guide

This document explains how the frontend is configured to work with your Django backend and what additional endpoints might be needed.

## 🔗 Current Backend Integration

### Existing Django Endpoints

Your Django backend currently provides these authentication endpoints:

```python
# backend/lung_vision/api/urls.py
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('token/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
]
```

### Frontend Configuration

The frontend is configured to match your Django setup:

- **Base URL**: `http://localhost:8000/api`
- **JWT Settings**: 5-minute access tokens, 1-day refresh tokens
- **Token Rotation**: Enabled (Django rotates refresh tokens)
- **User Model**: Custom user with `email` and `full_name` fields

## 📋 API Endpoints Status

| Endpoint | Status | Frontend Usage |
|----------|--------|----------------|
| `POST /api/register/` | ✅ Implemented | User registration |
| `POST /api/login/` | ✅ Implemented | User login |
| `POST /api/token/refresh/` | ✅ Implemented | Token refresh |
| `POST /api/token/verify/` | ✅ Implemented | Token validation |
| `POST /api/token/logout/` | ✅ Implemented | Token blacklisting |
| `GET /api/user/me/` | ❌ Missing | Get current user info |

## 🚧 Recommended Backend Additions

### 1. User Profile Endpoint

Add a user profile endpoint to get current user information:

```python
# backend/lung_vision/api/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user information"""
    user = request.user
    return Response({
        'email': user.email,
        'full_name': user.full_name,
        'date_joined': user.date_joined,
        'is_active': user.is_active,
    })
```

```python
# backend/lung_vision/api/urls.py
urlpatterns = [
    # ... existing patterns
    path('user/me/', get_current_user, name='current_user'),
]
```

### 2. Enhanced Error Handling

Your current error handling is good, but you might want to add more specific error messages:

```python
# backend/lung_vision/api/views.py
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'detail': 'User created successfully.',
                'user': {
                    'email': user.email,
                    'full_name': user.full_name,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

## 🔧 Frontend Adaptations

### Current Workarounds

Since the `/api/user/me/` endpoint doesn't exist yet, the frontend:

1. **Stores user data from login response** in React Query cache
2. **Validates tokens** using `/api/token/verify/` endpoint
3. **Relies on cached user data** for authentication state
4. **Clears cache on logout** to ensure clean state

### Token Management

The frontend handles Django's token rotation automatically:

```typescript
// Automatic token refresh on 401 errors
if (refreshResponse.data.refresh) {
  localStorage.setItem('refresh_token', refreshResponse.data.refresh);
}
```

## 🎯 Error Handling

The frontend is configured to handle Django REST Framework error formats:

```typescript
// Handles field-specific errors
if (data.email || data.password || data.full_name) {
  // Display field-specific validation errors
}

// Handles general errors
if (data.detail) {
  // Display general error messages
}

// Handles non_field_errors
if (data.non_field_errors) {
  // Display form-level errors
}
```

## 🚀 Testing the Integration

### 1. Start Django Backend

```bash
cd backend/lung_vision
python manage.py runserver
```

### 2. Start React Frontend

```bash
cd frontend  # or root directory
npm run dev
```

### 3. Test Authentication Flow

1. **Register**: Create a new account
2. **Login**: Sign in with credentials
3. **Token Refresh**: Wait 5 minutes or manually trigger
4. **Logout**: Clear tokens and cache

## 🔍 Debugging

### Backend Logs

Monitor Django console for:
- Authentication requests
- Token refresh attempts
- Validation errors

### Frontend Debugging

Use React Query DevTools to monitor:
- Query cache state
- Mutation status
- Token validation

### Network Monitoring

Check browser DevTools Network tab for:
- API request/response format
- Token headers
- Error responses

## 📝 Next Steps

1. **Add user profile endpoint** (`/api/user/me/`)
2. **Test token refresh flow** with 5-minute expiry
3. **Add more user-related endpoints** as needed
4. **Implement proper error logging** on backend
5. **Add API rate limiting** if not already configured

This integration provides a solid foundation for authentication while maintaining flexibility for future enhancements. 