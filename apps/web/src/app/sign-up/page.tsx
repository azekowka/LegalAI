'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SignUpPage, type Testimonial } from './sign-up'
import { authClient } from '@/lib/auth-client'
import { useAuthSession } from '@/components/auth-provider'
import { EmailVerification } from '@/components/auth/email-verification'
import { toast } from 'sonner'

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Сара Чен",
    handle: "@sarahdigital",
    text: "Потрясающая платформа! Пользовательский опыт безупречен, и функции именно то, что мне нужно."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Маркус Джонсон",
    handle: "@marcustech",
    text: "Этот сервис изменил мою работу. Чистый дизайн, мощные функции и отличная поддержка."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Дэвид Мартинес",
    handle: "@davidcreates",
    text: "Я пробовал много платформ, но эта выделяется. Интуитивная, надежная и действительно полезная для продуктивности."
  },
];

export default function SignUpPageWrapper() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const { isAuthenticated, isLoading: sessionLoading } = useAuthSession()

  // Перенаправляем аутентифицированных пользователей на дашборд
  useEffect(() => {
    if (!sessionLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, sessionLoading, router])

  // Показываем загрузку пока проверяем сессию
  if (sessionLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Проверка сессии...</p>
        </div>
      </div>
    )
  }

  // Если пользователь аутентифицирован, не показываем форму регистрации
  if (isAuthenticated) {
    return null
  }

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const agreeToTerms = formData.get('agreeToTerms') as string

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Пожалуйста, заполните все поля')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают')
      setIsLoading(false)
      return
    }

    if (!agreeToTerms) {
      toast.error('Необходимо согласиться с условиями использования')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: '/dashboard'
      });

      if (error) {
        toast.error(error.message || 'Ошибка регистрации')
        return
      }

      if (data) {
        // Since email verification is required, show verification step instead of redirecting
        setUserEmail(email)
        setShowEmailVerification(true)
        toast.success('Аккаунт создан! Проверьте свою почту для верификации.')
      }
    } catch (error) {
      toast.error('Произошла ошибка при регистрации')
      console.error('Sign up error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard'
      });

      if (error) {
        toast.error(error.message || 'Ошибка регистрации через Google')
        return
      }
    } catch (error) {
      toast.error('Произошла ошибка при регистрации через Google')
      console.error('Google sign up error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = () => {
    router.push('/sign-in')
  }

  const handleVerificationComplete = () => {
    toast.success('Email verified successfully! You can now sign in.')
    router.push('/sign-in')
  }

  // Show email verification step if needed
  if (showEmailVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <EmailVerification
          email={userEmail}
          onVerificationComplete={handleVerificationComplete}
        />
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground">
      <SignUpPage
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={sampleTestimonials}
        onSignUp={handleSignUp}
        onGoogleSignUp={handleGoogleSignUp}
        onSignIn={handleSignIn}
      />
    </div>
  )
}