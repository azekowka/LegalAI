'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient, type Document } from '@/lib/api'
import { Clock, FileText, Calendar, MoreVertical, Edit, Copy, Download, Trash2, Flame } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function RecentPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string } | null>(null)

  const loadRecentDocuments = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getRecentDocuments(20) // Загружаем больше недавних документов
      if (response.data) {
        setDocuments(response.data.documents || [])
      } else {
        console.error('Error loading recent documents:', response.error)
      }
    } catch (error) {
      console.error('Error loading recent documents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecentDocuments()
  }, [])

  const handleToggleStar = async (docId: string) => {
    try {
      const response = await apiClient.toggleStarDocument(docId.toString())
      if (response.data) {
        // Обновляем статус избранного в локальном состоянии
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { ...doc, starred: response.data?.starred || false }
            : doc
        ))
      } else {
        toast.error(`Ошибка: ${response.error}`)
      }
    } catch (error) {
      console.error('Error toggling star:', error)
      toast.error('Произошла ошибка при изменении статуса избранного')
    }
  }

  const handleDeleteSingle = async (docId: string, docTitle: string) => {
    setDocumentToDelete({ id: docId, title: docTitle })
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!documentToDelete) return

    try {
      const response = await apiClient.deleteDocument(documentToDelete.id.toString())
      if (response.data) {
        toast.success('Документ перемещен в корзину')
        loadRecentDocuments() // Перезагружаем список
      } else {
        toast.error(`Ошибка удаления: ${response.error}`)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Произошла ошибка при удалении документа')
    } finally {
      setDocumentToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  const handleCopyDocument = async (docId: string, docTitle: string) => {
    try {
      const originalDoc = documents.find(doc => doc.id === docId)
      if (!originalDoc) {
        toast.error('Документ не найден')
        return
      }

      const response = await apiClient.createDocument(
        `Копия ${docTitle}`,
        originalDoc.content || ""
      )
      
      if (response.data) {
        toast.success('Копия документа создана')
      } else {
        toast.error(`Ошибка создания копии: ${response.error}`)
      }
    } catch (error) {
      console.error('Error copying document:', error)
      toast.error('Произошла ошибка при создании копии документа')
    }
  }

  const handleDownloadDocument = async (docId: string, docTitle: string) => {
    try {
      const doc = documents.find(d => d.id === docId)
      if (!doc) {
        toast.error('Документ не найден')
        return
      }

      const content = typeof doc.content === 'string' ? doc.content : JSON.stringify(doc.content, null, 2)
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${docTitle}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Документ скачан')
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Произошла ошибка при скачивании документа')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'только что'
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} ч назад`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} дн назад`
    
    return formatDate(dateString)
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Недавние документы</h1>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          <p className="ml-2 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-2">
        <Clock className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Недавние документы</h1>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Нет недавних документов</h3>
          <p className="text-muted-foreground mb-4">Откройте документы, чтобы они появились в этом списке.</p>
          <Link href="/dashboard">
            <Button>Перейти к документам</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors bg-card"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {doc.last_accessed ? getTimeAgo(doc.last_accessed) : 'Недавно'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Обновлен {formatDate(doc.updated_at || "")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {typeof doc.content === 'string' 
                      ? doc.content.substring(0, 150) + (doc.content.length > 150 ? '...' : '')
                      : 'Документ без содержимого'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStar(doc.id)}
                  className={doc.starred ? "text-orange-500 hover:text-orange-600" : "text-muted-foreground hover:text-orange-500"}
                >
                  <Flame className={`h-4 w-4 ${doc.starred ? 'fill-current' : ''}`} />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/editor/${doc.id}`} className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Открыть
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCopyDocument(doc.id, doc.title || "")}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Создать копию
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDownloadDocument(doc.id, doc.title || "")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Скачать
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => handleDeleteSingle(doc.id, doc.title || "")}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Переместить в корзину
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Переместить документ в корзину?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите переместить документ &quot;{documentToDelete?.title}&quot; в корзину?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Переместить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}