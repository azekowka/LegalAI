import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { sendVerificationOTP } from './email-service';

console.log('Environment variables check:');
console.log('BETTER_AUTH_SECRET:', process.env.BETTER_AUTH_SECRET ? 'Set' : 'Not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');

// Создаем Prisma client только в Node.js runtime, не в Edge и не во время сборки
let prisma: any = null;

const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV;
const isEdgeRuntime = 'EdgeRuntime' in globalThis;
const isBrowser = typeof window !== 'undefined';

if (!isBrowser && !isEdgeRuntime && !isBuildTime && process.env.DATABASE_URL) {
  try {
    console.log('Initializing Prisma client for Node.js runtime...');
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    
    // Проверяем подключение к базе данных (не блокирующе)
    prisma.$connect().then(() => {
      console.log('Prisma connected to database successfully');
    }).catch((error: unknown) => {
      console.error('Prisma connection error:', error);
    });
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error);
  }
} else {
  console.log('Skipping Prisma client initialization (build time, edge runtime, or browser detected)');
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
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  trustedOrigins: [
      'http://localhost:3001',
      'http://localhost:3000',
      process.env.BETTER_AUTH_URL || 'http://localhost:3001'
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
        try {
          await sendVerificationOTP({ email, otp, type });
        } catch (error) {
          console.error('Error sending verification OTP:', error);
          throw error;
        }
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

let auth: any;

try {
  auth = betterAuth(authConfig);
  console.log('Better Auth initialized successfully');
} catch (error) {
  console.error('Failed to initialize Better Auth:', error);
  // Create a minimal fallback auth object to prevent runtime errors
  auth = {
    handler: () => new Response('Auth service unavailable', { status: 503 })
  };
}

export { auth };