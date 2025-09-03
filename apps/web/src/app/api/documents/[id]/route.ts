import { NextRequest, NextResponse } from 'next/server'
import { findDocumentById, updateDocument, deleteDocument, updateLastAccessed } from '@/lib/documents-store'
import { requireAuth } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    
    console.log('=== DOCUMENT GET DEBUG ===')
    console.log('Document ID from URL:', id, 'Type:', typeof id)
    console.log('User ID:', user.id, 'Type:', typeof user.id)
    
    const document = await findDocumentById(id, user.id)
    
    console.log('Found document:', document?.id, 'Title:', document?.title)
    console.log('Document content length:', document?.content?.length || 0)
    console.log('Document content preview:', document?.content?.substring(0, 100) + '...')
    
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    
    // Update last accessed timestamp
    await updateLastAccessed(id, user.id)
    
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
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