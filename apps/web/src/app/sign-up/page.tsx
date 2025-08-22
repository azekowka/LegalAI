'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SignUpPage, type Testimonial } from './sign-up'
import { authClient } from '@/lib/auth-client'
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
        toast.success('Аккаунт успешно создан!')
        router.push('/dashboard')
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