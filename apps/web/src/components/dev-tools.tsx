'use client';

import { useEffect } from 'react';

export function DevTools() {
  useEffect(() => {
    // Only load in development
    if (process.env.NODE_ENV === 'development') {
      // Import test utilities
      import('@/lib/test-email-otp');
      import('@/lib/test-resend');
      
      console.log('🛠️ Development tools loaded!');
      console.log('📧 Email OTP test utilities available:');
      console.log('  - testEmailOTP.testEmailOTPFlow("email@example.com")');
      console.log('  - testEmailOTP.testPasswordResetFlow("email@example.com")');
      console.log('  - testEmailOTP.testOTPVerification("email@example.com", "123456")');
      console.log('📨 Resend test utilities available:');
      console.log('  - testResend.testResendEmailOTP("email@example.com")');
      console.log('  - testResend.testAllEmailTypes("email@example.com")');
      console.log('  - testResend.checkResendConfiguration()');
    }
  }, []);

  return null; // This component doesn't render anything
}
