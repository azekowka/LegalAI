import { NextRequest, NextResponse } from 'next/server'
import { getDocuments, createDocument, deleteDocuments } from '@/lib/documents-store'

export async function GET() {
  const documents = getDocuments()
  return NextResponse.json(documents)
}

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json()
    
    // Используем значения по умолчанию если поля пустые
    const documentTitle = title || "Untitled Document"
    const documentContent = content || ""
    
    const newDocument = createDocument(documentTitle, documentContent)
    
    return NextResponse.json(newDocument, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json()
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Document IDs array is required" },
        { status: 400 }
      )
    }
    
    const deletedCount = deleteDocuments(ids)
    
    return NextResponse.json({ 
      message: `${deletedCount} documents moved to garbage`,
      deletedCount 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete documents" },
      { status: 500 }
    )
  }
}