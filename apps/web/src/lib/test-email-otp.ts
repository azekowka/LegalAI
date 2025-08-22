// Test utility for Email OTP functionality
// This file can be used to test the Email OTP implementation

import { sendVerificationOtp, checkVerificationOtp, verifyEmail } from './auth-client';

export async function testEmailOTPFlow(email: string) {
  console.log('🧪 Testing Email OTP Flow for:', email);
  
  try {
    // Step 1: Send verification OTP
    console.log('📤 Step 1: Sending verification OTP...');
    const sendResult = await sendVerificationOtp({
      email,
      type: 'email-verification'
    });
    
    if (sendResult.error) {
      console.error('❌ Failed to send OTP:', sendResult.error);
      return false;
    }
    
    console.log('✅ OTP sent successfully!');
    console.log('💡 Check your console for the OTP code (in development mode)');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

export async function testPasswordResetFlow(email: string) {
  console.log('🧪 Testing Password Reset Flow for:', email);
  
  try {
    // Import forgetPassword from auth client
    const { forgetPassword } = await import('./auth-client');
    
    console.log('📤 Sending password reset OTP...');
    const result = await forgetPassword.emailOtp({
      email
    });
    
    if (result.error) {
      console.error('❌ Failed to send reset OTP:', result.error);
      return false;
    }
    
    console.log('✅ Password reset OTP sent successfully!');
    console.log('💡 Check your console for the OTP code (in development mode)');
    
    return true;
  } catch (error) {
    console.error('❌ Password reset test failed:', error);
    return false;
  }
}

export async function testOTPVerification(email: string, otp: string) {
  console.log('🧪 Testing OTP Verification for:', email);
  
  try {
    console.log('🔍 Checking OTP validity...');
    const checkResult = await checkVerificationOtp({
      email,
      otp,
      type: 'email-verification'
    });
    
    if (checkResult.error) {
      console.error('❌ OTP check failed:', checkResult.error);
      return false;
    }
    
    console.log('✅ OTP is valid!');
    
    console.log('✉️ Verifying email...');
    const verifyResult = await verifyEmail({
      email,
      otp
    });
    
    if (verifyResult.error) {
      console.error('❌ Email verification failed:', verifyResult.error);
      return false;
    }
    
    console.log('✅ Email verified successfully!');
    return true;
  } catch (error) {
    console.error('❌ OTP verification test failed:', error);
    return false;
  }
}

// Usage examples (can be called from browser console):
// await testEmailOTPFlow('test@example.com')
// await testPasswordResetFlow('test@example.com')  
// await testOTPVerification('test@example.com', '123456')

if (typeof window !== 'undefined') {
  // Make functions available in browser console for testing
  (window as any).testEmailOTP = {
    testEmailOTPFlow,
    testPasswordResetFlow,
    testOTPVerification
  };
  
  // Also import Resend test utilities
  import('./test-resend').then(module => {
    (window as any).testResend = module;
  });
}
