import { NextResponse } from 'next/server'
import { cleanupExpiredDocuments } from '@/lib/documents-store'

// This endpoint can be called by a cron job or scheduled task
// to automatically clean up documents that have been in garbage for more than 7 days
export async function POST() {
  try {
    const cleanedCount = cleanupExpiredDocuments()
    
    console.log(`Cleanup completed: ${cleanedCount} expired documents permanently deleted`)
    
    return NextResponse.json({
      success: true,
      message: `${cleanedCount} expired documents permanently deleted`,
      cleanedCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cleanup failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup expired documents',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Allow GET for health check
export async function GET() {
  return NextResponse.json({
    message: 'Cleanup service is running',
    timestamp: new Date().toISOString()
  })
}