import { NextRequest, NextResponse } from 'next/server'
import { getRecentDocuments } from '@/lib/documents-store'
import { requireAuth } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const recentDocuments = await getRecentDocuments(user.id, limit)
    
    return NextResponse.json({
      documents: recentDocuments,
      count: recentDocuments.length
    })
  } catch (error) {
    console.error('Error fetching recent documents:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Не удалось загрузить недавние документы' },
      { status: 500 }
    )
  }
}