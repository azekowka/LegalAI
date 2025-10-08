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
import { useAuthSession } from "@/components/auth-provider"
import { DocumentCreationModal } from "@/components/document-creation-modal";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const router = useRouter()
  const { user } = useAuthSession()
  const { toast } = useToast()

  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string } | null>(null)

  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [documentToRename, setDocumentToRename] = useState<{ id: string; currentTitle: string } | null>(null)
  const [newTitleInput, setNewTitleInput] = useState("")

  const loadData = async () => {
    setIsLoading(true)

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
        toast.error(`Ошибка создания документа: ${response.error}`)
      }
    } catch (error) {
      console.error("Exception creating document:", error)
      toast.error("Произошла ошибка при создании документа")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const toggleDocumentSelection = (docId: string) => {
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

    setShowBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
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
        toast.success(`${result.deletedCount} документ(ов) перемещено в корзину`)
        setSelectedDocuments(new Set())
        loadData() // Reload documents
      } else {
        const error = await response.json()
        toast.error(`Ошибка удаления: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting documents:', error)
      toast.error('Произошла ошибка при удалении документов')
    } finally {
      setIsDeleting(false)
      setShowBulkDeleteConfirm(false)
    }
  }

  const handleDeleteSingle = async (docId: string, docTitle: string) => {
    setDocumentToDelete({ id: docId, title: docTitle })
    setShowSingleDeleteConfirm(true)
  }

  const confirmSingleDelete = async () => {
    if (!documentToDelete) return

    try {
      const response = await fetch('/api/documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [documentToDelete.id] }),
      })

      if (response.ok) {
        toast.success('Документ перемещен в корзину')
        loadData() // Reload documents
      } else {
        const error = await response.json()
        toast.error(`Ошибка удаления: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Произошла ошибка при удалении документа')
    } finally {
      setDocumentToDelete(null)
      setShowSingleDeleteConfirm(false)
    }
  }

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode)
    if (isDeleteMode) {
      // Выходим из режима удаления - сбрасываем выбор
      setSelectedDocuments(new Set())
    }
  }

  const handleRenameDocument = async (docId: string, currentTitle: string) => {
    setDocumentToRename({ id: docId, currentTitle: currentTitle })
    setNewTitleInput(currentTitle) // Initialize input with current title
    setShowRenameDialog(true)
  }

  const confirmRename = async () => {
    if (!documentToRename || !newTitleInput || newTitleInput === documentToRename.currentTitle) {
      setShowRenameDialog(false)
      return
    }

    try {
      const response = await apiClient.updateDocument(documentToRename.id.toString(), newTitleInput)
      if (response.data) {
        toast.success('Документ переименован')
        loadData() // Reload documents
      } else {
        toast.error(`Ошибка переименования: ${response.error}`)
      }
    } catch (error) {
      console.error('Error renaming document:', error)
      toast.error('Произошла ошибка при переименовании документа')
    } finally {
      setDocumentToRename(null)
      setNewTitleInput("")
      setShowRenameDialog(false)
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
        loadData() // Reload documents
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
      
      toast.success('Документ скачан')
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Произошла ошибка при скачивании документа')
    }
  }

  const handleToggleStar = async (docId: string) => {
    try {
      const response = await apiClient.toggleStarDocument(docId.toString())
      if (response.data) {
        // Обновляем статус избранного в локальном состоянии
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { ...doc, starred: response.data && typeof response.data === 'object' && 'starred' in response.data ? Boolean(response.data.starred) : false }
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

  const handleDocumentAccess = async (docId: string) => {
    // Обновляем время последнего доступа при открытии документа
    try {
      await apiClient.updateLastAccessed(docId.toString())
    } catch (error) {
      console.error('Error updating last accessed:', error)
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
              <BreadcrumbPage>Документы</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
        
      <div className="flex flex-1 flex-col gap-4">
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
              <div className="text-2xl font-bold">{user?.name || "Пользователь"}</div>
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
                {documents.length > 0 ? formatDate(documents[0].updated_at || "") : "Нет данных"}
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
              <Button onClick={() => setIsDocumentModalOpen(true)}>
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
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">Нет документов</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Начните с создания нового документа.</p>
                  <div className="mt-6">
                    <Button onClick={() => setIsDocumentModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Создать документ
                    </Button>
                  </div>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors ${
                      isDeleteMode && selectedDocuments.has(doc.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : 'bg-card'
                    }`}
                  >
                    {/* Checkbox for delete mode */}
                    {isDeleteMode && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          toggleDocumentSelection(doc.id)
                        }}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {selectedDocuments.has(doc.id) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    )}

                    {/* Document preview/thumbnail */}
                    <div className="w-16 h-12 bg-blue-100 dark:bg-blue-900/30 rounded border flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Document info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/dashboard/editor/${doc.id}`} 
                        className="block"
                        onClick={() => handleDocumentAccess(doc.id)}
                      >
                        <h3 className="font-medium text-foreground truncate hover:text-blue-600 transition-colors">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {doc.content ? (
                            typeof doc.content === 'string' && doc.content.startsWith('[') ? 
                              'Форматированный документ' : 
                              doc.content.substring(0, 150) + (doc.content.length > 150 ? '...' : '')
                          ) : (
                            'Пустой документ'
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Обновлено {formatDate(doc.updated_at || "")}
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
                            handleDeleteSingle(doc.id, doc.title || "")
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
                          className={doc.starred ? "text-orange-500 hover:text-orange-600" : "text-muted-foreground hover:text-orange-500"}
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
                              onClick={() => handleRenameDocument(doc.id, doc.title || "")}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Переименовать
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

      <DocumentCreationModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
      />

      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить выбранные документы?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить {selectedDocuments.size} документ(ов)?
              Они будут перемещены в корзину.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSingleDeleteConfirm} onOpenChange={setShowSingleDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить документ?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить документ &quot;{documentToDelete?.title}&quot;?
              Он будет перемещен в корзину.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSingleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Переименовать документ</AlertDialogTitle>
            <AlertDialogDescription>
              Введите новое название для документа &quot;{documentToRename?.currentTitle}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="new-title"
              value={newTitleInput}
              onChange={(e) => setNewTitleInput(e.target.value)}
              className="col-span-3"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRename}>Переименовать</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
