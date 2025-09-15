# LungVision Email Notification System

## Overview

The LungVision platform now includes a professional email notification system that automatically sends emails to users when their accounts are approved or rejected by administrators.

## Features

### ✅ Professional Email Templates
- **HTML and Text versions** for better compatibility
- **Role-specific content** for doctors and researchers
- **Professional branding** with LungVision styling
- **Responsive design** that works on all devices

### 📧 Email Types

#### 1. Account Approval Email
- **Trigger**: When admin approves a user account
- **Content**: Congratulations message, account details, login instructions
- **CTA**: Direct link to login page
- **Role-specific features**: Different content for doctors vs researchers

#### 2. Account Rejection Email
- **Trigger**: When admin rejects a user account
- **Content**: Professional explanation, reason for rejection, next steps
- **Support**: Contact information and appeal process
- **Guidance**: Specific requirements for reapplication

### 🛠️ Admin Integration

#### Individual User Actions
- **Auto-email on status change**: Emails sent automatically when changing account status in user detail view
- **Email failure handling**: System continues working even if email fails
- **Comprehensive logging**: All email activities are logged

#### Bulk Actions
- **Bulk approve with emails**: Select multiple users and approve with email notifications
- **Bulk reject with emails**: Reject multiple users with consistent messaging
- **Email success tracking**: Admin sees how many emails were sent successfully
- **Failure reporting**: Clear feedback on any email delivery issues

#### Testing Features
- **Send test email**: Test email functionality without changing account status
- **Development mode**: Emails printed to console for testing

## Configuration

### Current Setup (Development)
```python
# Console backend - emails printed to terminal
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'LungVision <noreply@lungvision.com>'
FRONTEND_LOGIN_URL = 'http://localhost:3000/role-selection'
```

### Production Setup

To enable actual email sending in production, update `settings.py`:

```python
# Enable SMTP email backend
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Gmail SMTP Configuration (example)
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-lungvision-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'  # Use App Password for Gmail

# Professional sender address
DEFAULT_FROM_EMAIL = 'LungVision <noreply@lungvision.com>'
SERVER_EMAIL = DEFAULT_FROM_EMAIL

# Update frontend URL for production
FRONTEND_LOGIN_URL = 'https://your-lungvision-domain.com/role-selection'
```

### Alternative SMTP Providers

#### SendGrid
```python
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = 'your-sendgrid-api-key'
```

#### Amazon SES
```python
EMAIL_HOST = 'email-smtp.us-east-1.amazonaws.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-ses-smtp-username'
EMAIL_HOST_PASSWORD = 'your-ses-smtp-password'
```

## Usage

### For Administrators

#### Individual User Approval
1. Go to **Admin Panel** → **Users**
2. Click on a user to edit
3. Change **Account Status** to "Approved"
4. Save → **Email automatically sent**

#### Individual User Rejection
1. Go to **Admin Panel** → **Users**
2. Click on a user to edit
3. Change **Account Status** to "Rejected"
4. Add **Rejection Reason** (optional but recommended)
5. Save → **Email automatically sent**

#### Bulk Operations
1. Go to **Admin Panel** → **Users**
2. **Select users** using checkboxes
3. Choose action:
   - **"Approve selected users and send email notifications"**
   - **"Reject selected users and send email notifications"**
4. Click **"Go"** → **Emails sent to all selected users**

#### Testing
1. Select any user(s) in admin
2. Choose **"Send test approval email (for testing)"**
3. Click **"Go"** → **Test emails sent without changing status**

### Email Content Examples

#### Approval Email Features
- ✅ **Professional congratulations**
- ✅ **Complete account details**
- ✅ **Role-specific welcome message**
- ✅ **Direct login link**
- ✅ **Contact information**
- ✅ **Professional branding**

#### Rejection Email Features
- ❌ **Respectful explanation**
- ❌ **Clear reason (if provided)**
- ❌ **Next steps guidance**
- ❌ **Appeal/support contact**
- ❌ **Reapplication guidance**
- ❌ **Professional tone**

## Error Handling

### Email Failures
- **Non-blocking**: Account approval/rejection succeeds even if email fails
- **Logging**: All email failures are logged with details
- **Admin feedback**: Clear messages about email success/failure
- **Graceful degradation**: System continues working normally

### Development Testing
- **Console output**: In development, emails are printed to console
- **Template testing**: Easy to test email content and formatting
- **No external dependencies**: Works without SMTP configuration

## Monitoring

### Log Files
- **Location**: `email.log` in backend directory
- **Content**: All email sending activities and errors
- **Format**: Structured logging with timestamps

### Admin Feedback
- **Success messages**: "X emails sent successfully"
- **Failure tracking**: "Failed to send email to: user@example.com"
- **Comprehensive reporting**: Detailed status for bulk operations

## Security

### Email Security
- **No reply emails**: Users are informed not to reply
- **Support contact**: Clear support email provided
- **Professional sender**: Official LungVision domain
- **Secure templates**: No user input in email templates (prevents XSS)

### Data Privacy
- **Minimal data**: Only necessary user information in emails
- **Role-appropriate content**: Different templates for different roles
- **No sensitive data**: No passwords or private information in emails

## Future Enhancements

### Planned Features
- **Email preferences**: Allow users to opt-out of notifications
- **Custom templates**: Role-specific email template customization
- **Email analytics**: Track email open rates and engagement
- **Multi-language**: Support for multiple languages
- **Rich notifications**: HTML emails with embedded images

### Integration Opportunities
- **Calendar invitations**: For approved researchers/doctors
- **Welcome series**: Multi-step onboarding email sequence
- **Activity notifications**: Updates on platform features
- **Newsletter integration**: Optional platform updates

## Support

For email system issues:
1. **Check logs**: Review `email.log` for error details
2. **Test configuration**: Use "Send test email" admin action
3. **Verify SMTP**: Ensure SMTP credentials are correct
4. **Contact support**: Email technical support with log details

---

**LungVision Email System v1.0**  
*Professional, Reliable, User-Friendly*