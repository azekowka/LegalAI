'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SignInPage, type Testimonial } from "./sign-in";
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

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

const SignInPageDemo = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: '/dashboard'
      });

      if (error) {
        toast.error(error.message || 'Ошибка входа');
        return;
      }

      if (data) {
        toast.success('Успешный вход!');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Произошла ошибка при входе');
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard'
      });

      if (error) {
        toast.error(error.message || 'Ошибка входа через Google');
        return;
      }
    } catch (error) {
      toast.error('Произошла ошибка при входе через Google');
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = () => {
    // TODO: Implement password reset functionality
    toast.info("Функция сброса пароля будет доступна в ближайшее время");
  }

  const handleCreateAccount = () => {
    router.push('/sign-up')
  }

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={sampleTestimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
};

export default SignInPageDemo;