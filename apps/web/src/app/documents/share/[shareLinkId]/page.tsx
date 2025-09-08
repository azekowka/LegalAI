"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { RichTextEditor } from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function SharedDocumentPage() {
  const params = useParams()
  const shareLinkId = params.shareLinkId as string
  const [document, setDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSharedDocument() {
      if (!shareLinkId) return

      setIsLoading(true)
      setError(null)
      try {
        // Fetch the document using the share link ID via the dedicated shared document API
        const response = await apiClient.getSharedDocument(shareLinkId)

        if (response.data) {
          setDocument(response.data)
        } else if (response.error) {
          setError(response.error)
        } else {
          setError("Документ не найден или недоступен")
        }
      } catch (err) {
        console.error("Error fetching shared document:", err)
        setError("Произошла ошибка при загрузке документа")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSharedDocument()
  }, [shareLinkId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Загрузка документа...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <p className="text-xl font-semibold">Ошибка:</p>
        <p className="mt-2">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Попробовать снова</Button>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl font-semibold">Документ не найден</p>
        <p className="mt-2">Возможно, ссылка недействительна или срок ее действия истек.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{document.title}</h1>
      <div className="border rounded-md p-4 bg-background">
        <RichTextEditor value={document.content} readOnly={true} />
      </div>
    </div>
  )
}
