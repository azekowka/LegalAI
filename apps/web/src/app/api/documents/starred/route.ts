import { NextRequest, NextResponse } from 'next/server'
import { getStarredDocuments } from '@/lib/documents-store'
import { requireAuth } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const starredDocuments = await getStarredDocuments(user.id)
    
    return NextResponse.json({
      documents: starredDocuments,
      count: starredDocuments.length
    })
  } catch (error) {
    console.error('Error fetching starred documents:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Не удалось загрузить избранные документы' },
      { status: 500 }
    )
  }
}