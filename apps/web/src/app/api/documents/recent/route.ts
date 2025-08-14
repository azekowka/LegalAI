import { NextRequest, NextResponse } from 'next/server'
import { getRecentDocuments } from '@/lib/documents-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const recentDocuments = getRecentDocuments(limit)
    
    return NextResponse.json({
      documents: recentDocuments,
      count: recentDocuments.length
    })
  } catch (error) {
    console.error('Error fetching recent documents:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить недавние документы' },
      { status: 500 }
    )
  }
}