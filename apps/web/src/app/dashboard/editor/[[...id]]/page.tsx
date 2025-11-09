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
  Link,
  Download,
  RefreshCw,
  FileCode,
  Globe,
  ChevronDown,
  Earth,
  Share2,
  UploadIcon,
  ImageIcon,
  CameraIcon,
  ScreenShareIcon,
  MicIcon,
  GlobeIcon,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RichTextEditor } from "@/components/rich-text-editor"
import { apiClient, type Document } from "@/lib/api"
import { WordCountDialog } from "@/components/dialogs/word-count-dialog"
import { ShareDialog } from "@/components/dialogs/share-dialog" // Renamed from LinkDialog
import ChatBotDemo from '@/components/chatbot-demo'
import { useToast } from "@/components/ui/use-toast"
import AiToolkit from "@/components/ai-toolkit";
import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
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
import LinkIcon from "@/components/icons/link-icon"
import { recordActivity } from "@/lib/activity-tracker"

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

const models = [
  { id: 'gpt-5', name: 'GPT-5' },
  { id: 'claude-4', name: 'Claude-4' },
];



export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
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
  const [showShareDialog, setShowShareDialog] = useState(false) // Renamed from showLinkDialog
  const [sidebarWidth, setSidebarWidth] = useState(384) // default 24rem (w-96)
  const isResizingRef = useRef(false)
  const activityRecordedRef = useRef(false)
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].id);
  const [webSearch, setWebSearch] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Removed sharedLink and isSharedLinkPublic states

  // Available tools
  const availableTools = [
    { id: "web_search", name: "Web Search", icon: Globe, description: "Search the web for information" },
    { id: "file_analysis", name: "File Analysis", icon: FileCode, description: "Analyze document structure" },
  ]

  // Load user data independently
  useEffect(() => {
    ;(async () => {
      const userResponse = await apiClient.getMe()
      console.log("Raw userResponse from apiClient.getMe():", JSON.stringify(userResponse, null, 2)) // Add this log
      if (userResponse.data && userResponse.data.email && userResponse.data.name) { // Explicitly check for valid user data
        setUser(userResponse.data)
        console.log("User state after setUser:", userResponse.data)
      } else {
        console.log("User data from apiClient.getMe() is invalid or incomplete:", userResponse.data)
        setUser(null) // Ensure user is null if data is invalid
      }
    })()
  }, []) // Empty dependency array means this runs once on mount

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
      const res = await apiClient.getDocuments()
      if (res.data) {
        setDocumentsList(res.data)
      }
    })()

    if (!activityRecordedRef.current) {
      recordActivity()
      activityRecordedRef.current = true
    }
  }, [documentId])

  // Auto-save 2s after user stops typing or changing title
  useEffect(() => {
    // Don't auto-save if both title and content are empty or if content is just empty Slate structure
    if (!title && !content) return
    if (!title && content === JSON.stringify([{ type: "paragraph", children: [{ text: "" }] }])) return
    
    if (!activityRecordedRef.current) {
      recordActivity()
      activityRecordedRef.current = true
    }

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
        
        // Ensure share_link_id and is_public are set in document state
        // The previous setDocument call already sets the entire document, so we can refine this.
        setDocument(prevDoc => ({
          ...prevDoc, // Keep existing properties
          ...(response.data ? response.data : {}),
          id: response.data?.id || documentId || "", // Fallback to documentId or empty string
          user_id: response.data?.user_id || prevDoc?.user_id || "", // Fallback to prevDoc user_id or empty string
          title: response.data?.title || prevDoc?.title || "", // Fallback to prevDoc title or empty string
          share_link_id: response.data?.share_link_id || null,
          is_public: response.data?.is_public || false,
        }));

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
        toast.error('Документ не найден, перенаправление на дэшборд')
        router.push("/dashboard")
      }
    } catch (error) {
      console.error('Failed to load document:', error)
      toast.error('Ошибка загрузки документа. Возможно, документ был удален или не существует.')
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
          
          // Ensure share_link_id and is_public are set for new documents
          setDocument({
            ...response.data,
            share_link_id: response.data.share_link_id || null,
            is_public: response.data.is_public || false,
          });

          if (!activityRecordedRef.current) {
              recordActivity()
              activityRecordedRef.current = true
          }
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
      toast.error('Сначала сохраните документ')
      return
    }

    try {
      const response = await apiClient.exportDocument(documentId, format)
      if (response.data) {
        // Handle export response
        console.log('Export successful:', format)
        toast.success(`Документ успешно экспортирован в формат ${format.toUpperCase()}!`)
      }
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Ошибка экспорта документа')
    }
  }

  const handleOpenShareDialog = () => {
    if (!documentId || !document) {
      toast.error('Сначала сохраните документ')
      return
    }
    setShowShareDialog(true)
  }

  const handleUpdateShareSettings = async (isPublic: boolean, role: 'viewer' | 'commenter' | 'editor') => {
    if (!documentId) return
    try {
      const response = await apiClient.generateShareLink(documentId, isPublic) // This will also update is_public
      if (response.data) {
        // Update local document state to reflect new share settings
        setDocument(prevDoc => {
          if (prevDoc) {
            return { ...prevDoc, is_public: response.data?.isPublic || false, share_link_id: response.data?.shareUrl.split('/').pop() || null };
          }
          return prevDoc;
        });
        console.log('Share settings updated successfully', response.data)
        // Optionally, show a toast notification
        toast.success('Настройки доступа обновлены успешно!')
      } else if (response.error) {
        toast.error(`Ошибка обновления настроек доступа: ${response.error}`)
      }
    } catch (error) {
      console.error('Error updating share settings:', error)
      toast.error('Произошла ошибка при обновлении настроек доступа')
    }
  }

  // Chat is now handled by useChat hook from AI SDK
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with input:", input);
  };

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
          <div className="p-4">
            <AiToolkit />
          </div>
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
                     <DropdownMenuItem onClick={handleOpenShareDialog}> {/* Single button for share dialog */}
                       <LinkIcon className="h-4 w-4 mr-2" />
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


{/* AI Chat Sidebar with AI Elements      <div className="w-96 bg-background border-l border-border flex flex-col">
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
        <ChatBotDemo /> {/* AI Chat Demo - точная копия ai-sdk.dev example 
      </div>*/}

      {/* Word Count Dialog */}
      <WordCountDialog
        open={showWordCount}
        onOpenChange={setShowWordCount}
        content={content}
      />

      {/* Share Dialog */}
      {console.log("User state before ShareDialog:", user)} {/* Add this log */}
      {document && user && user.name && user.email && (
        <ShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          documentTitle={document.title || "Без названия"} // Use a Russian default title
          shareUrl={document.share_link_id ? `${window.location.origin}/documents/share/${document.share_link_id}` : null}
          isShareLinkPublic={document.is_public || false}
          onUpdateShareSettings={handleUpdateShareSettings}
          currentUserEmail={user.email}
          currentUserName={user.name}
          currentUserImage={user.image}
        />
      )}

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What would you like to know?"
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <PromptInputAttachButton />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <UploadIcon size={16} className="mr-2" />
                    Upload File
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ImageIcon size={16} className="mr-2" />
                    Upload Image
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CameraIcon size={16} className="mr-2" />
                    Take Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ScreenShareIcon size={16} className="mr-2" />
                    Screen Capture
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <PromptInputButton>
                     <MicIcon size={16} />
                   </PromptInputButton>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent>
                   <DropdownMenuItem>
                     <MicIcon size={16} className="mr-2" />
                     Record Voice
                   </DropdownMenuItem>
                   <DropdownMenuItem>
                     <UploadIcon size={16} className="mr-2" />
                     Upload Audio
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
              <PromptInputButton
                onClick={() => setWebSearch(!webSearch)}
                variant={webSearch ? 'default' : 'ghost'}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect value={model} onValueChange={setModel}>
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue placeholder="Select model" />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.id} value={model.id}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input.trim()} status={isStreaming ? 'streaming' : 'ready'} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  )
}