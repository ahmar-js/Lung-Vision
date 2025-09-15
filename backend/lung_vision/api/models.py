from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('account_status', 'approved')  # Admins are auto-approved
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('doctor', 'Doctor'),
        ('researcher', 'Researcher'),
        ('admin', 'Admin'),
    ]
    
    SPECIALIZATION_CHOICES = [
        ('pulmonologist', 'Pulmonologist'),
        ('radiologist', 'Radiologist'),
        ('internist', 'Internal Medicine'),
        ('emergency', 'Emergency Medicine'),
        ('family', 'Family Medicine'),
        ('thoracic_surgeon', 'Thoracic Surgeon'),
        ('respiratory_therapist', 'Respiratory Therapist'),
        ('other', 'Other'),
    ]
    
    AFFILIATION_TYPE_CHOICES = [
        ('student', 'Student (Undergraduate/Graduate)'),
        ('phd_student', 'PhD Student'),
        ('postdoc', 'Postdoctoral Researcher'),
        ('faculty', 'Faculty Member'),
        ('research_scientist', 'Research Scientist'),
        ('principal_investigator', 'Principal Investigator'),
        ('industry_researcher', 'Industry Researcher'),
        ('other', 'Other'),
    ]
    
    PURPOSE_CHOICES = [
        ('academic_research', 'Academic Research'),
        ('model_testing', 'Model Testing & Validation'),
        ('algorithm_development', 'Algorithm Development'),
        ('clinical_trial', 'Clinical Trial Research'),
        ('thesis_project', 'Thesis/Dissertation Project'),
        ('collaborative_study', 'Collaborative Study'),
        ('educational_purpose', 'Educational Purpose'),
        ('other', 'Other'),
    ]
    
    ACCOUNT_STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    # Basic fields
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='doctor')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, default='United States')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    # Account approval fields
    account_status = models.CharField(max_length=20, choices=ACCOUNT_STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_users')
    approved_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True, help_text="Reason for rejection (optional)")
    
    # Doctor-specific fields
    medical_license_number = models.CharField(max_length=100, blank=True, null=True)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES, blank=True, null=True)
    hospital_affiliation = models.CharField(max_length=255, blank=True, null=True)
    medical_license_file = models.FileField(upload_to='medical_licenses/', blank=True, null=True)
    
    # Researcher-specific fields
    research_institution = models.CharField(max_length=255, blank=True, null=True)
    affiliation_type = models.CharField(max_length=50, choices=AFFILIATION_TYPE_CHOICES, blank=True, null=True)
    purpose_of_use = models.CharField(max_length=50, choices=PURPOSE_CHOICES, blank=True, null=True)
    orcid_id = models.CharField(max_length=100, blank=True, null=True)
    institutional_id_file = models.FileField(upload_to='institutional_ids/', blank=True, null=True)
    
    # Terms and conditions
    terms_accepted = models.BooleanField(default=False)
    terms_accepted_date = models.DateTimeField(blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'role']

    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.get_role_display()}"
    
    def is_approved(self):
        """Check if the account is approved"""
        return self.account_status == 'approved'
    
    def is_pending(self):
        """Check if the account is pending approval"""
        return self.account_status == 'pending'
    
    def is_rejected(self):
        """Check if the account is rejected"""
        return self.account_status == 'rejected'
    
    def approve(self, approved_by_user=None, send_email=True):
        """Approve the account and optionally send email notification"""
        self.account_status = 'approved'
        self.approved_by = approved_by_user
        self.approved_date = timezone.now()
        self.rejection_reason = None  # Clear any previous rejection reason
        self.save()
        
        # Send approval email notification
        if send_email:
            try:
                from .email_service import send_approval_email
                send_approval_email(self, approved_by_user)
            except Exception as e:
                # Log error but don't fail the approval process
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send approval email for user {self.email}: {str(e)}")
    
    def reject(self, reason=None, rejected_by_user=None, send_email=True):
        """Reject the account and optionally send email notification"""
        self.account_status = 'rejected'
        self.rejection_reason = reason
        self.approved_by = rejected_by_user  # Track who rejected it
        self.approved_date = timezone.now()  # Track when it was rejected
        self.save()
        
        # Send rejection email notification
        if send_email:
            try:
                from .email_service import send_rejection_email
                send_rejection_email(self, reason, rejected_by_user)
            except Exception as e:
                # Log error but don't fail the rejection process
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send rejection email for user {self.email}: {str(e)}")
    
    def can_login(self):
        """Check if user can login (approved and active)"""
        return self.is_active and self.is_approved()
    
    def clean(self):
        from django.core.exceptions import ValidationError
        super().clean()
        
        # Validate role-specific required fields
        if self.role == 'doctor':
            if not self.medical_license_number:
                raise ValidationError({'medical_license_number': 'Medical license number is required for doctors.'})
            if not self.specialization:
                raise ValidationError({'specialization': 'Specialization is required for doctors.'})
            if not self.hospital_affiliation:
                raise ValidationError({'hospital_affiliation': 'Hospital affiliation is required for doctors.'})
        
        elif self.role == 'researcher':
            if not self.research_institution:
                raise ValidationError({'research_institution': 'Research institution is required for researchers.'})
            if not self.affiliation_type:
                raise ValidationError({'affiliation_type': 'Affiliation type is required for researchers.'})
            if not self.purpose_of_use:
                raise ValidationError({'purpose_of_use': 'Purpose of use is required for researchers.'})

