"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, RotateCcw, Loader2, AlertTriangle } from "lucide-react"
import { type Document } from "@/lib/api"

export default function GarbagePage() {
  const [deletedDocuments, setDeletedDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const loadDeletedDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/documents/garbage')
      if (response.ok) {
        const documents = await response.json()
        setDeletedDocuments(documents)
      } else {
        console.error('Failed to load deleted documents')
      }
    } catch (error) {
      console.error('Error loading deleted documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDeletedDocuments()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysUntilDeletion = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt)
    const expiryDate = new Date(deletedDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    const now = new Date()
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    return Math.max(0, daysLeft)
  }

  const handleRestore = async (docId: number, docTitle: string) => {
    const confirmed = confirm(`Восстановить документ "${docTitle}"?`)
    if (!confirmed) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/documents/garbage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'restore', id: docId }),
      })

      if (response.ok) {
        alert('Документ восстановлен')
        loadDeletedDocuments()
      } else {
        const error = await response.json()
        alert(`Ошибка восстановления: ${error.error}`)
      }
    } catch (error) {
      console.error('Error restoring document:', error)
      alert('Произошла ошибка при восстановлении документа')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePermanentDelete = async (docId: number, docTitle: string) => {
    const confirmed = confirm(`ВНИМАНИЕ! Вы собираетесь навсегда удалить документ "${docTitle}". Это действие нельзя отменить. Продолжить?`)
    if (!confirmed) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/documents/garbage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'permanent_delete', id: docId }),
      })

      if (response.ok) {
        alert('Документ навсегда удален')
        loadDeletedDocuments()
      } else {
        const error = await response.json()
        alert(`Ошибка удаления: ${error.error}`)
      }
    } catch (error) {
      console.error('Error permanently deleting document:', error)
      alert('Произошла ошибка при удалении документа')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCleanupExpired = async () => {
    const confirmed = confirm('Удалить все просроченные документы навсегда? Это действие нельзя отменить.')
    if (!confirmed) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/documents/garbage', {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        alert(`${result.cleanedCount} просроченных документов удалено навсегда`)
        loadDeletedDocuments()
      } else {
        const error = await response.json()
        alert(`Ошибка очистки: ${error.error}`)
      }
    } catch (error) {
      console.error('Error cleaning up expired documents:', error)
      alert('Произошла ошибка при очистке просроченных документов')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">
                Дэшборд
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Корзина</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
        
      <div className="flex flex-1 flex-col gap-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Корзина</h2>
            <p className="text-muted-foreground">
              Удаленные документы хранятся 7 дней, затем удаляются навсегда
            </p>
          </div>
          {deletedDocuments.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleCleanupExpired}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Очистить просроченные
            </Button>
          )}
        </div>
        
        {/* Documents Section */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : deletedDocuments.length === 0 ? (
          <div className="text-center py-12">
            <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Корзина пуста</h3>
            <p className="mt-1 text-sm text-gray-500">Удаленные документы будут отображаться здесь.</p>
            <div className="mt-6">
              <Link href="/dashboard">
                <Button variant="outline">
                  Вернуться к документам
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deletedDocuments.map((doc) => {
              const daysLeft = getDaysUntilDeletion(doc.deleted_at!)
              const isExpiringSoon = daysLeft <= 1
              
              return (
                <Card key={doc.id} className={`${isExpiringSoon ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-700">
                          {doc.title}
                        </CardTitle>
                        <CardDescription>
                          Удалено {formatDate(doc.deleted_at!)}
                        </CardDescription>
                        <div className={`mt-2 text-xs font-medium ${
                          isExpiringSoon ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {isExpiringSoon && <AlertTriangle className="inline h-3 w-3 mr-1" />}
                          {daysLeft === 0 ? 'Удаляется сегодня' : `${daysLeft} дн. до удаления`}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(doc.id, doc.title)}
                        disabled={isProcessing}
                        className="flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Восстановить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handlePermanentDelete(doc.id, doc.title)}
                        disabled={isProcessing}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Удалить навсегда
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {doc.content ? (
                        typeof doc.content === 'string' && doc.content.startsWith('[') ? 
                          'Форматированный документ' : 
                          doc.content.substring(0, 100) + (doc.content.length > 100 ? '...' : '')
                      ) : (
                        'Пустой документ'
                      )}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}