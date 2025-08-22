import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const { GET, POST } = toNextJsHandler(auth);
