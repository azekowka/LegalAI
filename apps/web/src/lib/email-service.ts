import { Resend } from 'resend';

// Initialize Resend with fallback for build time
const resend = new Resend(process.env.RESEND_API_KEY || 're_WwNJVxnr_ELiLWhre1AQS8jw5AvMmn52f');

export interface EmailOTPParams {
  email: string;
  otp: string;
  type: 'sign-in' | 'email-verification' | 'forget-password';
}

function createOTPEmailHTML(otp: string, type: EmailOTPParams['type'], userEmail: string): string {
  const getContent = () => {
    switch (type) {
      case 'email-verification':
        return {
          title: 'Verify Your Email Address',
          greeting: 'Welcome to Legal AI!',
          message: 'Please verify your email address to complete your account setup.',
          instruction: 'Enter this verification code in the app:',
          footer: 'If you didn\'t create an account, you can safely ignore this email.'
        };
      case 'sign-in':
        return {
          title: 'Your Sign-In Code',
          greeting: 'Sign in to Legal AI',
          message: 'Use the code below to sign in to your account.',
          instruction: 'Enter this code to sign in:',
          footer: 'If you didn\'t request this code, you can safely ignore this email.'
        };
      case 'forget-password':
        return {
          title: 'Reset Your Password',
          greeting: 'Password Reset Request',
          message: 'We received a request to reset your password.',
          instruction: 'Enter this code to reset your password:',
          footer: 'If you didn\'t request a password reset, you can safely ignore this email.'
        };
    }
  };

  const content = getContent();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${content.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 30px;">
          <h1 style="font-size: 28px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">Legal AI</h1>
          <p style="font-size: 16px; color: #6b7280; margin: 0;">${content.title}</p>
        </div>

        <!-- Main Content -->
        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px;">${content.greeting}</h2>
          
          <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 30px;">${content.message}</p>

          <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">${content.instruction}</p>

          <!-- OTP Code Box -->
          <div style="background-color: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: bold; color: #1f2937; letter-spacing: 8px; font-family: Monaco, Consolas, 'Courier New', monospace;">
              ${otp}
            </div>
          </div>

          <p style="font-size: 14px; color: #9ca3af; text-align: center; margin: 20px 0;">
            This code will expire in 5 minutes for security reasons.
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; text-align: center;">
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 20px;">${content.footer}</p>
          
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            This email was sent to ${userEmail}. If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendVerificationOTP({ email, otp, type }: EmailOTPParams): Promise<void> {
  console.log(`Sending OTP email to ${email} via Resend`);
  console.log(`OTP: ${otp}`);
  console.log(`Type: ${type}`);

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    throw new Error('Email service not configured');
  }

  try {
    // Get subject based on type
    let subject = '';
    switch (type) {
      case 'email-verification':
        subject = 'Verify your email address - Legal AI';
        break;
      case 'sign-in':
        subject = 'Your sign-in code - Legal AI';
        break;
      case 'forget-password':
        subject = 'Reset your password - Legal AI';
        break;
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Legal AI <noreply@resend.dev>', // You can change this to your verified domain
      to: [email],
      subject: subject,
      html: createOTPEmailHTML(otp, type, email),
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent successfully via Resend');
    console.log('📧 Email ID:', data?.id);
    
    // Still log to console for development
    console.log('='.repeat(50));
    console.log(`📧 EMAIL SENT TO: ${email}`);
    console.log(`📋 SUBJECT: ${subject}`);
    console.log(`🔑 OTP CODE: ${otp}`);
    console.log(`📝 TYPE: ${type}`);
    console.log(`📨 RESEND ID: ${data?.id}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    
    // Fallback: Still show in console for development
    console.log('⚠️ FALLBACK: Email failed to send, showing OTP in console');
    console.log('='.repeat(50));
    console.log(`📧 EMAIL (FAILED) TO: ${email}`);
    console.log(`🔑 OTP CODE: ${otp}`);
    console.log(`📝 TYPE: ${type}`);
    console.log('='.repeat(50));
    
    throw new Error('Failed to send verification email');
  }
}
