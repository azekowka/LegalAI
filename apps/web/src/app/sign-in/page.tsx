'use client'
import { useRouter } from 'next/navigation'
import { SignInPage, type Testimonial } from "./sign-in";

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

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sign In submitted:", data);
    // Simulate login and redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  };

  const handleGoogleSignIn = () => {
    console.log("Continue with Google clicked");
    // Simulate Google login and redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  };
  
  const handleResetPassword = () => {
    alert("Reset Password clicked");
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