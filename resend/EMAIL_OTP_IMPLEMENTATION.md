# Email OTP Implementation Guide

This document describes the Email OTP functionality implemented for user sign-up email verification and password reset.

## Overview

The implementation uses Better Auth's Email OTP plugin to provide:
1. **Email verification on sign-up** - Users must verify their email before accessing the dashboard
2. **Password reset via OTP** - Users can reset their password using a code sent to their email

## Files Modified/Created

### Server-side Configuration
- `apps/web/src/lib/auth.ts` - Added Email OTP plugin configuration
- `apps/web/src/lib/email-service.ts` - Email sending service (currently logs to console for development)

### Client-side Configuration  
- `apps/web/src/lib/auth-client.ts` - Added Email OTP client plugin and exported methods

### Components
- `apps/web/src/components/auth/email-verification.tsx` - Email verification component
- `apps/web/src/components/auth/forgot-password.tsx` - Password reset component

### Pages
- `apps/web/src/app/sign-up/page.tsx` - Updated to handle email verification flow
- `apps/web/src/app/forgot-password/page.tsx` - New password reset page

### Testing
- `apps/web/src/lib/test-email-otp.ts` - Test utilities for Email OTP functionality

## Configuration Details

### Better Auth Server Configuration

```typescript
plugins: [
  emailOTP({
    sendVerificationOnSignUp: true, // Send OTP on sign-up
    overrideDefaultEmailVerification: true, // Use OTP instead of email links
    otpLength: 6,
    expiresIn: 300, // 5 minutes
    allowedAttempts: 3,
    async sendVerificationOTP({ email, otp, type }) {
      await sendVerificationOTP({ email, otp, type });
    },
  })
]
```

### Email Service Configuration

✅ **Resend is now configured and active!**

The email service uses Resend for production email delivery with beautiful HTML templates. Configuration:

1. ✅ Resend package installed
2. ✅ Professional email templates created
3. ✅ Email service implemented with Resend
4. ✅ Fallback to console logging if Resend fails

Required environment variable:
```bash
RESEND_API_KEY=your_api_key_here
```

**From Address**: Currently using `Legal AI <noreply@resend.dev>` 
- You can change this to your verified domain in `email-service.ts`

## User Flow

### Sign-up with Email Verification

1. User fills out sign-up form
2. Account is created but not verified
3. OTP is sent to user's email
4. User enters OTP in verification form
5. Email is verified and user can sign in

### Password Reset

1. User clicks "Forgot Password" or visits `/forgot-password`
2. User enters their email address
3. OTP is sent to user's email
4. User enters OTP and new password
5. Password is reset successfully

## API Endpoints

The Email OTP plugin adds these endpoints:

- `POST /email-otp/send-verification-otp` - Send OTP
- `POST /email-otp/check-verification-otp` - Check OTP validity (optional)
- `POST /email-otp/verify-email` - Verify email with OTP
- `POST /sign-in/email-otp` - Sign in with OTP
- `POST /forget-password/email-otp` - Send password reset OTP
- `POST /email-otp/reset-password` - Reset password with OTP

## Client Methods

Available through the auth client:

```typescript
import { sendVerificationOtp, checkVerificationOtp, verifyEmail } from '@/lib/auth-client';

// Send verification OTP
await sendVerificationOtp({
  email: 'user@example.com',
  type: 'email-verification'
});

// Check OTP validity (optional)
await checkVerificationOtp({
  email: 'user@example.com',
  otp: '123456',
  type: 'email-verification'
});

// Verify email
await verifyEmail({
  email: 'user@example.com',
  otp: '123456'
});
```

## Testing

### Development Testing

✅ **Resend Integration Active**: Emails are now sent via Resend AND logged to console for development.

Look for output like:

```
✅ Email sent successfully via Resend
📧 Email ID: 01234567-89ab-cdef-0123-456789abcdef
==================================================
📧 EMAIL SENT TO: user@example.com
📋 SUBJECT: Verify your email address - Legal AI
🔑 OTP CODE: 123456
📝 TYPE: email-verification
📨 RESEND ID: 01234567-89ab-cdef-0123-456789abcdef
==================================================
```

### Browser Console Testing

✅ **Enhanced Test Utilities**: Both email flow testing and Resend-specific testing available.

**Email Flow Testing**:
```javascript
// Test complete email verification flow
await testEmailOTP.testEmailOTPFlow('test@example.com');

// Test password reset flow
await testEmailOTP.testPasswordResetFlow('test@example.com');

// Test OTP verification
await testEmailOTP.testOTPVerification('test@example.com', '123456');
```

**Resend-Specific Testing**:
```javascript
// Test Resend configuration
testResend.checkResendConfiguration();

// Test sending single email type
await testResend.testResendEmailOTP('your-email@example.com', 'email-verification');

// Test all email types at once
await testResend.testAllEmailTypes('your-email@example.com');
```

## Production Setup

### Email Service Integration

✅ **Resend is already integrated and production-ready!**

**Current Setup**:
- ✅ Resend package installed
- ✅ Professional HTML email templates
- ✅ Error handling with fallback
- ✅ Development logging for debugging

**For Production**:
1. Verify your domain in Resend dashboard
2. Update the `from` address in `email-service.ts`
3. Remove console logging if desired

### Environment Variables

Add these to your `.env.local`:

```bash
# Email service configuration
RESEND_API_KEY=your_resend_api_key
# OR
SENDGRID_API_KEY=your_sendgrid_api_key
# OR
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Security Considerations

1. **Rate Limiting** - Implement rate limiting for OTP requests
2. **Email Templates** - Use professional email templates
3. **Monitoring** - Monitor email delivery and OTP usage
4. **Logging** - Remove console logs in production

## Customization

### OTP Configuration

Modify OTP settings in `auth.ts`:

```typescript
emailOTP({
  otpLength: 8, // Change OTP length
  expiresIn: 600, // 10 minutes expiry
  allowedAttempts: 5, // More attempts allowed
})
```

### Email Templates

Customize email templates in `email-service.ts`:

```typescript
switch (type) {
  case 'email-verification':
    subject = 'Welcome! Verify your email';
    message = `Welcome to Legal AI! Your verification code: ${otp}`;
    break;
  // ... other cases
}
```

### UI Customization

Components use Tailwind CSS and can be customized:
- `EmailVerification` component styling
- `ForgotPassword` component styling
- Toast notifications

## Troubleshooting

### Common Issues

1. **OTP not received** - Check console logs in development
2. **Invalid OTP** - Ensure OTP hasn't expired (5 minutes default)
3. **Too many attempts** - Wait for cooldown or request new OTP
4. **Email service errors** - Check API keys and service configuration

### Debug Mode

Enable debug logging in `auth.ts`:

```typescript
export const auth = betterAuth({
  // ... other config
  logger: {
    level: 'debug'
  }
});
```

## Next Steps

1. **Set up production email service**
2. **Add rate limiting**
3. **Implement email templates**
4. **Add monitoring and analytics**
5. **Test thoroughly in production environment**

## Support

For issues with Better Auth Email OTP plugin:
- [Better Auth Documentation](https://better-auth.com/docs/plugins/email-otp)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
