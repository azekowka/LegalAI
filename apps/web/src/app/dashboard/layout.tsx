"use client"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"

function ThemeToggleButton() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <ModeToggle />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="overflow-auto">
        <ThemeToggleButton />
        <div className="pt-16">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}