from django.urls import path
from .views import (
    RegisterView, 
    DoctorRegistrationView, 
    ResearcherRegistrationView,
    CustomTokenObtainPairView, 
    UserProfileView,
    FastPredictProxyView,
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
    TokenBlacklistView,
)

urlpatterns = [
    # Legacy registration (keep for backward compatibility)
    path('register/', RegisterView.as_view(), name='register'),
    
    # Role-specific registration endpoints
    path('auth/doctor/register/', DoctorRegistrationView.as_view(), name='doctor_register'),
    path('auth/researcher/register/', ResearcherRegistrationView.as_view(), name='researcher_register'),
    
    # Login endpoint (works for all roles)
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),  # Alternative endpoint
    
    # Token management
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('token/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    
    # User profile
    path('user/me/', UserProfileView.as_view(), name='user_profile'),
    path('predict/', FastPredictProxyView.as_view(), name='fastapi_predict_proxy'),
]
