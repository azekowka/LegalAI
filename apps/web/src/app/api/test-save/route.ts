import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json()
    
    console.log('=== TEST SAVE ===')
    console.log('Title:', title)
    console.log('Content:', content)
    
    // Insert directly into Supabase
    const testDoc = {
      user_id: 'test-user-123',
      title: title || 'Test Document',
      content: content || 'Test content',
      starred: false,
      last_accessed: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('documents')
      .insert(testDoc)
      .select()
      .single()
    
    console.log('Insert result:', { data, error })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }
    
    // Now try to read it back
    const { data: readData, error: readError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', data.id)
      .single()
    
    console.log('Read back result:', { readData, readError })
    
    return NextResponse.json({
      success: true,
      inserted: data,
      readBack: readData,
      contentMatch: data.content === readData?.content
    })
    
  } catch (error) {
    console.error('Test save error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


