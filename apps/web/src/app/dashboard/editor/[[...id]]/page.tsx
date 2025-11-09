"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Save, Bot, Link, Download, RefreshCw, FileCode, Globe, ChevronDown, Earth, Share2, UploadIcon, ImageIcon, CameraIcon, ScreenShareIcon, MicIcon, GlobeIcon } from "lucide-react"
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
  {
    id: 'gpt-5',
    name: 'GPT-5',
    icon: (
      <svg
        fill="currentColor"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>OpenAI</title>
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
      </svg>
    ),
  },
  {
    id: 'claude-4',
    name: 'Claude-4',
    icon: (
      <svg
        fill="currentColor"
        role="img"
        viewBox="0 0 12 12"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Claude</title>
        <path
          clipRule="evenodd"
          d="M2.3545 7.9775L4.7145 6.654L4.7545 6.539L4.7145 6.475H4.6L4.205 6.451L2.856 6.4145L1.6865 6.366L0.5535 6.305L0.268 6.2445L0 5.892L0.0275 5.716L0.2675 5.5555L0.6105 5.5855L1.3705 5.637L2.5095 5.716L3.3355 5.7645L4.56 5.892H4.7545L4.782 5.8135L4.715 5.7645L4.6635 5.716L3.4845 4.918L2.2085 4.074L1.5405 3.588L1.1785 3.3425L0.9965 3.1115L0.9175 2.6075L1.2455 2.2465L1.686 2.2765L1.7985 2.307L2.245 2.65L3.199 3.388L4.4445 4.3045L4.627 4.4565L4.6995 4.405L4.709 4.3685L4.627 4.2315L3.9495 3.0085L3.2265 1.7635L2.9045 1.2475L2.8195 0.938C2.78711 0.819128 2.76965 0.696687 2.7675 0.5735L3.1415 0.067L3.348 0L3.846 0.067L4.056 0.249L4.366 0.956L4.867 2.0705L5.6445 3.5855L5.8725 4.0345L5.994 4.4505L6.0395 4.578H6.1185V4.505L6.1825 3.652L6.301 2.6045L6.416 1.257L6.456 0.877L6.644 0.422L7.0175 0.176L7.3095 0.316L7.5495 0.6585L7.516 0.8805L7.373 1.806L7.0935 3.2575L6.9115 4.2285H7.0175L7.139 4.1075L7.6315 3.4545L8.4575 2.4225L8.8225 2.0125L9.2475 1.5605L9.521 1.345H10.0375L10.4175 1.9095L10.2475 2.4925L9.7155 3.166L9.275 3.737L8.643 4.587L8.248 5.267L8.2845 5.322L8.3785 5.312L9.8065 5.009L10.578 4.869L11.4985 4.7115L11.915 4.9055L11.9605 5.103L11.7965 5.5065L10.812 5.7495L9.6575 5.9805L7.938 6.387L7.917 6.402L7.9415 6.4325L8.716 6.5055L9.047 6.5235H9.858L11.368 6.636L11.763 6.897L12 7.216L11.9605 7.4585L11.353 7.7685L10.533 7.574L8.6185 7.119L7.9625 6.9545H7.8715V7.0095L8.418 7.5435L9.421 8.4485L10.6755 9.6135L10.739 9.9025L10.578 10.13L10.408 10.1055L9.3055 9.277L8.88 8.9035L7.917 8.0935H7.853V8.1785L8.075 8.503L9.2475 10.2635L9.3085 10.8035L9.2235 10.98L8.9195 11.0865L8.5855 11.0255L7.8985 10.063L7.191 8.9795L6.6195 8.008L6.5495 8.048L6.2125 11.675L6.0545 11.86L5.69 12L5.3865 11.7695L5.2255 11.396L5.3865 10.658L5.581 9.696L5.7385 8.931L5.8815 7.981L5.9665 7.665L5.9605 7.644L5.8905 7.653L5.1735 8.6365L4.0835 10.109L3.2205 11.0315L3.0135 11.1135L2.655 10.9285L2.6885 10.5975L2.889 10.303L4.083 8.785L4.803 7.844L5.268 7.301L5.265 7.222H5.2375L2.066 9.28L1.501 9.353L1.2575 9.125L1.288 8.752L1.4035 8.6305L2.3575 7.9745L2.3545 7.9775Z"
          fillRule="evenodd"
        />
      </svg>
    ),
  },
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
            placeholder="Edit this document with AI"
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
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4">{model.icon}</div>
                        <span>{model.name}</span>
                      </div>
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