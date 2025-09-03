import { Redis } from '@upstash/redis'

// Initialize Redis client with environment variables
// These will be provided by Upstash when you create your database
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  DOCUMENTS_LIST: 3600,      // 1 hour for document lists
  DOCUMENT: 3600,             // 1 hour for individual documents
  RECENT_DOCUMENTS: 1800,     // 30 minutes for recent documents
  STARRED_DOCUMENTS: 3600,    // 1 hour for starred documents
  USER_DATA: 7200,            // 2 hours for user data
}

// Cache key generators for consistency
export const cacheKeys = {
  userDocuments: (userId: string) => `user:${userId}:documents`,
  document: (documentId: string | number) => `document:${documentId}`,
  recentDocuments: (userId: string) => `user:${userId}:recent`,
  starredDocuments: (userId: string) => `user:${userId}:starred`,
  documentAccess: (documentId: string | number, userId: string) => `document:${documentId}:user:${userId}:access`,
}

// Helper function to safely get cached data
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) {
    console.log('Redis not configured, skipping cache')
    return null
  }

  try {
    const data = await redis.get<T>(key)
    if (data) {
      console.log(`Cache hit for ${key}`)
      return data
    }
    console.log(`Cache miss for ${key}`)
    return null
  } catch (error) {
    console.error(`Error getting cached data for ${key}:`, error)
    return null
  }
}

// Helper function to safely set cached data
export async function setCached<T>(key: string, data: T, ttl: number = CACHE_TTL.DOCUMENTS_LIST): Promise<void> {
  if (!redis) {
    console.log('Redis not configured, skipping cache set')
    return
  }

  try {
    await redis.setex(key, ttl, JSON.stringify(data))
    console.log(`Cached data for ${key} with TTL ${ttl}s`)
  } catch (error) {
    console.error(`Error setting cached data for ${key}:`, error)
  }
}

// Helper function to safely delete cached data
export async function deleteCached(keys: string | string[]): Promise<void> {
  if (!redis) {
    console.log('Redis not configured, skipping cache delete')
    return
  }

  const keysArray = Array.isArray(keys) ? keys : [keys]
  
  try {
    for (const key of keysArray) {
      await redis.del(key)
      console.log(`Deleted cache for ${key}`)
    }
  } catch (error) {
    console.error(`Error deleting cached data:`, error)
  }
}

// Helper function to invalidate all caches for a user
export async function invalidateUserCaches(userId: string): Promise<void> {
  const keys = [
    cacheKeys.userDocuments(userId),
    cacheKeys.recentDocuments(userId),
    cacheKeys.starredDocuments(userId),
  ]
  await deleteCached(keys)
}

// Helper function to invalidate document-related caches
export async function invalidateDocumentCaches(documentId: string | number, userId: string): Promise<void> {
  const keys = [
    cacheKeys.document(documentId),
    cacheKeys.userDocuments(userId),
    cacheKeys.recentDocuments(userId),
    cacheKeys.documentAccess(documentId, userId),
  ]
  await deleteCached(keys)
}

export { redis }
