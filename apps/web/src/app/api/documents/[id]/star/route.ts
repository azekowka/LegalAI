import { NextRequest, NextResponse } from 'next/server'
import { toggleStarDocument, findDocumentById } from '@/lib/documents-store'
import { requireAuth } from '@/lib/auth-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    const success = await toggleStarDocument(id, user.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      )
    }

    const updatedDocument = await findDocumentById(id, user.id)
    
    return NextResponse.json({
      message: updatedDocument?.starred ? 'Документ добавлен в избранное' : 'Документ удален из избранного',
      starred: updatedDocument?.starred || false
    })
  } catch (error) {
    console.error('Error toggling star status:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Не удалось изменить статус избранного' },
      { status: 500 }
    )
  }
}