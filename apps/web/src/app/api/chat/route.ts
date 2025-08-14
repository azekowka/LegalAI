import { NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'

// Mock AI response for demonstration
const generateMockResponse = (message: string) => {
  const responses = [
    "Это интересный вопрос о вашем документе. Могу помочь с редактированием и улучшением текста.",
    "Я вижу, что вы работаете над документом. Какие конкретно изменения вы хотели бы внести?",
    "Отличная идея! Давайте проработаем этот раздел более детально.",
    "Могу предложить несколько вариантов улучшения структуры вашего документа.",
    "Это хороший подход. Рассмотрим, как можно развить эту мысль дальше."
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

// Mock model for AI SDK compatibility
const mockModel = {
  doStream: async function* (prompt: any) {
    const response = generateMockResponse(prompt.messages[prompt.messages.length - 1]?.content || '')
    const words = response.split(' ')
    
    for (const word of words) {
      yield {
        type: 'text-delta',
        textDelta: (words.indexOf(word) === 0 ? word : ' ' + word)
      }
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    yield {
      type: 'finish',
      finishReason: 'stop'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 })
    }

    const result = await streamText({
      model: mockModel as any,
      messages: messages,
    })

    return result.toTextStreamResponse()
    
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}