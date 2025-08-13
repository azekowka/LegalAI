// Общее хранилище данных документов
// to-do: migrate to supabase

export interface Document {
  id: number
  user_id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  deleted_at?: string
  starred?: boolean
  last_accessed?: string
}

// Глобальное хранилище для демонстрации
declare global {
  var documents: Document[] | undefined
  var nextDocumentId: number | undefined
}

export const getDocuments = (): Document[] => {
  if (typeof global !== 'undefined') {
    if (!global.documents) {
      global.documents = [
        {
          id: 1,
          user_id: 1,
          title: "Пример документа",
          content: "Это пример содержимого документа.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
    return global.documents.filter(doc => !doc.deleted_at)
  }
  return []
}

export const getAllDocuments = (): Document[] => {
  if (typeof global !== 'undefined') {
    if (!global.documents) {
      global.documents = [
        {
          id: 1,
          user_id: 1,
          title: "Пример документа",
          content: "Это пример содержимого документа.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
    return global.documents
  }
  return []
}

export const getDeletedDocuments = (): Document[] => {
  const allDocs = getAllDocuments()
  return allDocs.filter(doc => doc.deleted_at)
}

export const setDocuments = (docs: Document[]) => {
  if (typeof global !== 'undefined') {
    global.documents = docs
  }
}

export const getNextId = (): number => {
  if (typeof global !== 'undefined') {
    if (!global.nextDocumentId) {
      global.nextDocumentId = 2
    }
    return global.nextDocumentId++
  }
  return Date.now() // fallback
}

export const findDocumentById = (id: number): Document | undefined => {
  const documents = getDocuments()
  return documents.find(doc => doc.id === id)
}

export const findDocumentByIdIncludeDeleted = (id: number): Document | undefined => {
  const allDocs = getAllDocuments()
  return allDocs.find(doc => doc.id === id)
}

export const updateDocument = (id: number, updates: Partial<Omit<Document, 'id' | 'created_at'>>): Document | null => {
  const documents = getDocuments()
  const index = documents.findIndex(doc => doc.id === id)
  
  if (index === -1) {
    return null
  }
  
  documents[index] = {
    ...documents[index],
    ...updates,
    updated_at: new Date().toISOString()
  }
  
  setDocuments(documents)
  return documents[index]
}

export const deleteDocument = (id: number): boolean => {
  const allDocs = getAllDocuments()
  const index = allDocs.findIndex(doc => doc.id === id)
  
  if (index === -1) {
    return false
  }
  
  allDocs[index].deleted_at = new Date().toISOString()
  allDocs[index].updated_at = new Date().toISOString()
  setDocuments(allDocs)
  return true
}

export const deleteDocuments = (ids: number[]): number => {
  const allDocs = getAllDocuments()
  let deletedCount = 0
  
  ids.forEach(id => {
    const index = allDocs.findIndex(doc => doc.id === id && !doc.deleted_at)
    if (index !== -1) {
      allDocs[index].deleted_at = new Date().toISOString()
      allDocs[index].updated_at = new Date().toISOString()
      deletedCount++
    }
  })
  
  setDocuments(allDocs)
  return deletedCount
}

export const restoreDocument = (id: number): boolean => {
  const allDocs = getAllDocuments()
  const index = allDocs.findIndex(doc => doc.id === id && doc.deleted_at)
  
  if (index === -1) {
    return false
  }
  
  delete allDocs[index].deleted_at
  allDocs[index].updated_at = new Date().toISOString()
  setDocuments(allDocs)
  return true
}

export const permanentlyDeleteDocument = (id: number): boolean => {
  const allDocs = getAllDocuments()
  const index = allDocs.findIndex(doc => doc.id === id)
  
  if (index === -1) {
    return false
  }
  
  allDocs.splice(index, 1)
  setDocuments(allDocs)
  return true
}

export const cleanupExpiredDocuments = (): number => {
  const allDocs = getAllDocuments()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  let cleanedCount = 0
  
  const remainingDocs = allDocs.filter(doc => {
    if (doc.deleted_at && new Date(doc.deleted_at) < sevenDaysAgo) {
      cleanedCount++
      return false
    }
    return true
  })
  
  setDocuments(remainingDocs)
  return cleanedCount
}

export const createDocument = (title: string, content: string, userId: number = 1): Document => {
  const documents = getDocuments()
  const newDoc: Document = {
    id: getNextId(),
    user_id: userId,
    title,
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    starred: false,
    last_accessed: new Date().toISOString()
  }
  
  documents.push(newDoc)
  setDocuments(documents)
  return newDoc
}

// Функции для работы с избранными документами
export const toggleStarDocument = (id: number): boolean => {
  const documents = getAllDocuments()
  const docIndex = documents.findIndex(doc => doc.id === id)
  
  if (docIndex === -1) return false
  
  documents[docIndex].starred = !documents[docIndex].starred
  documents[docIndex].updated_at = new Date().toISOString()
  
  setDocuments(documents)
  return true
}

export const getStarredDocuments = (): Document[] => {
  return getDocuments().filter(doc => doc.starred === true)
}

// Функции для работы с недавними документами
export const updateLastAccessed = (id: number): boolean => {
  const documents = getAllDocuments()
  const docIndex = documents.findIndex(doc => doc.id === id)
  
  if (docIndex === -1) return false
  
  documents[docIndex].last_accessed = new Date().toISOString()
  
  setDocuments(documents)
  return true
}

export const getRecentDocuments = (limit: number = 10): Document[] => {
  return getDocuments()
    .filter(doc => doc.last_accessed)
    .sort((a, b) => {
      const dateA = new Date(a.last_accessed!).getTime()
      const dateB = new Date(b.last_accessed!).getTime()
      return dateB - dateA // Сортировка по убыванию (новые сначала)
    })
    .slice(0, limit)
}