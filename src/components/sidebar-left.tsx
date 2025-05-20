"use client"

import * as React from "react"
import {
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { NavFavorites } from "@/components/nav-favorites"
import { NavFavoritesSkeleton } from "@/components/nav-favorites-skeleton"
import { NavMain } from "@/components/nav-main"
import { NavMainSkeleton } from "@/components/nav-main-skeleton"
import { NavSecondary } from "@/components/nav-secondary"
import { NavWorkspaces } from "@/components/nav-workspaces"
import { SearchButton } from "@/components/search-button"
import { TeamSwitcher } from "@/components/team-switcher"
import { useAuth } from "@/hooks/use-auth"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: Command,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Ask AI",
      url: "#",
      icon: Sparkles,
    },
    {
      title: "Home",
      url: "#",
      icon: Home,
      isActive: true,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
      badge: "10",
    },
  ],
  navSecondary: [
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Templates",
      url: "#",
      icon: Blocks,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
  favorites: [
    {
      name: "Getting Started",
      url: "#",
      emoji: "🚀",
    },
    {
      name: "Documentation",
      url: "#",
      emoji: "📚",
    },
    {
      name: "Support",
      url: "#",
      emoji: "💬",
    },
  ],
  workspaces: [
    {
      name: "Personal Life Management",
      emoji: "🏠",
      pages: [
        {
          name: "Daily Journal & Reflection",
          url: "#",
          emoji: "📔",
        },
        {
          name: "Health & Wellness Tracker",
          url: "#",
          emoji: "🍏",
        },
        {
          name: "Personal Growth & Learning Goals",
          url: "#",
          emoji: "🌟",
        },
      ],
    },
    {
      name: "Professional Development",
      emoji: "💼",
      pages: [
        {
          name: "Career Objectives & Milestones",
          url: "#",
          emoji: "🎯",
        },
        {
          name: "Skill Acquisition & Training Log",
          url: "#",
          emoji: "🧠",
        },
        {
          name: "Networking Contacts & Events",
          url: "#",
          emoji: "🤝",
        },
      ],
    },
    {
      name: "Creative Projects",
      emoji: "🎨",
      pages: [
        {
          name: "Writing Ideas & Story Outlines",
          url: "#",
          emoji: "✍️",
        },
        {
          name: "Art & Design Portfolio",
          url: "#",
          emoji: "🖼️",
        },
        {
          name: "Music Composition & Practice Log",
          url: "#",
          emoji: "🎵",
        },
      ],
    },
    {
      name: "Home Management",
      emoji: "🏡",
      pages: [
        {
          name: "Household Budget & Expense Tracking",
          url: "#",
          emoji: "💰",
        },
        {
          name: "Home Maintenance Schedule & Tasks",
          url: "#",
          emoji: "🔧",
        },
        {
          name: "Family Calendar & Event Planning",
          url: "#",
          emoji: "📅",
        },
      ],
    },
    {
      name: "Travel & Adventure",
      emoji: "🧳",
      pages: [
        {
          name: "Trip Planning & Itineraries",
          url: "#",
          emoji: "🗺️",
        },
        {
          name: "Travel Bucket List & Inspiration",
          url: "#",
          emoji: "🌎",
        },
        {
          name: "Travel Photos & Memories",
          url: "#",
          emoji: "📸",
        },
      ],
    },
  ],
}

export function SidebarLeft() {
  const { isLoggedIn } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader>
        {isLoggedIn ? (
          <TeamSwitcher teams={data.teams} />
        ) : (
          <div className="flex items-center gap-2 h-10">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="hide-scrollbar">
        <SidebarMenu>
          <SidebarMenuItem>
            {isLoggedIn ? (
              <SearchButton />
            ) : (
              <Skeleton className="h-8 w-full rounded" />
            )}
          </SidebarMenuItem>
        </SidebarMenu>
        {isLoggedIn ? (
          <>
            <NavMain items={data.navMain} />
            <NavFavorites favorites={data.favorites} />
            <NavSecondary items={data.navSecondary} />
          </>
        ) : (
          <>
            <NavMainSkeleton />
            <NavFavoritesSkeleton />
          </>
        )}
      </SidebarContent>
      <SidebarRail>
        {/* Avatar removed as requested */}
      </SidebarRail>
    </Sidebar>
  )
}
