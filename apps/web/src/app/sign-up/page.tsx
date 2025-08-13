'use client'

import { useRouter } from 'next/navigation'
import { SignUpPage, type Testimonial } from './sign-up'

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

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // Simulate registration - replace with actual registration logic
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const agreeToTerms = formData.get('agreeToTerms') as string

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      alert('Пожалуйста, заполните все поля')
      return
    }

    if (password !== confirmPassword) {
      alert('Пароли не совпадают')
      return
    }

    if (!agreeToTerms) {
      alert('Необходимо согласиться с условиями использования')
      return
    }

    // Simulate API call
    setTimeout(() => {
      alert('Аккаунт успешно создан!')
      router.push('/dashboard')
    }, 1000)
  }

  const handleGoogleSignUp = () => {
    // Implement Google sign-up logic
    console.log('Google sign-up clicked')
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