import { NextRequest } from 'next/server'
import { auth } from './auth'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image?: string | null // Add this line
}

/**
 * Get the current authenticated user from the request
 * Returns null if user is not authenticated
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    console.log('=== GETTING CURRENT USER ===')
    
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers
    })

    console.log('Better Auth session:', session)

    if (!session?.user) {
      console.log('No session or user found')
      return null
    }

    const user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      emailVerified: session.user.emailVerified,
      image: session.user.image || null, // Include image, with fallback
    }
    
    console.log('Authenticated user:', user)
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Middleware helper to require authentication
 * Returns user if authenticated, throws error if not
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getCurrentUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

/**
 * Get user ID for Supabase RLS policies
 * This should match the user_id format expected by your RLS policies
 */
export function getUserIdForSupabase(user: AuthenticatedUser): string {
  return user.id // Better Auth uses CUID format
}
