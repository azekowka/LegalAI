'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatResponse } from '@/components/chat/chat-response'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface FileInfo {
  id: string
  name: string
}

interface ChatResponse {
  type: string
  data: string
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' }
]

const REASONING_MODES = [
  { value: 'simple', name: 'Простые вопросы (Full QA Pipeline)' },
  { value: 'decompose', name: 'Многосоставные вопросы (Decompose QA Pipeline)' },
  { value: 'react', name: 'Исследовательские вопросы (React Agent Pipeline)' },
  { value: 'rewoo', name: 'Пошаговые вопросы (Rewoo Agent Pipeline)' }
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [uploadStatus, setUploadStatus] = useState('')
  const [infoPanel, setInfoPanel] = useState('')
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedReasoning, setSelectedReasoning] = useState('simple')
  const [useMindmap, setUseMindmap] = useState(false)
  const [mindmapData, setMindmapData] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load files on component mount
  useEffect(() => {
    loadFiles()
  }, [])

  // Trigger markmap rendering when mindmap data changes
  useEffect(() => {
    if (mindmapData && useMindmap) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).markmap) {
          (window as any).markmap.autoLoader.renderAll()
        }
      }, 100)
    }
  }, [mindmapData, useMindmap])

  // Generate initial questions when files are selected
  useEffect(() => {
    generateInitialQuestions()
  }, [selectedFiles, selectedLanguage])

  const loadFiles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/files')
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploadStatus('Uploading...')
    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        setUploadStatus(`Successfully uploaded: ${result.filename}`)
        loadFiles() // Refresh file list
        setTimeout(() => setUploadStatus(''), 3000)
      } else {
        setUploadStatus('Upload failed')
        setTimeout(() => setUploadStatus(''), 3000)
      }
    } catch (error) {
      setUploadStatus('Upload error')
      setTimeout(() => setUploadStatus(''), 3000)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const newMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsLoading(true)
    setInfoPanel('')
    // Don't clear mindmap data - keep previous mindmap until new one arrives
    if (!useMindmap) {
      setMindmapData('')
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          history: messages.map(m => [m.role === 'user' ? m.content : '', m.role === 'assistant' ? m.content : '']).filter(([user, assistant]) => user || assistant),
          selected_files: selectedFiles,
          language: selectedLanguage,
          reasoning_mode: selectedReasoning,
          use_mindmap: useMindmap
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let currentInfoPanel = ''
      let currentMindmap = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())

          for (const line of lines) {
            try {
              const data: ChatResponse = JSON.parse(line)
              console.log('Received data:', data.type, data.data?.substring(0, 100))
              
              if (data.type === 'chat') {
                assistantMessage += data.data
                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastMessage = newMessages[newMessages.length - 1]
                  if (lastMessage?.role === 'assistant') {
                    lastMessage.content = assistantMessage
                  } else {
                    newMessages.push({
                      role: 'assistant',
                      content: assistantMessage,
                      timestamp: new Date()
                    })
                  }
                  return newMessages
                })
              } else if (data.type === 'info') {
                // Check if this info contains mindmap data
                if (data.data.includes('class="markmap"') && useMindmap) {
                  console.log('Received mindmap data:', data.data.substring(0, 100))
                  // Replace mindmap data completely, don't append
                  setMindmapData(data.data)
                } else if (data.data === null) {
                  // Handle clear info panel command, but preserve mindmap
                  setInfoPanel('')
                } else {
                  currentInfoPanel += data.data
                  setInfoPanel(currentInfoPanel)
                }
              } else if (data.type === 'plot') {
                console.log('Received plot data:', data.data)
                // Replace plot/mindmap data completely, don't append
                setMindmapData(data.data)
              }
            } catch (error) {
              console.error('Error parsing streaming response:', error)
            }
          }
        }
      }

      // Get follow-up questions ALWAYS after any response
      try {
        // Create proper history format for suggestion pipeline
        const allMessages = [...messages, { role: 'assistant', content: assistantMessage, timestamp: new Date() }]
        const chatHistory = allMessages
          .map(m => [m.role === 'user' ? m.content : '', m.role === 'assistant' ? m.content : ''])
          .filter(([user, assistant]) => user || assistant)
        
        console.log('Sending chat history for suggestions:', chatHistory)
        
        if (chatHistory.length > 0) {
          const suggestResponse = await fetch('http://127.0.0.1:8000/suggest-questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              history: chatHistory,
              language: selectedLanguage
            })
          })

          if (suggestResponse.ok) {
            const suggestData = await suggestResponse.json()
            console.log('Suggested questions received:', suggestData.questions)
            setFollowUpQuestions(suggestData.questions || [])
          } else {
            console.error('Failed to get suggested questions:', suggestResponse.status)
          }
        }
      } catch (error) {
        console.error('Error getting suggested questions:', error)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowUpClick = (question: string) => {
    setInputMessage(question)
  }

  const generateInitialQuestions = async () => {
    if (selectedFiles.length === 0) {
      setFollowUpQuestions([])
      return
    }

    try {
      // Generate initial questions based on selected documents
      const suggestResponse = await fetch('http://127.0.0.1:8000/suggest-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          history: [['What can you tell me about this document?', '']],
          language: selectedLanguage
        })
      })

      if (suggestResponse.ok) {
        const suggestData = await suggestResponse.json()
        console.log('Initial suggested questions:', suggestData.questions)
        setFollowUpQuestions(suggestData.questions || [])
      }
    } catch (error) {
      console.error('Error generating initial questions:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        {/* File Upload Section */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold mb-3 text-gray-900">File Upload</h3>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt,.md"
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:font-medium"
          />
          {uploadStatus && (
            <p className={`text-sm mt-2 font-medium ${uploadStatus.includes('Success') ? 'text-green-700' : 'text-red-700'}`}>
              {uploadStatus}
            </p>
          )}
        </div>

        {/* File Selection */}
        <div className="p-4 border-b border-gray-200 flex-1 overflow-y-auto">
          <h3 className="font-semibold mb-3 text-gray-900">Select Files</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <label key={file.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFiles(prev => [...prev, file.id])
                    } else {
                      setSelectedFiles(prev => prev.filter(id => id !== file.id))
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 truncate">{file.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold mb-3 text-gray-900">Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Reasoning Mode</label>
              <select
                value={selectedReasoning}
                onChange={(e) => setSelectedReasoning(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {REASONING_MODES.map(mode => (
                  <option key={mode.value} value={mode.value}>{mode.name}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useMindmap}
                onChange={(e) => setUseMindmap(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Mindmap</span>
            </label>
          </div>
        </div>

      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">RAG Chat Interface</h1>
          <p className="text-sm text-gray-600">Ask questions about your documents</p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white shadow-md border border-gray-200'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="text-gray-800">
                    <ChatResponse className="min-h-0">
                      {message.content}
                    </ChatResponse>
                    <div className="text-xs mt-2 text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs mt-2 text-blue-100">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-gray-700">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Debug Info */}
        {/* <div className="bg-yellow-50 border-t border-yellow-200 p-2 text-xs text-gray-600">
          Debug: Mindmap enabled: {useMindmap ? 'Yes' : 'No'} | 
          Mindmap data length: {mindmapData.length} | 
          Follow-up questions: {followUpQuestions.length}
          {followUpQuestions.length > 0 && (
            <div className="mt-1">
              Questions: {JSON.stringify(followUpQuestions.slice(0, 2))}
            </div>
          )}
        </div> */}

        {/* Suggested Questions - ALWAYS TRY TO SHOW */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <h4 className="font-medium mb-2 text-gray-900">💡 Suggested Questions:</h4>
          {followUpQuestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {followUpQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleFollowUpClick(question)}
                  className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 rounded-md border border-blue-300 text-blue-800 transition-colors"
                >
                  {question.length > 80 ? question.substring(0, 80) + '...' : question}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Generating suggested questions...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your documents..."
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              rows={3}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Information Panel</h3>
        </div>
        
        {/* Mindmap - TOP POSITION when enabled */}
        {useMindmap && (
          <div className="p-4 border-b border-gray-100 bg-blue-50">
            <h4 className="font-medium mb-2 text-gray-900">🧠 Mindmap</h4>
            {mindmapData ? (
              <div className="mindmap-container">
                <div 
                  className="bg-white p-4 rounded-md border-2 border-blue-200 shadow-sm"
                  style={{
                    minHeight: '300px',
                    fontSize: '14px',
                    color: '#1f2937',
                    fontWeight: '500'
                  }}
                  dangerouslySetInnerHTML={{ __html: mindmapData }}
                />
                <style jsx>{`
                  .mindmap-container svg text {
                    fill: #1f2937 !important;
                    font-weight: 700 !important;
                    font-size: 15px !important;
                  }
                  .mindmap-container svg .markmap-node > circle {
                    stroke-width: 3px !important;
                  }
                  .mindmap-container svg .markmap-link {
                    stroke-width: 2px !important;
                  }
                `}</style>
              </div>
            ) : (
              <div className="text-sm text-blue-600 italic bg-white p-3 rounded-md border">
                Mindmap will appear here after asking a question...
              </div>
            )}
          </div>
        )}

        {/* Sources and References */}
        {infoPanel && (
          <div className="p-4 border-b border-gray-100">
            <h4 className="font-medium mb-2 text-gray-900">Sources & References</h4>
            <div 
              className="text-sm text-gray-700 prose prose-sm max-w-none bg-gray-50 p-3 rounded-md"
              dangerouslySetInnerHTML={{ __html: infoPanel }}
            />
          </div>
        )}

        {/* Selected Files Info */}
        {selectedFiles.length > 0 && (
          <div className="p-4">
            <h4 className="font-medium mb-2 text-gray-900">Selected Files ({selectedFiles.length})</h4>
            <div className="space-y-2">
              {selectedFiles.map(fileId => {
                const file = files.find(f => f.id === fileId)
                return file ? (
                  <div key={fileId} className="text-sm text-gray-700 truncate bg-gray-50 p-2 rounded-md border">
                    📄 {file.name}
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}