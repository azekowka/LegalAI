import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { findDocumentById, updateDocumentShareStatus } from '@/lib/documents-store'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params // Await params here
    const { isPublic } = await request.json()

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json({ error: "Invalid isPublic value" }, { status: 400 })
    }

    const document = await findDocumentById(id, user.id)

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    let shareLinkId = document.share_link_id
    if (!shareLinkId) {
      shareLinkId = uuidv4()
    }

    await updateDocumentShareStatus(id, user.id, shareLinkId, isPublic)

    const shareUrl = `${request.nextUrl.origin}/documents/share/${shareLinkId}`

    return NextResponse.json({ shareUrl, isPublic }, { status: 200 })
  } catch (error) {
    console.error('Error generating share link:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Failed to generate share link" },
      { status: 500 }
    )
  }
}
