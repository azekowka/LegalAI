import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const handler = toNextJsHandler(auth);

// Parse allowed origins from environment variable
const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001';
  return origins.split(',').map(origin => origin.trim());
};

// Add CORS headers to the handler with proper security
const addCorsHeaders = (request: Request, response: Response) => {
  const origin = request.headers.get('origin');
  
  if (process.env.NODE_ENV === 'development') {
    // В development разрешаем любой origin с credentials для удобства разработки
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Vary', 'Origin');
    }
  } else {
    // В production проверяем whitelist доменов
    const allowedOrigins = getAllowedOrigins();
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Vary', 'Origin');
    }
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  
  return response;
};

export const GET = async (request: Request) => {
  const response = await handler.GET(request);
  return addCorsHeaders(request, response);
};

export const POST = async (request: Request) => {
  const response = await handler.POST(request);
  return addCorsHeaders(request, response);
};

export const OPTIONS = async (request: Request) => {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(request, response);
};
