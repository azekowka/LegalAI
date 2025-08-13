import { NextRequest, NextResponse } from 'next/server'
import { getDeletedDocuments, restoreDocument, permanentlyDeleteDocument, cleanupExpiredDocuments } from '@/lib/documents-store'

export async function GET() {
  try {
    // Clean up expired documents first
    cleanupExpiredDocuments()
    
    const deletedDocuments = getDeletedDocuments()
    return NextResponse.json(deletedDocuments)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch deleted documents" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, id } = await request.json()
    
    if (!action || !id) {
      return NextResponse.json(
        { error: "Action and document ID are required" },
        { status: 400 }
      )
    }
    
    if (action === 'restore') {
      const restored = restoreDocument(id)
      if (!restored) {
        return NextResponse.json(
          { error: "Document not found or cannot be restored" },
          { status: 404 }
        )
      }
      return NextResponse.json({ message: "Document restored successfully" })
    }
    
    if (action === 'permanent_delete') {
      const deleted = permanentlyDeleteDocument(id)
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
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const cleanedCount = cleanupExpiredDocuments()
    return NextResponse.json({ 
      message: `${cleanedCount} expired documents permanently deleted`,
      cleanedCount 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to cleanup expired documents" },
      { status: 500 }
    )
  }
}