"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuthSession } from "@/components/auth-provider"

function ThemeToggleButton() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <ModeToggle />
    </div>
  )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar()
  
  return (
    <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${
      state === "expanded" ? "ml-56" : "ml-12"
    }`}>
      <ThemeToggleButton />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuthSession()
  const router = useRouter()

  // Перенаправляем неаутентифицированных пользователей на страницу входа
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/sign-in')
    }
  }, [isAuthenticated, isLoading, router])

  // Показываем загрузку пока проверяем аутентификацию
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Если пользователь не аутентифицирован, не показываем дашборд
  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  )
}