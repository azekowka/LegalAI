"use client"

import * as React from "react"
import {
  AudioWaveform,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
} from "lucide-react"
import { LayoutPanelTopIcon } from "@/components/icons/layout-panel-top-icon"
import { DeleteIcon } from "@/components/icons/delete"
import { FoldersIcon } from "@/components/icons/folders-icon"
import { FileTextIcon } from "@/components/icons/file-text-icon";
import { FlameIcon } from "@/components/icons/flame-icon";
import { ClockIcon } from "@/components/icons/clock-icon";
import { UsersIcon } from "@/components/icons/users-icon";
import { NavMain } from "@/components/sidebar/nav-main"
import { NavProjects } from "@/components/sidebar/nav-projects"
import { NavUser } from "@/components/sidebar/nav-user"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { useAuthSession } from "@/components/auth-provider"
import { MessageCircleMoreIcon } from "@/components/icons/message-circle-more"
// Static data that doesn't depend on user
const staticData = {
  teams: [
    {
      name: "Legal AI",
      logo: GalleryVerticalEnd,
      plan: "Организация",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Организация",
    },
  ],
  navMain: [
    {
      title: "Мои документы",
      url: "/dashboard",
      icon: FileTextIcon,
    },
    {
      title: "ИИ-чат с юристом",
      url: "/dashboard/chat",
      icon: MessageCircleMoreIcon,
    },
    {
      title: "Шаблоны",
      url: "/dashboard/templates",
      icon: LayoutPanelTopIcon,
      badge: "Beta",
    },
    {
      title: "Избранное",
      url: "/dashboard/starred",
      icon: FlameIcon,
    },
    {
      title: "Поделились со мной",
      url: "/dashboard/shared",
      icon: UsersIcon,
    },
        {
      title: "Недавние",
      url: "/dashboard/recent",
      icon: ClockIcon,
    },
    {
      title: "Корзина",
      url: "/dashboard/garbage",
      icon: DeleteIcon,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

function SidebarToggleButton() {
  const { toggleSidebar } = useSidebar()
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={toggleSidebar} tooltip="Скрыть панель">
          <PanelLeft />
          <span>Скрыть панель</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading, isAuthenticated } = useAuthSession();

  // Sidebar доступен только для аутентифицированных пользователей
  if (!isAuthenticated || !user) {
    return null
  }

  // Используем только реальные данные пользователя
  const currentUser = {
    name: user.name || 'Пользователь',
    email: user.email || '',
    avatar: user.image || undefined
  }

  return (
    <Sidebar collapsible="icon" className="group-data-[collapsible=icon]:w-12" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={staticData.teams} />
        <SidebarToggleButton />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain as unknown as React.ComponentProps<typeof NavMain>['items']} />
        {/* TODO: Временно скрыто - раздел "Проекты" для будущего использования */}
        {/* <NavProjects projects={staticData.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Загрузка...
          </div>
        ) : (
          <NavUser user={currentUser} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
