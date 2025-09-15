from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('email', 'full_name', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class DoctorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    terms_accepted = serializers.BooleanField(required=True)
    
    class Meta:
        model = User
        fields = (
            'email', 'full_name', 'password', 'confirm_password',
            'phone_number', 'country', 'medical_license_number',
            'specialization', 'hospital_affiliation', 'medical_license_file',
            'terms_accepted'
        )
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        
        if not attrs.get('terms_accepted'):
            raise serializers.ValidationError("Terms and conditions must be accepted")
        
        return attrs
    
    def create(self, validated_data):
        # Remove confirm_password and terms_accepted from validated_data
        validated_data.pop('confirm_password', None)
        terms_accepted = validated_data.pop('terms_accepted', False)
        
        # Set role and terms acceptance
        validated_data['role'] = 'doctor'
        validated_data['terms_accepted'] = terms_accepted
        validated_data['terms_accepted_date'] = timezone.now()
        
        user = User.objects.create_user(**validated_data)
        return user

class ResearcherRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    terms_accepted = serializers.BooleanField(required=True)
    
    class Meta:
        model = User
        fields = (
            'email', 'full_name', 'password', 'confirm_password', 'country',
            'research_institution', 'affiliation_type', 'purpose_of_use',
            'orcid_id', 'institutional_id_file', 'terms_accepted'
        )
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        
        if not attrs.get('terms_accepted'):
            raise serializers.ValidationError("Terms and conditions must be accepted")
        
        return attrs
    
    def create(self, validated_data):
        # Remove confirm_password and terms_accepted from validated_data
        validated_data.pop('confirm_password', None)
        terms_accepted = validated_data.pop('terms_accepted', False)
        
        # Set role and terms acceptance
        validated_data['role'] = 'researcher'
        validated_data['terms_accepted'] = terms_accepted
        validated_data['terms_accepted_date'] = timezone.now()
        
        user = User.objects.create_user(**validated_data)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Check if account is approved
        if not self.user.can_login():
            if self.user.is_pending():
                raise serializers.ValidationError(
                    "Your account is pending approval. Please wait for an administrator to approve your account before logging in."
                )
            elif self.user.is_rejected():
                rejection_reason = self.user.rejection_reason or "No specific reason provided"
                raise serializers.ValidationError(
                    f"Your account has been rejected. Reason: {rejection_reason}. Please contact support for assistance."
                )
            else:
                raise serializers.ValidationError(
                    "Your account is not approved for login. Please contact support."
                )
        
        data['user'] = {
            'email': self.user.email,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'country': getattr(self.user, 'country', None),
            'phone_number': getattr(self.user, 'phone_number', None),
            'account_status': self.user.account_status,
        }
        
        # Add role-specific data
        if self.user.role == 'doctor':
            data['user'].update({
                'medical_license_number': self.user.medical_license_number,
                'specialization': self.user.specialization,
                'hospital_affiliation': self.user.hospital_affiliation,
            })
        elif self.user.role == 'researcher':
            data['user'].update({
                'research_institution': self.user.research_institution,
                'affiliation_type': self.user.affiliation_type,
                'purpose_of_use': self.user.purpose_of_use,
                'orcid_id': self.user.orcid_id,
            })
        
        return data
