"use client"

import * as React from "react"
import { useState } from "react"
import {
  AudioWaveform,
  BarChart3,
  Box,
  ChevronDown,
  ChevronRight,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Plus,
  Search,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { TeamSwitcher } from "@/components/team-switcher"
import { useAuth } from "@/hooks/use-auth"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Updated data structure with better organization
const data = {
  teams: [
    {
      name: "Socratic",
      logo: Command,
      plan: "Pro",
    },
    {
      name: "Personal",
      logo: AudioWaveform,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Ask AI",
      url: "#",
      icon: Sparkles,
      isActive: false,
      badge: "New"
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
      badge: "3",
    },
  ],
  quickActions: [
    {
      title: "Search",
      url: "#",
      icon: Search,
      shortcut: "⌘K",
    },
    {
      title: "Quick Add",
      url: "#",
      icon: Plus,
      shortcut: "⌘N",
    },
  ],
  workspaces: [
    {
      name: "Personal",
      emoji: "🏠",
      color: "bg-blue-500",
      pages: [
        { name: "Daily Tasks", url: "#", emoji: "✅" },
        { name: "Health & Wellness", url: "#", emoji: "🍏" },
        { name: "Learning Goals", url: "#", emoji: "🎯" },
      ],
    },
    {
      name: "Work",
      emoji: "💼",
      color: "bg-green-500",
      pages: [
        { name: "Projects", url: "#", emoji: "📊" },
        { name: "Meetings", url: "#", emoji: "🤝" },
        { name: "Documentation", url: "#", emoji: "📚" },
      ],
    },
    {
      name: "Creative",
      emoji: "🎨",
      color: "bg-purple-500",
      pages: [
        { name: "Design Ideas", url: "#", emoji: "✨" },
        { name: "Writing", url: "#", emoji: "✍️" },
        { name: "Music", url: "#", emoji: "🎵" },
      ],
    },
  ],
  tools: [
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3,
    },
    {
      title: "Integrations",
      url: "#",
      icon: Box,
    },
    {
      title: "Help & Support",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
}

export function SidebarLeft() {
  const { isLoggedIn } = useAuth()
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>(["Personal"])

  const toggleWorkspace = (workspaceName: string) => {
    setExpandedWorkspaces(prev => 
      prev.includes(workspaceName) 
        ? prev.filter(name => name !== workspaceName)
        : [...prev, workspaceName]
    )
  }

  if (!isLoggedIn) {
    return (
      <Sidebar className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r bg-sidebar">
        <SidebarHeader className="border-b border-sidebar-border h-16 flex items-center flex-shrink-0 px-4">
          <div className="flex items-center gap-2 h-10">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>
        </SidebarHeader>
        <SidebarContent 
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent',
          }}
        >
          <div className="space-y-4">
            <Skeleton className="h-8 w-full rounded" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded" />
              ))}
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r bg-sidebar z-40">
      <SidebarHeader className="border-b border-sidebar-border h-16 flex items-center flex-shrink-0 px-4">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      
      <SidebarContent 
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent',
        }}
      >
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-2">
            {data.quickActions.map((item) => (
              <div key={item.title}>
                <SidebarMenuButton asChild className="w-full">
                  <a href={item.url} className="group flex items-center gap-2 px-2 py-2 rounded-md hover:bg-sidebar-accent">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.shortcut && (
                      <span className="ml-auto text-xs text-sidebar-foreground/60 group-hover:text-sidebar-foreground">
                        {item.shortcut}
                      </span>
                    )}
                  </a>
                </SidebarMenuButton>
              </div>
            ))}
          </div>

          {/* Main Navigation */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-sidebar-foreground/60 px-2 py-1">Navigation</div>
            {data.navMain.map((item) => (
              <div key={item.title}>
                <SidebarMenuButton asChild className="w-full" isActive={item.isActive}>
                  <a href={item.url} className="group flex items-center gap-2 px-2 py-2 rounded-md hover:bg-sidebar-accent">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${
                        item.badge === "New" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-sidebar-accent text-sidebar-accent-foreground"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                </SidebarMenuButton>
              </div>
            ))}
          </div>

          {/* Workspaces */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-medium text-sidebar-foreground/60">Workspaces</span>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {data.workspaces.map((workspace) => (
              <div key={workspace.name} className="space-y-1">
                <Collapsible 
                  open={expandedWorkspaces.includes(workspace.name)}
                  onOpenChange={() => toggleWorkspace(workspace.name)}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full group flex items-center gap-2 px-2 py-2 rounded-md hover:bg-sidebar-accent">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-2 h-2 rounded-full ${workspace.color}`} />
                        <span className="text-lg">{workspace.emoji}</span>
                        <span className="flex-1">{workspace.name}</span>
                      </div>
                      {expandedWorkspaces.includes(workspace.name) ? (
                        <ChevronDown className="h-3 w-3 transition-transform" />
                      ) : (
                        <ChevronRight className="h-3 w-3 transition-transform" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-4">
                    {workspace.pages.map((page) => (
                      <div key={page.name}>
                        <SidebarMenuButton asChild className="w-full">
                          <a href={page.url} className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent text-sm">
                            <span className="text-sm">{page.emoji}</span>
                            <span className="text-sm">{page.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </div>
                    ))}
                    <div>
                      <SidebarMenuButton className="w-full text-sidebar-foreground/60 hover:text-sidebar-foreground flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent text-sm">
                        <Plus className="h-3 w-3" />
                        <span className="text-sm">Add page</span>
                      </SidebarMenuButton>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>

          {/* Tools & Settings */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-sidebar-foreground/60 px-2 py-1">Tools</div>
            {data.tools.map((item) => (
              <div key={item.title}>
                <SidebarMenuButton asChild className="w-full">
                  <a href={item.url} className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-sidebar-accent">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </div>
            ))}
          </div>
        </div>
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  )
}
