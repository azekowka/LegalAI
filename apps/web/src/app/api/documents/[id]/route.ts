import { NextRequest, NextResponse } from 'next/server'
import { findDocumentById, updateDocument, deleteDocument, updateLastAccessed, findDocumentByShareLinkId } from '@/lib/documents-store'
import { requireAuth } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user = null
  let document = null
  const { id } = await params
  const searchParams = request.nextUrl.searchParams
  const shareLinkId = searchParams.get('shareLinkId')

  try {
    // First, try to authenticate the user
    try {
      user = await requireAuth(request)
    } catch (authError) {
      console.log("Authentication skipped, attempting public access.", authError)
    }

    if (user) {
      console.log('Attempting to find document by ID and user ID...')
      console.log('Searching for document with ID:', id, 'for user ID:', user.id)
      document = await findDocumentById(id, user.id)
      console.log('Result of findDocumentById:', document ? 'Found' : 'Not Found')
    }

    if (!document && shareLinkId) {
      // If not found by authenticated user OR no user, and shareLinkId is present, try public access
      const publicDocument = await findDocumentByShareLinkId(shareLinkId)
      if (publicDocument && publicDocument.id === id) {
        document = publicDocument
      } else if (publicDocument && publicDocument.id !== id) {
        // Share link ID belongs to a different document
        return NextResponse.json({ error: "Invalid share link ID for this document" }, { status: 400 })
      }
    }

    console.log('=== DOCUMENT GET DEBUG ===')
    console.log('Document ID from URL:', id, 'Type:', typeof id)
    if (user) {
      console.log('User ID (authenticated):', user.id, 'Type:', typeof user.id)
    } else {
      console.log('No authenticated user for this request.')
    }
    
    if (!document) {
      // If document still not found (either private or public access failed)
      return NextResponse.json({ error: "Document not found or unauthorized" }, { status: 404 })
    }

    console.log('Found document:', document.id, 'Title:', document.title)
    console.log('Document content length:', document.content?.length || 0)
    console.log('Document content preview:', document.content?.substring(0, 100) + '...')
    
    // Update last accessed timestamp only if accessed by an authenticated user
    if (user) {
      await updateLastAccessed(id, user.id)
    }
    
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    // Generic error for unexpected issues
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    const { title, content } = await request.json()
    
    console.log('=== UPDATE DOCUMENT API ===')
    console.log('Document ID:', id)
    console.log('Title:', title)
    console.log('Content length:', content?.length || 0)
    console.log('Content preview:', content?.substring(0, 100) + '...')
    
    const updatedDocument = await updateDocument(id, user.id, { title, content })
    
    console.log('Updated document:', updatedDocument?.id, 'Title:', updatedDocument?.title)
    console.log('Updated content length:', updatedDocument?.content?.length || 0)
    
    if (!updatedDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    
    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error('Error updating document:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    
    const deleted = await deleteDocument(id, user.id)
    
    if (!deleted) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    
    return NextResponse.json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error('Error deleting document:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    )
  }
}