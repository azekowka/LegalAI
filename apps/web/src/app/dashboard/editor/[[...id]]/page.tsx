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
  Earth,
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
  const documentId = params.id ? params.id[0] : null

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
      // New document - initialize with empty Slate content
      setTitle("Untitled Document")
      setContent(JSON.stringify([{ type: "paragraph", children: [{ text: "" }] }]))
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
    // Don't auto-save if both title and content are empty or if content is just empty Slate structure
    if (!title && !content) return
    if (!title && content === JSON.stringify([{ type: "paragraph", children: [{ text: "" }] }])) return
    
    console.log('Auto-save timer set for title:', title, 'content length:', content?.length)
    
    const timeout = setTimeout(() => {
        console.log('Auto-save triggered')
        handleSave(true)
    }, 2000)

    return () => {
      console.log('Auto-save timer cleared')
      clearTimeout(timeout)
    }
  }, [title, content])

  // Auto-scroll is handled by AI Elements Conversation component

  const loadDocument = async () => {
    if (!documentId) return

    setIsLoading(true)
    try {
      console.log('=== LOADING DOCUMENT ===')
      console.log('Document ID:', documentId, 'Type:', typeof documentId)
      
      const response = await apiClient.getDocument(documentId)
      console.log('API Response:', response)

      if (response.data) {
        setDocument(response.data)
        setTitle(response.data.title || "")
        
        // Handle content - if it's JSON (from Slate editor), use it as-is
        // If it's plain text, convert it to Slate format
        let loadedContent = response.data.content || ""
        console.log('Raw loaded content:', loadedContent.substring(0, 100) + '...')
        
        if (loadedContent) {
          try {
            // Try to parse as JSON (Slate format)
            JSON.parse(loadedContent)
            console.log('Content is valid JSON (Slate format)')
            setContent(loadedContent) // It's already in Slate JSON format
          } catch {
            // It's plain text, convert to Slate format
            console.log('Content is plain text, converting to Slate format')
            const slateContent = JSON.stringify([
              { type: "paragraph", children: [{ text: loadedContent }] }
            ])
            setContent(slateContent)
          }
        } else {
          console.log('No content found, setting empty')
          setContent("")
        }
        
        // Force a small delay to ensure state updates
        setTimeout(() => {
          console.log('Content should now be visible in editor')
        }, 100)
        
        console.log('Document loaded successfully:', response.data.title)
        console.log('Content type:', typeof loadedContent, 'Length:', loadedContent.length)
      } else {
        console.error('No document data received, redirecting to dashboard')
        router.push("/dashboard")
      }
    } catch (error) {
      console.error('Failed to load document:', error)
      // Don't redirect on error - stay in editor for new document creation
      setTitle("Untitled Document")
      setContent(JSON.stringify([{ type: "paragraph", children: [{ text: "" }] }]))
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
    console.log('=== SAVING DOCUMENT (SIMPLIFIED) ===')
    console.log('Document ID:', documentId)
    console.log('Title:', title)
    console.log('Content length:', content?.length || 0)
    console.log('Content preview:', content?.substring(0, 200))
    console.log('Is auto-save:', isAutoSave)
    
    // For debugging, let's save everything for now
    if (!title && !content) {
      console.log('Both title and content empty, skipping save')
      return
    }

    setIsSaving(true)

    try {
      let response
      if (documentId) {
        // Update existing document
        console.log('Updating existing document...')
        response = await apiClient.updateDocument(documentId, title, content)
      } else {
        // Create new document
        console.log('Creating new document...')
        response = await apiClient.createDocument(title, content)
        if (response.data) {
          // Update URL to reflect the new document ID
          const newDocumentId = response.data.id
          console.log('New document created with ID:', newDocumentId)
          router.replace(`/dashboard/editor/${newDocumentId}`)
          setDocument(response.data)
        }
      }

      if (response.data) {
        setLastSaved(new Date())
        console.log('Document saved successfully:', response.data.title)
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
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with breadcrumb */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background border-b border-border">
          <div className="flex items-center gap-2 px-4">
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
            <div className="p-4 bg-background border-b border-border flex items-center justify-between">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Заголовок документа"
                className="text-2xl font-bold border-none shadow-none p-0 focus-visible:ring-0 flex-1 mr-4"
              />
              <div className="flex items-center gap-2">
                 {lastSaved && (
                   <span className="text-sm text-muted-foreground">
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
                       <img src="/pdf.png" alt="PDF icon" width={16} height={16} className="mr-2" />
                       PDF
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleExport('docx')}>
                       <img src="/docx.svg" alt="DOCX icon" width={16} height={16} className="mr-2" />
                       DOCX
                     </DropdownMenuItem>
                     <DropdownMenuItem>
                       <Earth className="h-4 w-4 mr-2" />
                       Ссылка
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
               <div className="flex-1 p-4 bg-background">
                 <RichTextEditor
                   key={documentId || 'new'} // Force re-render when document changes
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
      <div className="w-96 bg-background border-l border-border flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              ИИ Юрист
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-muted-foreground hover:text-foreground"
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