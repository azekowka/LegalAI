import { NextRequest, NextResponse } from 'next/server'
import { getStarredDocuments } from '@/lib/documents-store'

export async function GET(request: NextRequest) {
  try {
    const starredDocuments = getStarredDocuments()
    
    return NextResponse.json({
      documents: starredDocuments,
      count: starredDocuments.length
    })
  } catch (error) {
    console.error('Error fetching starred documents:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить избранные документы' },
      { status: 500 }
    )
  }
}