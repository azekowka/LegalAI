import { NextRequest, NextResponse } from 'next/server'
import { findDocumentById, updateDocument, deleteDocument } from '@/lib/documents-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params
  const id = parseInt(idParam)
  
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid document ID" }, { status: 400 })
  }
  
  const document = findDocumentById(id)
  
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }
  
  return NextResponse.json(document)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid document ID" }, { status: 400 })
    }
    
    const { title, content } = await request.json()
    
    const updatedDocument = updateDocument(id, { title, content })
    
    if (!updatedDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    
    return NextResponse.json(updatedDocument)
  } catch (error) {
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
  const { id: idParam } = await params
  const id = parseInt(idParam)
  
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid document ID" }, { status: 400 })
  }
  
  const deleted = deleteDocument(id)
  
  if (!deleted) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }
  
  return NextResponse.json({ message: "Document deleted successfully" })
}