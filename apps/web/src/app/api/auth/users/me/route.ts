import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils' // Import requireAuth

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request) // Get authenticated user
    
    // Return actual user data from Better Auth
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image || null,
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    )
  }
}