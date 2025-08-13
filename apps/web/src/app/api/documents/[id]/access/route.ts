import { NextRequest, NextResponse } from 'next/server'
import { updateLastAccessed } from '@/lib/documents-store'

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

    const success = updateLastAccessed(documentId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Время последнего доступа обновлено'
    })
  } catch (error) {
    console.error('Error updating last accessed:', error)
    return NextResponse.json(
      { error: 'Не удалось обновить время доступа' },
      { status: 500 }
    )
  }
}