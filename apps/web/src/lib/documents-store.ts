// Document storage using Supabase
// Migrated from local storage to Supabase with RLS for user isolation

import { supabase } from './supabase'
import type { Database } from './supabase'

export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']

// Helper type for API responses
export interface DocumentWithMetadata extends Document {
  // Add any additional metadata if needed
}

/**
 * Get all non-deleted documents for the current user
 * RLS policies ensure users only see their own documents
 */
export async function getDocuments(userId: string): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      throw new Error('Failed to fetch documents')
    }

    return data || []
  } catch (error) {
    console.error('Error in getDocuments:', error)
    throw error
  }
}

/**
 * Get all documents (including deleted) for the current user
 * Used for admin operations or garbage collection
 */
export async function getAllDocuments(userId: string): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching all documents:', error)
      throw new Error('Failed to fetch all documents')
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllDocuments:', error)
    throw error
  }
}

/**
 * Get only deleted documents for the current user
 */
export async function getDeletedDocuments(userId: string): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (error) {
      console.error('Error fetching deleted documents:', error)
      throw new Error('Failed to fetch deleted documents')
    }

    return data || []
  } catch (error) {
    console.error('Error in getDeletedDocuments:', error)
    throw error
  }
}

/**
 * Find a non-deleted document by ID for the current user
 */
export async function findDocumentById(id: string, userId: string): Promise<Document | null> {
  try {
    console.log('=== DOCUMENTS STORE FIND ===')
    console.log('Looking for document ID:', id)
    console.log('User ID:', userId)
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Document not found (PGRST116)')
        return null
      }
      console.error('Error finding document:', error)
      throw new Error('Failed to find document')
    }

    console.log('Found document:', data.id, 'Title:', data.title)
    console.log('Found content length:', data.content?.length || 0)
    console.log('Found content preview:', data.content?.substring(0, 100) + '...')

    return data
  } catch (error) {
    console.error('Error in findDocumentById:', error)
    throw error
  }
}

/**
 * Find a document by ID (including deleted) for the current user
 */
export async function findDocumentByIdIncludeDeleted(id: string, userId: string): Promise<Document | null> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('Error finding document (include deleted):', error)
      throw new Error('Failed to find document')
    }

    return data
  } catch (error) {
    console.error('Error in findDocumentByIdIncludeDeleted:', error)
    throw error
  }
}

/**
 * Update a document for the current user
 */
export async function updateDocument(id: string, userId: string, updates: DocumentUpdate): Promise<Document | null> {
  try {
    console.log('=== DOCUMENTS STORE UPDATE ===')
    console.log('Document ID:', id)
    console.log('User ID:', userId)
    console.log('Updates:', { ...updates, content: updates.content?.substring(0, 100) + '...' })
    
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - document not found or not owned by user
        return null
      }
      console.error('Error updating document:', error)
      throw new Error('Failed to update document')
    }

    console.log('Document updated successfully:', data.id)
    console.log('Updated content length:', data.content?.length || 0)
    console.log('Updated content preview:', data.content?.substring(0, 100) + '...')

    return data
  } catch (error) {
    console.error('Error in updateDocument:', error)
    throw error
  }
}

/**
 * Soft delete a document (move to garbage)
 */
export async function deleteDocument(id: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) {
      console.error('Error deleting document:', error)
      throw new Error('Failed to delete document')
    }

    return true
  } catch (error) {
    console.error('Error in deleteDocument:', error)
    return false
  }
}

/**
 * Soft delete multiple documents
 */
export async function deleteDocuments(ids: string[], userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .in('id', ids)
      .is('deleted_at', null)
      .select('id')

    if (error) {
      console.error('Error deleting documents:', error)
      throw new Error('Failed to delete documents')
    }

    return data?.length || 0
  } catch (error) {
    console.error('Error in deleteDocuments:', error)
    return 0
  }
}

/**
 * Restore a soft-deleted document
 */
export async function restoreDocument(id: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)

    if (error) {
      console.error('Error restoring document:', error)
      throw new Error('Failed to restore document')
    }

    return true
  } catch (error) {
    console.error('Error in restoreDocument:', error)
    return false
  }
}

/**
 * Permanently delete a document (cannot be undone)
 */
export async function permanentlyDeleteDocument(id: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error permanently deleting document:', error)
      throw new Error('Failed to permanently delete document')
    }

    return true
  } catch (error) {
    console.error('Error in permanentlyDeleteDocument:', error)
    return false
  }
}

/**
 * Cleanup expired documents (permanently delete documents that have been in garbage for 7+ days)
 */
export async function cleanupExpiredDocuments(userId: string): Promise<number> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const { data, error } = await supabase
      .from('documents')
      .delete()
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)
      .lt('deleted_at', sevenDaysAgo.toISOString())
      .select('id')

    if (error) {
      console.error('Error cleaning up expired documents:', error)
      throw new Error('Failed to cleanup expired documents')
    }

    return data?.length || 0
  } catch (error) {
    console.error('Error in cleanupExpiredDocuments:', error)
    return 0
  }
}

/**
 * Cleanup expired documents for all users (permanently delete documents that have been in garbage for 7+ days)
 * This function is intended for system-wide cleanup operations like cron jobs
 */
export async function cleanupAllExpiredDocuments(): Promise<number> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const { data, error } = await supabase
      .from('documents')
      .delete()
      .not('deleted_at', 'is', null)
      .lt('deleted_at', sevenDaysAgo.toISOString())
      .select('id')

    if (error) {
      console.error('Error cleaning up all expired documents:', error)
      throw new Error('Failed to cleanup all expired documents')
    }

    return data?.length || 0
  } catch (error) {
    console.error('Error in cleanupAllExpiredDocuments:', error)
    return 0
  }
}

/**
 * Create a new document
 */
export async function createDocument(title: string, content: string, userId: string): Promise<Document> {
  try {
    console.log('=== DOCUMENTS STORE CREATE ===')
    console.log('Title:', title)
    console.log('Content length:', content?.length || 0)
    console.log('Content preview:', content?.substring(0, 100) + '...')
    console.log('User ID:', userId)
    
    const newDoc: DocumentInsert = {
      user_id: userId,
      title: title || "Untitled Document",
      content: content || "",
      starred: false,
      last_accessed: new Date().toISOString()
    }

    console.log('Document to insert:', { ...newDoc, content: newDoc.content?.substring(0, 50) + '...' })

    const { data, error } = await supabase
      .from('documents')
      .insert(newDoc)
      .select()
      .single()

    if (error) {
      console.error('Error creating document:', error)
      throw new Error('Failed to create document')
    }

    console.log('Document created successfully:', data.id)
    console.log('Saved content length:', data.content?.length || 0)
    console.log('Saved content preview:', data.content?.substring(0, 100) + '...')

    return data
  } catch (error) {
    console.error('Error in createDocument:', error)
    throw error
  }
}

/**
 * Toggle star status of a document
 */
export async function toggleStarDocument(id: string, userId: string): Promise<boolean> {
  try {
    // First get the current starred status
    const doc = await findDocumentById(id, userId)
    if (!doc) return false

    const { error } = await supabase
      .from('documents')
      .update({
        starred: !doc.starred,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error toggling star:', error)
      throw new Error('Failed to toggle star')
    }

    return true
  } catch (error) {
    console.error('Error in toggleStarDocument:', error)
    return false
  }
}

/**
 * Get starred documents for the current user
 */
export async function getStarredDocuments(userId: string): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .eq('starred', true)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching starred documents:', error)
      throw new Error('Failed to fetch starred documents')
    }

    return data || []
  } catch (error) {
    console.error('Error in getStarredDocuments:', error)
    throw error
  }
}

/**
 * Update last accessed timestamp for a document
 */
export async function updateLastAccessed(id: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        last_accessed: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating last accessed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateLastAccessed:', error)
    return false
  }
}

/**
 * Get recently accessed documents for the current user
 */
export async function getRecentDocuments(userId: string, limit: number = 10): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .not('last_accessed', 'is', null)
      .order('last_accessed', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent documents:', error)
      throw new Error('Failed to fetch recent documents')
    }

    return data || []
  } catch (error) {
    console.error('Error in getRecentDocuments:', error)
    throw error
  }
}