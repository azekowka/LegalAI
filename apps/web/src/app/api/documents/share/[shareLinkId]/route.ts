import { NextRequest, NextResponse } from 'next/server'
import { findDocumentByShareLinkId } from '@/lib/documents-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareLinkId: string }> }
) {
  try {
    const { shareLinkId } = await params // Await params here

    console.log('=== PUBLIC DOCUMENT GET DEBUG ===')
    console.log('Share Link ID from URL:', shareLinkId)

    const document = await findDocumentByShareLinkId(shareLinkId)

    if (!document) {
      return NextResponse.json({ error: "Document not found or not public" }, { status: 404 })
    }

    // Only return if document is public
    if (!document.is_public) {
      return NextResponse.json({ error: "Document is not public" }, { status: 403 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching public document:', error)
    return NextResponse.json(
      { error: "Failed to fetch public document" },
      { status: 500 }
    )
  }
}
