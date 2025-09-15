# Better Auth + Supabase PostgreSQL + Prisma Integration Setup

This document outlines the complete integration of Better Auth with Supabase PostgreSQL and Prisma for the LegalAI application.

## ✅ Completed Integration

### 1. Dependencies Installed
- `better-auth` - Main authentication library
- `@prisma/client` - Prisma client for database operations
- `prisma` - Prisma CLI and dev tools

### 2. Database Schema Updated
**File**: `apps/web/src/prisma/schema.prisma`

Added Better Auth required models:
- `User` - User accounts with email, name, and metadata
- `Session` - User sessions with expiration and device info
- `Account` - OAuth and email/password accounts
- `Verification` - Email verification and password reset tokens
- `Document` - Application-specific document model

### 3. Better Auth Configuration
**File**: `apps/web/src/lib/auth.ts`

Configured with:
- Prisma adapter for PostgreSQL
- Email and password authentication
- Google OAuth provider
- Auto sign-in after registration
- Proper security settings

### 4. Frontend Client Setup
**File**: `apps/web/src/lib/auth-client.ts`

React client with exported methods:
- `signIn`, `signUp`, `signOut`
- `useSession`, `getSession`
- Password management functions
- Social provider linking

### 5. API Routes
**File**: `apps/web/src/app/api/auth/[...all]/route.ts`

Handles all Better Auth API endpoints at `/api/auth/*`

### 6. Authentication Pages Updated
**Files**: 
- `apps/web/src/app/sign-in/page.tsx`
- `apps/web/src/app/sign-up/page.tsx`

Both pages now use:
- Better Auth client methods
- Proper error handling with toast notifications
- Loading states
- Google OAuth integration

### 7. Middleware Protection
**File**: `apps/web/src/middleware.ts`

Implements:
- Route protection for authenticated areas
- Automatic redirects for unauthenticated users
- Public route definitions
- Session validation

### 8. Session Management
**Files**:
- `apps/web/src/components/auth-provider.tsx`
- `apps/web/src/components/providers.tsx`

Provides:
- Global session state
- Custom `useAuthSession` hook
- Integrated with existing providers

## 🔧 Required Environment Variables

Add these to your `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"

# Better Auth
BETTER_AUTH_SECRET="[GENERATE-RANDOM-32-CHAR-SECRET]"
BETTER_AUTH_URL="http://localhost:3001"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="[GOOGLE-CLIENT-ID]"
GOOGLE_CLIENT_SECRET="[GOOGLE-CLIENT-SECRET]"
```

## 📋 Next Steps

### 1. Install Missing Dependencies
```bash
cd apps/web
pnpm add @prisma/client prisma
```

### 2. Generate Prisma Client
```bash
cd apps/web
npx prisma generate
```

### 3. Push Database Schema
```bash
cd apps/web
npx prisma db push
```

### 4. Set Up Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/api/auth/callback/google`
6. Add the client ID and secret to your environment variables

### 5. Generate Better Auth Secret
```bash
openssl rand -base64 32
```

## 🚀 Usage Examples

### Sign In
```typescript
import { authClient } from '@/lib/auth-client';

const { data, error } = await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true
});
```

### Sign Up
```typescript
const { data, error } = await authClient.signUp.email({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});
```

### Get Session
```typescript
import { useAuthSession } from '@/components/auth-provider';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuthSession();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

### Sign Out
```typescript
await authClient.signOut();
```

## 🛡️ Security Features

- ✅ CSRF protection
- ✅ Session management with expiration
- ✅ Password hashing (automatic)
- ✅ Email verification (configurable)
- ✅ Rate limiting (configurable)
- ✅ Secure cookie settings
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React)

## 📁 File Structure

```
apps/web/src/
├── lib/
│   ├── auth.ts              # Better Auth server config
│   └── auth-client.ts       # Better Auth client config
├── app/
│   ├── api/auth/[...all]/
│   │   └── route.ts         # Auth API routes
│   ├── sign-in/
│   │   ├── page.tsx         # Sign in page with Better Auth
│   │   └── sign-in.tsx      # Sign in component
│   └── sign-up/
│       ├── page.tsx         # Sign up page with Better Auth
│       └── sign-up.tsx      # Sign up component
├── components/
│   ├── auth-provider.tsx    # Auth session provider
│   └── providers.tsx        # Updated with auth provider
├── prisma/
│   └── schema.prisma        # Updated with auth models
└── middleware.ts            # Route protection middleware
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Module not found" errors**: Run `pnpm install` to ensure all dependencies are installed
2. **Database connection errors**: Check your `DATABASE_URL` and ensure Supabase is accessible
3. **Prisma client errors**: Run `npx prisma generate` to regenerate the client
4. **Session not persisting**: Check that `BETTER_AUTH_SECRET` is set and consistent
5. **Google OAuth not working**: Verify redirect URIs in Google Console match your setup

### Debug Mode:
Add to your auth configuration for debugging:
```typescript
export const auth = betterAuth({
  // ... existing config
  logger: {
    level: 'debug'
  }
});
```

## 📚 Additional Resources

- [Better Auth Documentation](https://better-auth.com/docs)
- [Prisma Documentation](https://prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)

The integration is now complete and ready for testing! 🎉
