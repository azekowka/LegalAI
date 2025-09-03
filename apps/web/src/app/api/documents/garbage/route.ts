import { NextRequest, NextResponse } from 'next/server'
import { getDeletedDocuments, restoreDocument, permanentlyDeleteDocument, cleanupExpiredDocuments } from '@/lib/documents-store'
import { requireAuth } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Clean up expired documents first
    await cleanupExpiredDocuments(user.id)
    
    const deletedDocuments = await getDeletedDocuments(user.id)
    return NextResponse.json(deletedDocuments)
  } catch (error) {
    console.error('Error fetching deleted documents:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Failed to fetch deleted documents" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { action, id } = await request.json()
    
    if (!action || !id) {
      return NextResponse.json(
        { error: "Action and document ID are required" },
        { status: 400 }
      )
    }
    
    if (action === 'restore') {
      const restored = await restoreDocument(id, user.id)
      if (!restored) {
        return NextResponse.json(
          { error: "Document not found or cannot be restored" },
          { status: 404 }
        )
      }
      return NextResponse.json({ message: "Document restored successfully" })
    }
    
    if (action === 'permanent_delete') {
      const deleted = await permanentlyDeleteDocument(id, user.id)
      if (!deleted) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        )
      }
      return NextResponse.json({ message: "Document permanently deleted" })
    }
    
    return NextResponse.json(
      { error: "Invalid action. Use 'restore' or 'permanent_delete'" },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing garbage request:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const cleanedCount = await cleanupExpiredDocuments(user.id)
    return NextResponse.json({ 
      message: `${cleanedCount} expired documents permanently deleted`,
      cleanedCount 
    })
  } catch (error) {
    console.error('Error cleaning up expired documents:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Failed to cleanup expired documents" },
      { status: 500 }
    )
  }
}