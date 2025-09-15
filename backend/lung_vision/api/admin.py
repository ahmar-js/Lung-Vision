from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils import timezone
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'email', 'full_name', 'role', 'account_status_display', 
        'date_joined', 'approved_by_display', 'approved_date', 'country'
    ]
    list_filter = [
        'role', 'account_status', 'country', 'specialization', 
        'affiliation_type', 'date_joined', 'approved_date'
    ]
    search_fields = ['email', 'full_name', 'medical_license_number', 'research_institution']
    readonly_fields = ['date_joined', 'terms_accepted_date', 'last_login', 'approved_by', 'approved_date']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('email', 'full_name', 'role', 'phone_number', 'country')
        }),
        ('Account Status', {
            'fields': ('account_status', 'rejection_reason'),
            'classes': ('wide',),
            'description': 'Change account status here. Approval details will be automatically recorded below.'
        }),
        ('Approval History (Auto-Generated)', {
            'fields': ('approved_by', 'approved_date'),
            'classes': ('collapse',),
            'description': 'These fields are automatically filled when account status is changed.'
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Doctor Information', {
            'fields': ('medical_license_number', 'specialization', 'hospital_affiliation', 'medical_license_file'),
            'classes': ('collapse',)
        }),
        ('Researcher Information', {
            'fields': ('research_institution', 'affiliation_type', 'purpose_of_use', 'orcid_id', 'institutional_id_file'),
            'classes': ('collapse',)
        }),
        ('Terms & Important Dates', {
            'fields': ('terms_accepted', 'terms_accepted_date', 'date_joined', 'last_login'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'role', 'password1', 'password2'),
        }),
    )
    
    ordering = ['-date_joined']
    
    def account_status_display(self, obj):
        """Display account status with color coding"""
        colors = {
            'pending': '#ff9800',  # Orange
            'approved': '#4caf50',  # Green
            'rejected': '#f44336',  # Red
        }
        color = colors.get(obj.account_status, '#9e9e9e')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_account_status_display()
        )
    account_status_display.short_description = 'Status'
    account_status_display.admin_order_field = 'account_status'
    
    def approved_by_display(self, obj):
        """Display who approved/rejected the account"""
        if obj.approved_by:
            return f"{obj.approved_by.full_name} ({obj.approved_by.email})"
        return "-"
    approved_by_display.short_description = 'Approved/Rejected By'
    approved_by_display.admin_order_field = 'approved_by'
    
    def get_queryset(self, request):
        """Optimize queries"""
        return super().get_queryset(request).select_related('approved_by')
    
    def save_model(self, request, obj, form, change):
        """Auto-populate approval fields when status is changed"""
        if change:  # Only for existing objects
            # Get the original object from database to compare
            try:
                original = User.objects.get(pk=obj.pk)
                
                # Check if account_status has changed
                if original.account_status != obj.account_status:
                    if obj.account_status == 'approved':
                        obj.approve(approved_by_user=request.user)
                        return  # approve() method already saves the object
                    elif obj.account_status == 'rejected':
                        obj.reject(reason=obj.rejection_reason, rejected_by_user=request.user)
                        return  # reject() method already saves the object
                    elif obj.account_status == 'pending':
                        # Reset approval fields when marking as pending
                        obj.approved_by = None
                        obj.approved_date = None
                        obj.rejection_reason = None
            except User.DoesNotExist:
                pass
        
        # Call the original save method
        super().save_model(request, obj, form, change)
    
    actions = ['approve_users', 'reject_users', 'mark_pending', 'send_test_email']
    
    def approve_users(self, request, queryset):
        """Bulk approve users with email notifications"""
        approved_count = 0
        email_success_count = 0
        email_failures = []
        
        for user in queryset.filter(account_status__in=['pending', 'rejected']):
            try:
                user.approve(approved_by_user=request.user, send_email=True)
                approved_count += 1
                email_success_count += 1
            except Exception as e:
                # Still approve the user but track email failure
                user.approve(approved_by_user=request.user, send_email=False)
                approved_count += 1
                email_failures.append(f"{user.email} ({user.full_name})")
        
        # Create comprehensive message
        message = f'{approved_count} user(s) have been approved.'
        if email_success_count > 0:
            message += f' {email_success_count} approval email(s) sent successfully.'
        if email_failures:
            message += f' Failed to send email to: {", ".join(email_failures[:3])}'
            if len(email_failures) > 3:
                message += f' and {len(email_failures) - 3} others.'
        
        self.message_user(request, message)
    approve_users.short_description = "Approve selected users and send email notifications"
    
    def reject_users(self, request, queryset):
        """Bulk reject users with email notifications"""
        rejected_count = 0
        email_success_count = 0
        email_failures = []
        rejection_reason = "Bulk rejection by administrator"
        
        for user in queryset.filter(account_status__in=['pending', 'approved']):
            try:
                user.reject(reason=rejection_reason, rejected_by_user=request.user, send_email=True)
                rejected_count += 1
                email_success_count += 1
            except Exception as e:
                # Still reject the user but track email failure
                user.reject(reason=rejection_reason, rejected_by_user=request.user, send_email=False)
                rejected_count += 1
                email_failures.append(f"{user.email} ({user.full_name})")
        
        # Create comprehensive message
        message = f'{rejected_count} user(s) have been rejected.'
        if email_success_count > 0:
            message += f' {email_success_count} rejection email(s) sent successfully.'
        if email_failures:
            message += f' Failed to send email to: {", ".join(email_failures[:3])}'
            if len(email_failures) > 3:
                message += f' and {len(email_failures) - 3} others.'
        
        self.message_user(request, message)
    reject_users.short_description = "Reject selected users and send email notifications"
    
    def mark_pending(self, request, queryset):
        """Mark users as pending (useful for re-review)"""
        count = queryset.exclude(account_status='pending').update(
            account_status='pending',
            approved_by=None,
            approved_date=None,
            rejection_reason=None
        )
        
        self.message_user(
            request,
            f'{count} user(s) marked as pending approval. Previous approval/rejection details have been cleared.'
        )
    mark_pending.short_description = "Mark as pending approval"
    
    def send_test_email(self, request, queryset):
        """Send test approval email to selected users (for testing purposes)"""
        from .email_service import EmailService
        
        success_count = 0
        failure_count = 0
        
        for user in queryset:
            try:
                EmailService.send_account_approved_email(user, request.user)
                success_count += 1
            except Exception as e:
                failure_count += 1
        
        if success_count > 0:
            self.message_user(
                request,
                f'Test emails sent successfully to {success_count} user(s).'
            )
        if failure_count > 0:
            self.message_user(
                request,
                f'Failed to send test emails to {failure_count} user(s).',
                level='warning'
            )
    send_test_email.short_description = "Send test approval email (for testing)"

# Custom admin site configuration
admin.site.site_header = "LungVision Administration"
admin.site.site_title = "LungVision Admin"
admin.site.index_title = "Welcome to LungVision Administration"