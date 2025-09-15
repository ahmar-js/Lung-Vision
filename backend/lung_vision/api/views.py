from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import (
    RegisterSerializer, 
    DoctorRegistrationSerializer, 
    ResearcherRegistrationSerializer,
    CustomTokenObtainPairSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'detail': 'User created successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DoctorRegistrationView(generics.CreateAPIView):
    serializer_class = DoctorRegistrationSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # No tokens generated - user must be approved first
            return Response({
                'detail': 'Doctor account created successfully. Your account is pending approval by an administrator.',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role,
                    'account_status': user.account_status,
                    'medical_license_number': user.medical_license_number,
                    'specialization': user.specialization,
                    'hospital_affiliation': user.hospital_affiliation,
                },
                # No tokens field - prevents automatic login
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResearcherRegistrationView(generics.CreateAPIView):
    serializer_class = ResearcherRegistrationSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # No tokens generated - user must be approved first
            return Response({
                'detail': 'Researcher account created successfully. Your account is pending approval by an administrator.',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role,
                    'account_status': user.account_status,
                    'research_institution': user.research_institution,
                    'affiliation_type': user.affiliation_type,
                    'purpose_of_use': user.purpose_of_use,
                    'orcid_id': user.orcid_id,
                },
                # No tokens field - prevents automatic login
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = request.user
        user_data = {
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'role': user.role,
            'country': user.country,
            'phone_number': user.phone_number,
            'date_joined': user.date_joined,
        }
        
        # Add role-specific data
        if user.role == 'doctor':
            user_data.update({
                'medical_license_number': user.medical_license_number,
                'specialization': user.specialization,
                'hospital_affiliation': user.hospital_affiliation,
            })
        elif user.role == 'researcher':
            user_data.update({
                'research_institution': user.research_institution,
                'affiliation_type': user.affiliation_type,
                'purpose_of_use': user.purpose_of_use,
                'orcid_id': user.orcid_id,
            })
        
        return Response(user_data)
