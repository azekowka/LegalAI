// Test utility for Resend Email OTP functionality
// Use this to test the actual email sending with Resend

import { sendVerificationOTP } from './email-service';

export async function testResendEmailOTP(email: string, type: 'sign-in' | 'email-verification' | 'forget-password' = 'email-verification') {
  console.log('🧪 Testing Resend Email OTP for:', email);
  console.log('📧 Email type:', type);
  
  // Generate a test OTP
  const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    console.log('📤 Sending test OTP via Resend...');
    console.log('🔑 Test OTP:', testOTP);
    
    await sendVerificationOTP({
      email,
      otp: testOTP,
      type
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your email inbox for the OTP email');
    console.log('🔑 Expected OTP in email:', testOTP);
    
    return {
      success: true,
      otp: testOTP,
      message: 'Test email sent successfully via Resend'
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to send test email'
    };
  }
}

export async function testAllEmailTypes(email: string) {
  console.log('🧪 Testing all email types for:', email);
  
  const results = {
    emailVerification: await testResendEmailOTP(email, 'email-verification'),
    signIn: await testResendEmailOTP(email, 'sign-in'),
    passwordReset: await testResendEmailOTP(email, 'forget-password')
  };
  
  console.log('📊 Test Results Summary:');
  console.log('Email Verification:', results.emailVerification.success ? '✅ Success' : '❌ Failed');
  console.log('Sign In:', results.signIn.success ? '✅ Success' : '❌ Failed');
  console.log('Password Reset:', results.passwordReset.success ? '✅ Success' : '❌ Failed');
  
  return results;
}

export function checkResendConfiguration() {
  console.log('🔧 Checking Resend configuration...');
  
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not set in environment variables');
    console.log('💡 Add RESEND_API_KEY=your_api_key to your .env.local file');
    return false;
  }
  
  if (!apiKey.startsWith('re_')) {
    console.warn('⚠️ RESEND_API_KEY might be invalid (should start with "re_")');
    return false;
  }
  
  console.log('✅ RESEND_API_KEY is configured');
  console.log('🔑 API Key prefix:', apiKey.substring(0, 8) + '...');
  
  return true;
}

// Usage examples (can be called from browser console):
// await testResendEmailOTP('your-email@example.com')
// await testAllEmailTypes('your-email@example.com')
// checkResendConfiguration()

if (typeof window !== 'undefined') {
  // Make functions available in browser console for testing
  (window as any).testResend = {
    testResendEmailOTP,
    testAllEmailTypes,
    checkResendConfiguration
  };
  
  console.log('🛠️ Resend test utilities loaded!');
  console.log('📝 Available commands:');
  console.log('  - testResend.testResendEmailOTP("your-email@example.com")');
  console.log('  - testResend.testAllEmailTypes("your-email@example.com")');
  console.log('  - testResend.checkResendConfiguration()');
}
