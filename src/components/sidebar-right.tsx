"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { Calendars } from "@/components/calendars"
import { CalendarsSkeleton } from "@/components/calendars-skeleton"
import { DatePicker } from "@/components/date-picker"
import { DatePickerSkeleton } from "@/components/date-picker-skeleton"
import { LoginButton } from "@/components/login-button"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { useUser } from "@clerk/nextjs"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronsUpDown } from "lucide-react"

// This is sample data.
const data = {
  calendars: [
    {
      name: "My Calendars",
      items: ["Personal", "Work", "Family"],
    },
    {
      name: "Favorites",
      items: ["Holidays", "Birthdays"],
    },
    {
      name: "Other",
      items: ["Travel", "Reminders", "Deadlines"],
    },
  ],
}

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { isLoggedIn } = useAuth()
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser()
  const { supabaseUser, loading: isSupabaseLoading } = useSupabaseUser()
  
  // Track whether we're in the process of logging out
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  
  // Consider user data loading if either Clerk or Supabase data is loading
  // Don't show loading state if we're logging out
  const isUserLoading = !isLoggingOut && (isSupabaseLoading || !isClerkLoaded)

  // State for selected date
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)

  // State for checked calendars
  const [checked, setChecked] = React.useState(() => {
    const initial: Record<string, Record<string, boolean>> = {}
    data.calendars.forEach(group => {
      initial[group.name] = {}
      group.items.forEach(item => {
        initial[group.name][item] = true // default to checked
      })
    })
    return initial
  })

  // Handler for toggling calendar items
  const handleToggle = (group: string, item: string) => {
    setChecked(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [item]: !prev[group][item],
      },
    }))
  }

  // Create user data object from Supabase or fallback to Clerk
  const getUserData = () => {
    if (supabaseUser) {
      // Use Supabase data with fallbacks to Clerk data
      return {
        name: `${supabaseUser.first_name || ''} ${supabaseUser.last_name || ''}`.trim() || 
              clerkUser?.firstName || 'User',
        email: supabaseUser.email || clerkUser?.primaryEmailAddress?.emailAddress || '',
        avatar: supabaseUser.image_url || clerkUser?.imageUrl || '',
      }
    }
    
    // If Supabase data isn't available yet, use Clerk data
    return clerkUser ? {
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      avatar: clerkUser.imageUrl,
    } : {
      name: 'User',
      email: '',
      avatar: '',
    }
  }

  // User profile skeleton for loading state
  const UserProfileSkeleton = () => (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="pointer-events-none"
        >
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="grid flex-1 text-left gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <ChevronsUpDown className="ml-auto size-4 opacity-30" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )

  // Get cached user data to show during logout
  const cachedUserData = React.useMemo(() => {
    return getUserData();
  }, [supabaseUser, clerkUser, getUserData]);

  return (
    <Sidebar
      side="right"
      collapsible="none"
      className="fixed right-0 top-0 hidden h-screen w-64 border-l lg:flex flex-col"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b flex-shrink-0">
        {isLoggedIn ? (
          isUserLoading ? (
            <UserProfileSkeleton />
          ) : (
            <NavUser user={cachedUserData} onLogoutStart={() => setIsLoggingOut(true)} />
          )
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <LoginButton />
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden !scrollbar-width-none !-ms-overflow-style-none hide-scrollbar">
        {isLoggedIn ? (
          <DatePicker selected={selectedDate} onSelect={setSelectedDate} />
        ) : (
          <DatePickerSkeleton />
        )}
        <SidebarSeparator className="mx-0" />
        {isLoggedIn ? (
          <Calendars calendars={data.calendars} checked={checked} onToggle={handleToggle} />
        ) : (
          <CalendarsSkeleton />
        )}
      </SidebarContent>
      <SidebarFooter className="flex-shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
