import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { sendVerificationOTP } from './email-service';

console.log('Environment variables check:');
console.log('BETTER_AUTH_SECRET:', process.env.BETTER_AUTH_SECRET ? 'Set' : 'Not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');

// Создаем Prisma client только в Node.js runtime, не в Edge
let prisma: any = null;

if (typeof window === 'undefined' && !('EdgeRuntime' in globalThis)) {
  console.log('Initializing Prisma client for Node.js runtime...');
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  
  // Проверяем подключение к базе данных
  prisma.$connect().then(() => {
    console.log('Prisma connected to database successfully');
  }).catch((error: unknown) => {
    console.error('Prisma connection error:', error);
  });
} else {
  console.log('Skipping Prisma client initialization (Edge runtime detected)');
}

console.log('Creating Better Auth instance...');

// Создаем конфигурацию только если Prisma доступна
const authConfig: any = {
  emailAndPassword: {
      enabled: true,
      autoSignIn: false, // Disable auto sign-in to require email verification
      requireEmailVerification: true
  },
  socialProviders: {
      google: {
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
      }
  },
  secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-here-32-chars',
  baseURL: 'http://localhost:3001',
  trustedOrigins: [
      'http://localhost:3001',
      'http://localhost:3000'
  ],
  telemetry: {
      enabled: false
  },
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
};

// Добавляем database адаптер только если Prisma доступна
if (prisma) {
  authConfig.database = prismaAdapter(prisma, {
    provider: 'postgresql'
  });
}

export const auth = betterAuth(authConfig);

console.log('Better Auth initialized successfully');
console.log('Auth instance type:', typeof auth);
console.log('Auth keys:', Object.keys(auth));