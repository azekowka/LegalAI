import { NextRequest, NextResponse } from 'next/server'

// Mock user data
const mockUser = {
  id: 1,
  email: "user@example.com",
  name: "Пользователь",
  type: "user",
  created_at: new Date().toISOString()
}

export async function GET(request: NextRequest) {
  // В реальном приложении здесь была бы проверка токена аутентификации
  // Для демонстрации просто возвращаем mock пользователя
  return NextResponse.json(mockUser)
}