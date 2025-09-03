import { NextRequest, NextResponse } from 'next/server'
import { getDocuments, createDocument, deleteDocuments } from '@/lib/documents-store'
import { requireAuth } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const documents = await getDocuments(user.id)
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { title, content } = await request.json()
    
    console.log('=== CREATE DOCUMENT API ===')
    console.log('Title:', title)
    console.log('Content length:', content?.length || 0)
    console.log('Content preview:', content?.substring(0, 100) + '...')
    
    // Используем значения по умолчанию если поля пустые
    const documentTitle = title || "Untitled Document"
    const documentContent = content || ""
    
    const newDocument = await createDocument(documentTitle, documentContent, user.id)
    
    console.log('Created document:', newDocument.id, 'Title:', newDocument.title)
    console.log('Saved content length:', newDocument.content?.length || 0)
    
    return NextResponse.json(newDocument, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { ids } = await request.json()
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Document IDs array is required" },
        { status: 400 }
      )
    }
    
    const deletedCount = await deleteDocuments(ids, user.id)
    
    return NextResponse.json({ 
      message: `${deletedCount} documents moved to garbage`,
      deletedCount 
    })
  } catch (error) {
    console.error('Error deleting documents:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Failed to delete documents" },
      { status: 500 }
    )
  }
}