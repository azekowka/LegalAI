"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, Plus, Calendar, User, Loader2, Trash2, CheckSquare, Square, MoreVertical, Download, Edit, Copy, Flame } from "lucide-react"
import { apiClient, type Document, type User as UserType } from "@/lib/api"

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const router = useRouter()

  const loadData = async () => {
    setIsLoading(true)

    // Load user data
    const userResponse = await apiClient.getMe()
    if (userResponse.error) {
      // Продолжаем работу даже если пользователь не аутентифицирован
      console.log("User not authenticated, continuing as guest")
    } else {
      setUser(userResponse.data as UserType)
    }

    // Load documents
    const docsResponse = await apiClient.getDocuments()
    if (docsResponse.data) {
      setDocuments(docsResponse.data)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateDocument = async () => {
    try {
      console.log("Creating document...")
      const response = await apiClient.createDocument("Untitled Document", "")
      console.log("Create document response:", response)
      
      if (response.data) {
        console.log("Navigating to editor:", `/dashboard/editor/${response.data.id}`)
        router.push(`/dashboard/editor/${response.data.id}`)
      } else if (response.error) {
        console.error("Error creating document:", response.error)
        alert(`Ошибка создания документа: ${response.error}`)
      }
    } catch (error) {
      console.error("Exception creating document:", error)
      alert("Произошла ошибка при создании документа")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const toggleDocumentSelection = (docId: number) => {
    const newSelection = new Set(selectedDocuments)
    if (newSelection.has(docId)) {
      newSelection.delete(docId)
    } else {
      newSelection.add(docId)
    }
    setSelectedDocuments(newSelection)
  }

  const selectAllDocuments = () => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set())
    } else {
      setSelectedDocuments(new Set(documents.map(doc => doc.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedDocuments.size === 0) return
    
    const confirmed = confirm(`Вы уверены, что хотите удалить ${selectedDocuments.size} документ(ов)? Они будут перемещены в корзину.`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: Array.from(selectedDocuments) }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`${result.deletedCount} документ(ов) перемещено в корзину`)
        setSelectedDocuments(new Set())
        loadData() // Reload documents
      } else {
        const error = await response.json()
        alert(`Ошибка удаления: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting documents:', error)
      alert('Произошла ошибка при удалении документов')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSingle = async (docId: number, docTitle: string) => {
    const confirmed = confirm(`Вы уверены, что хотите удалить документ "${docTitle}"? Он будет перемещен в корзину.`)
    if (!confirmed) return

    try {
      const response = await fetch('/api/documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [docId] }),
      })

      if (response.ok) {
        alert('Документ перемещен в корзину')
        loadData() // Reload documents
      } else {
        const error = await response.json()
        alert(`Ошибка удаления: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Произошла ошибка при удалении документа')
    }
  }

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode)
    if (isDeleteMode) {
      // Выходим из режима удаления - сбрасываем выбор
      setSelectedDocuments(new Set())
    }
  }

  const handleRenameDocument = async (docId: number, currentTitle: string) => {
    const newTitle = prompt('Введите новое название документа:', currentTitle)
    if (!newTitle || newTitle === currentTitle) return

    try {
      const response = await apiClient.updateDocument(docId, newTitle)
      if (response.data) {
        alert('Документ переименован')
        loadData() // Reload documents
      } else {
        alert(`Ошибка переименования: ${response.error}`)
      }
    } catch (error) {
      console.error('Error renaming document:', error)
      alert('Произошла ошибка при переименовании документа')
    }
  }

  const handleCopyDocument = async (docId: number, docTitle: string) => {
    try {
      const originalDoc = documents.find(doc => doc.id === docId)
      if (!originalDoc) {
        alert('Документ не найден')
        return
      }

      const response = await apiClient.createDocument(
        `Копия ${docTitle}`,
        originalDoc.content
      )
      
      if (response.data) {
        alert('Копия документа создана')
        loadData() // Reload documents
      } else {
        alert(`Ошибка создания копии: ${response.error}`)
      }
    } catch (error) {
      console.error('Error copying document:', error)
      alert('Произошла ошибка при создании копии документа')
    }
  }

  const handleDownloadDocument = async (docId: number, docTitle: string) => {
    try {
      const doc = documents.find(d => d.id === docId)
      if (!doc) {
        alert('Документ не найден')
        return
      }

      // Create a blob with the document content
      const content = typeof doc.content === 'string' ? doc.content : JSON.stringify(doc.content, null, 2)
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${docTitle}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert('Документ скачан')
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Произошла ошибка при скачивании документа')
    }
  }

  const handleToggleStar = async (docId: number) => {
    try {
      const response = await apiClient.toggleStarDocument(docId)
      if (response.data) {
        // Обновляем статус избранного в локальном состоянии
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { ...doc, starred: response.data && typeof response.data === 'object' && 'starred' in response.data ? Boolean(response.data.starred) : false }
            : doc
        ))
      } else {
        alert(`Ошибка: ${response.error}`)
      }
    } catch (error) {
      console.error('Error toggling star:', error)
      alert('Произошла ошибка при изменении статуса избранного')
    }
  }

  const handleDocumentAccess = async (docId: number) => {
    // Обновляем время последнего доступа при открытии документа
    try {
      await apiClient.updateLastAccessed(docId)
    } catch (error) {
      console.error('Error updating last accessed:', error)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Дэшборд
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Документы</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Welcome Section */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всего документов
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Пользователь
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.name || "Гость"}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Последняя активность
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documents.length > 0 ? formatDate(documents[0].updated_at) : "Нет данных"}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Documents Section */}
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Ваши документы</h2>
              <div className="flex items-center gap-2">
                {documents.length > 0 && isDeleteMode && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllDocuments}
                      className="flex items-center gap-2"
                    >
                      {selectedDocuments.size === documents.length ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                      {selectedDocuments.size === documents.length ? 'Снять выделение' : 'Выбрать все'}
                    </Button>
                    {selectedDocuments.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelected}
                        disabled={isDeleting}
                        className="flex items-center gap-2"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Удалить ({selectedDocuments.size})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleDeleteMode}
                      className="flex items-center gap-2"
                    >
                      Отмена
                    </Button>
                  </>
                )}
                {documents.length > 0 && !isDeleteMode && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={toggleDeleteMode}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Удалить
                  </Button>
                )}
                <Button onClick={handleCreateDocument}>
                  <Plus className="mr-2 h-4 w-4" />
                  Создать документ
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Нет документов</h3>
                    <p className="mt-1 text-sm text-gray-500">Начните с создания нового документа.</p>
                    <div className="mt-6">
                      <Button onClick={handleCreateDocument}>
                        <Plus className="mr-2 h-4 w-4" />
                        Создать документ
                      </Button>
                    </div>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors ${
                        isDeleteMode && selectedDocuments.has(doc.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                      }`}
                    >
                      {/* Checkbox for delete mode */}
                      {isDeleteMode && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            toggleDocumentSelection(doc.id)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {selectedDocuments.has(doc.id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      )}

                      {/* Document preview/thumbnail */}
                      <div className="w-16 h-12 bg-blue-100 rounded border flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>

                      {/* Document info */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/dashboard/editor/${doc.id}`} 
                          className="block"
                          onClick={() => handleDocumentAccess(doc.id)}
                        >
                          <h3 className="font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
                            {doc.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {doc.content ? (
                              typeof doc.content === 'string' && doc.content.startsWith('[') ? 
                                'Форматированный документ' : 
                                doc.content.substring(0, 150) + (doc.content.length > 150 ? '...' : '')
                            ) : (
                              'Пустой документ'
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Обновлено {formatDate(doc.updated_at)}
                          </p>
                        </Link>
                      </div>

                      {/* Actions menu */}
                      <div className="flex items-center gap-2">
                        {isDeleteMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              handleDeleteSingle(doc.id, doc.title)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {!isDeleteMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              handleToggleStar(doc.id)
                            }}
                            className={doc.starred ? "text-orange-500 hover:text-orange-600" : "text-gray-400 hover:text-orange-500"}
                          >
                            <Flame className={`h-4 w-4 ${doc.starred ? 'fill-current' : ''}`} />
                          </Button>
                        )}
                        
                        {!isDeleteMode && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleRenameDocument(doc.id, doc.title)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Переименовать
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCopyDocument(doc.id, doc.title)}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Создать копию
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadDocument(doc.id, doc.title)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Скачать
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteSingle(doc.id, doc.title)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))
                )}
               </div>
             )}
           </div>
         </div>
     </>
   )
}
