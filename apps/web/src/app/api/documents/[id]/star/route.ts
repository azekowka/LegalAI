import { NextRequest, NextResponse } from 'next/server'
import { toggleStarDocument, findDocumentById } from '@/lib/documents-store'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = parseInt(params.id)
    
    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: 'Неверный ID документа' },
        { status: 400 }
      )
    }

    const success = toggleStarDocument(documentId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      )
    }

    const updatedDocument = findDocumentById(documentId)
    
    return NextResponse.json({
      message: updatedDocument?.starred ? 'Документ добавлен в избранное' : 'Документ удален из избранного',
      starred: updatedDocument?.starred || false
    })
  } catch (error) {
    console.error('Error toggling star status:', error)
    return NextResponse.json(
      { error: 'Не удалось изменить статус избранного' },
      { status: 500 }
    )
  }
}