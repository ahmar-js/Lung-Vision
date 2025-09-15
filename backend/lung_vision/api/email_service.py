"""
Email service for LungVision user account notifications.
Handles sending professional email notifications for account approval/rejection.
"""

import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from typing import Optional

logger = logging.getLogger(__name__)

class EmailService:
    """Service class for handling email notifications"""
    
    @staticmethod
    def get_login_url():
        """Get the frontend login URL"""
        # This should be configured in settings
        return getattr(settings, 'FRONTEND_LOGIN_URL', 'http://localhost:3000/role-selection')
    
    @staticmethod
    def send_account_approved_email(user, approved_by=None):
        """
        Send account approval notification email to user
        
        Args:
            user: User instance that was approved
            approved_by: Admin user who approved the account (optional)
        
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            # Prepare context for email templates
            context = {
                'user': user,
                'approved_by': approved_by,
                'approval_date': user.approved_date or timezone.now(),
                'login_url': EmailService.get_login_url(),
            }
            
            # Render email templates
            html_content = render_to_string('emails/account_approved.html', context)
            text_content = render_to_string('emails/account_approved.txt', context)
            
            # Create subject line
            subject = f'🎉 Your {user.get_role_display()} Account has been Approved - LungVision'
            
            # Create email message
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
                reply_to=[settings.DEFAULT_FROM_EMAIL],
            )
            
            # Attach HTML version
            email.attach_alternative(html_content, "text/html")
            
            # Send email
            email.send()
            
            logger.info(f"Account approval email sent successfully to {user.email} ({user.full_name})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send account approval email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_account_rejected_email(user, rejection_reason=None, rejected_by=None):
        """
        Send account rejection notification email to user
        
        Args:
            user: User instance that was rejected
            rejection_reason: Reason for rejection (optional)
            rejected_by: Admin user who rejected the account (optional)
        
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            # Prepare context for email templates
            context = {
                'user': user,
                'rejected_by': rejected_by,
                'rejection_date': user.approved_date or timezone.now(),  # approved_date is used for both approval and rejection timestamps
                'rejection_reason': rejection_reason or user.rejection_reason,
            }
            
            # Render email templates
            html_content = render_to_string('emails/account_rejected.html', context)
            text_content = render_to_string('emails/account_rejected.txt', context)
            
            # Create subject line
            subject = f'Account Application Update - LungVision {user.get_role_display()} Application'
            
            # Create email message
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
                reply_to=[settings.DEFAULT_FROM_EMAIL],
            )
            
            # Attach HTML version
            email.attach_alternative(html_content, "text/html")
            
            # Send email
            email.send()
            
            logger.info(f"Account rejection email sent successfully to {user.email} ({user.full_name})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send account rejection email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_bulk_approval_emails(users, approved_by=None):
        """
        Send approval emails to multiple users
        
        Args:
            users: QuerySet or list of User instances
            approved_by: Admin user who approved the accounts
        
        Returns:
            dict: Summary of email sending results
        """
        results = {
            'success_count': 0,
            'failure_count': 0,
            'failed_emails': []
        }
        
        for user in users:
            if EmailService.send_account_approved_email(user, approved_by):
                results['success_count'] += 1
            else:
                results['failure_count'] += 1
                results['failed_emails'].append(user.email)
        
        logger.info(f"Bulk approval emails: {results['success_count']} sent, {results['failure_count']} failed")
        return results
    
    @staticmethod
    def send_bulk_rejection_emails(users, rejection_reason=None, rejected_by=None):
        """
        Send rejection emails to multiple users
        
        Args:
            users: QuerySet or list of User instances
            rejection_reason: Common rejection reason
            rejected_by: Admin user who rejected the accounts
        
        Returns:
            dict: Summary of email sending results
        """
        results = {
            'success_count': 0,
            'failure_count': 0,
            'failed_emails': []
        }
        
        for user in users:
            if EmailService.send_account_rejected_email(user, rejection_reason, rejected_by):
                results['success_count'] += 1
            else:
                results['failure_count'] += 1
                results['failed_emails'].append(user.email)
        
        logger.info(f"Bulk rejection emails: {results['success_count']} sent, {results['failure_count']} failed")
        return results


# Convenience functions for easy import
def send_approval_email(user, approved_by=None):
    """Convenience function to send approval email"""
    return EmailService.send_account_approved_email(user, approved_by)

def send_rejection_email(user, rejection_reason=None, rejected_by=None):
    """Convenience function to send rejection email"""
    return EmailService.send_account_rejected_email(user, rejection_reason, rejected_by)