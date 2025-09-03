import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('=== DEBUG DOCUMENT DIRECT QUERY ===')
    console.log('Document ID:', id)
    
    // Query Supabase directly without any filters
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
    
    console.log('Raw Supabase response:', { data, error })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }
    
    return NextResponse.json({
      success: true,
      documents: data,
      count: data?.length || 0,
      debug: {
        id,
        query: `SELECT * FROM documents WHERE id = '${id}'`,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Debug query error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


