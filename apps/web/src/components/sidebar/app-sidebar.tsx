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
import { FlameIcon } from "@/components/icons/flame-icon"
import { ClockIcon } from "@/components/icons/clock-icon"
import { UsersIcon } from "@/components/icons/users-icon"
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
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Азиз",
    email: "aziz@legal.ai",
    avatar: "/avatars/shadcn.jpg",
  },
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
      title: "Шаблоны",
      url: "/dashboard/templates",
      icon: LayoutPanelTopIcon,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain as unknown as React.ComponentProps<typeof NavMain>['items']} />
        {/* TODO: Временно скрыто - раздел "Проекты" для будущего использования */}
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
