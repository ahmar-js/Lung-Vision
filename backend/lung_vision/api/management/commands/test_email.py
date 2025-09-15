"""
Django management command to test email functionality
"""

from django.core.management.base import BaseCommand
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from api.models import User


class Command(BaseCommand):
    help = 'Test email template rendering and sending'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-email',
            type=str,
            help='Email of user to test with (must exist in database)',
        )
        parser.add_argument(
            '--test-template',
            action='store_true',
            help='Only test template rendering, do not send email',
        )

    def handle(self, *args, **options):
        self.stdout.write("🧪 Testing Email System...")
        
        # Test 1: Template directory check
        self.stdout.write("\n1. Checking template configuration...")
        self.stdout.write(f"   TEMPLATES DIRS: {settings.TEMPLATES[0]['DIRS']}")
        
        # Test 2: Find a user to test with
        user_email = options.get('user_email')
        if user_email:
            try:
                user = User.objects.get(email=user_email)
                self.stdout.write(f"   ✅ Found user: {user.full_name} ({user.email})")
            except User.DoesNotExist:
                self.stdout.write(f"   ❌ User with email {user_email} not found")
                return
        else:
            # Get first user
            user = User.objects.first()
            if not user:
                self.stdout.write("   ❌ No users found in database")
                return
            self.stdout.write(f"   ✅ Using user: {user.full_name} ({user.email})")
        
        # Test 3: Template rendering
        self.stdout.write("\n2. Testing template rendering...")
        
        try:
            # Test context data
            context = {
                'user': user,
                'approved_by': user,  # Using same user for testing
                'approval_date': timezone.now(),
                'login_url': settings.FRONTEND_LOGIN_URL,
            }
            
            # Try to render HTML template
            html_content = render_to_string('emails/account_approved.html', context)
            self.stdout.write("   ✅ HTML template rendered successfully")
            self.stdout.write(f"   📄 HTML length: {len(html_content)} characters")
            
            # Try to render text template
            text_content = render_to_string('emails/account_approved.txt', context)
            self.stdout.write("   ✅ Text template rendered successfully")
            self.stdout.write(f"   📄 Text length: {len(text_content)} characters")
            
        except Exception as e:
            self.stdout.write(f"   ❌ Template rendering failed: {str(e)}")
            self.stdout.write(f"   📁 Template search paths:")
            for template_dir in settings.TEMPLATES[0]['DIRS']:
                self.stdout.write(f"      - {template_dir}")
            return
        
        # Test 4: Email sending (if not template-only test)
        if not options.get('test_template'):
            self.stdout.write("\n3. Testing email sending...")
            try:
                from api.email_service import EmailService
                result = EmailService.send_account_approved_email(user, user)
                if result:
                    self.stdout.write("   ✅ Email sent successfully")
                else:
                    self.stdout.write("   ❌ Email sending failed")
            except Exception as e:
                self.stdout.write(f"   ❌ Email sending error: {str(e)}")
        else:
            self.stdout.write("\n3. Skipping email sending (template test only)")
        
        # Test 5: Show sample content
        self.stdout.write("\n4. Sample email content preview:")
        self.stdout.write("=" * 50)
        preview = text_content[:300] if 'text_content' in locals() else "Could not render"
        self.stdout.write(preview)
        if len(text_content) > 300:
            self.stdout.write("... (truncated)")
        self.stdout.write("=" * 50)
        
        self.stdout.write("\n🎉 Email test completed!")