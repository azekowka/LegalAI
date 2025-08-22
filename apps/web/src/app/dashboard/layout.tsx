"use client"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"

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
      state === "expanded" ? "ml-64" : "ml-12"
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
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  )
}