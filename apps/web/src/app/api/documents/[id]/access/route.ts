import { NextRequest, NextResponse } from 'next/server'
import { updateLastAccessed } from '@/lib/documents-store'
import { requireAuth } from '@/lib/auth-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    const success = await updateLastAccessed(id, user.id)
    
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
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Не удалось обновить время доступа' },
      { status: 500 }
    )
  }
}