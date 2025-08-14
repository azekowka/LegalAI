"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Save,
  Bot,
  Download,
  RefreshCw,
  FileCode,
  Globe,
  ChevronDown,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RichTextEditor } from "@/components/rich-text-editor"
import { apiClient, type Document } from "@/lib/api"
import { WordCountDialog } from "@/components/dialogs/word-count-dialog"
import { LinkDialog } from "@/components/dialogs/link-dialog"
import ChatBotDemo from '@/components/chatbot-demo'
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

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  title?: string
  created_at: string
  updated_at: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
}

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id ? Number.parseInt(params.id[0]) : null

  const [document, setDocument] = useState<Document | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [documentsList, setDocumentsList] = useState<Document[]>([])
  const [user, setUser] = useState<any>(null)
  const [showWordCount, setShowWordCount] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(384) // default 24rem (w-96)
  const isResizingRef = useRef(false)

  // Available tools
  const availableTools = [
    { id: "web_search", name: "Web Search", icon: Globe, description: "Search the web for information" },
    { id: "file_analysis", name: "File Analysis", icon: FileCode, description: "Analyze document structure" },
  ]

  // Load stored conversation ID from localStorage
  useEffect(() => {
    const storedConversationId = localStorage.getItem(`conversation_${documentId || 'new'}`)
    if (storedConversationId) {
      setConversationId(storedConversationId)
    }
  }, [documentId])

  // Load conversations and conversation history
  useEffect(() => {
    loadConversations()
    if (conversationId) {
      loadConversationHistory(conversationId)
    }
  }, [conversationId])

  useEffect(() => {
    if (documentId) {
      loadDocument()
    } else {
      // New document
      setTitle("Untitled Document")
      setContent("")
    }

    // Load user's documents for knowledge base selector
    ;(async () => {
      // Load user data
      const userResponse = await apiClient.getMe()
      if (userResponse.data) {
        setUser(userResponse.data)
      }

      const res = await apiClient.getDocuments()
      if (res.data) {
        setDocumentsList(res.data)
      }
    })()
  }, [documentId])

  // Auto-save 2s after user stops typing or changing title
  useEffect(() => {
    if (!title && !content) return
    const timeout = setTimeout(() => {
        handleSave(true)
    }, 2000)

    return () => clearTimeout(timeout)
  }, [title, content])

  // Auto-scroll is handled by AI Elements Conversation component

  const loadDocument = async () => {
    if (!documentId) return

    setIsLoading(true)
    const response = await apiClient.getDocument(documentId)

    if (response.data) {
      setDocument(response.data)
      setTitle(response.data.title)
      setContent(response.data.content)
    } else {
      router.push("/dashboard")
    }

    setIsLoading(false)
  }

  // Load user's conversations
  const loadConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const response = await apiClient.getConversations()
      if (response.data) {
        setConversations(response.data as Conversation[])
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    }
    setIsLoadingConversations(false)
  }

  // Load specific conversation history
  const loadConversationHistory = async (convId: string) => {
    try {
      const response = await apiClient.getConversation(convId)
      if (response.data) {
        const conversationData = response.data as Conversation
        setCurrentConversation(conversationData)
        // Convert backend messages to local format
        const messages: ChatMessage[] = conversationData.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }))
        setChatMessages(messages)
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error)
    }
  }

  const handleSave = async (isAutoSave = false) => {
    if (!title && !content) return

    setIsSaving(true)

    try {
      let response
      if (documentId) {
        // Update existing document
        response = await apiClient.updateDocument(documentId, title, content)
      } else {
        // Create new document
        response = await apiClient.createDocument(title, content)
        if (response.data) {
          // Update URL to reflect the new document ID
          const newDocumentId = response.data.id
          router.replace(`/dashboard/editor/${newDocumentId}`)
          setDocument(response.data)
        }
      }

      if (response.data) {
        setLastSaved(new Date())
        if (!isAutoSave) {
          // Show success message for manual saves
        }
      }
    } catch (error) {
      console.error("Save failed:", error)
    }

    setIsSaving(false)
  }

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!documentId) {
      alert('Сначала сохраните документ')
      return
    }

    try {
      const response = await apiClient.exportDocument(documentId, format)
      if (response.data) {
        // Handle export response
        console.log('Export successful:', format)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Ошибка экспорта документа')
    }
  }

  // Chat is now handled by useChat hook from AI SDK

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with breadcrumb */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white border-b">
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
                  <BreadcrumbPage>Редактор</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Document Editor */}
          <div className="flex-1 flex flex-col">
            {/* Editor Section */}
            <div className="flex-1 flex flex-col">
            {/* Title Input */}
            <div className="p-4 bg-white border-b flex items-center justify-between">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Заголовок документа"
                className="text-2xl font-bold border-none shadow-none p-0 focus-visible:ring-0 flex-1 mr-4"
              />
              <div className="flex items-center gap-2">
                 {lastSaved && (
                   <span className="text-sm text-gray-500">
                     Сохранено {lastSaved.toLocaleTimeString()}
                   </span>
                 )}
                 
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="outline" size="sm" className="flex items-center gap-2">
                       <Download className="h-4 w-4" />
                       Экспорт
                       <ChevronDown className="h-4 w-4" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent>
                     <DropdownMenuItem onClick={() => handleExport('pdf')}>
                       <FileText className="h-4 w-4 mr-2" />
                       PDF
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleExport('docx')}>
                       <FileText className="h-4 w-4 mr-2" />
                       DOCX
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleExport('txt')}>
                       <FileText className="h-4 w-4 mr-2" />
                       TXT
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
                 
                 <Button
                   onClick={() => handleSave()}
                   disabled={isSaving}
                   size="sm"
                   className="flex items-center gap-2"
                 >
                   <Save className="h-4 w-4" />
                   {isSaving ? "Сохранение..." : "Сохранить"}
                 </Button>
               </div>
            </div>

              {/* Rich Text Editor */}
              <div className="flex-1 p-4 bg-white">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Начните писать..."
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* AI Chat Sidebar with AI Elements */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              ИИ Юрист
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* AI Chat Demo - точная копия ai-sdk.dev example */}
        <ChatBotDemo />
      </div>

      {/* Word Count Dialog */}
      <WordCountDialog
        open={showWordCount}
        onOpenChange={setShowWordCount}
        content={content}
      />

      {/* Link Dialog */}
      <LinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onInsertLink={(url, text) => {
          console.log("Insert link:", { url, text })
          setShowLinkDialog(false)
        }}
      />
    </div>
  )
}