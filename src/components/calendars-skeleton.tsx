"use client"

import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function CalendarsSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <Skeleton className="h-4 w-24" />
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {Array.from({ length: 3 }).map((_, groupIndex) => (
            <div key={groupIndex} className="space-y-3 mb-4">
              <Skeleton className="h-4 w-20" />
              <div className="pl-4 space-y-2">
                {Array.from({ length: 3 }).map((_, itemIndex) => (
                  <SidebarMenuItem key={`${groupIndex}-${itemIndex}`}>
                    <Skeleton className="h-4 w-full" />
                  </SidebarMenuItem>
                ))}
              </div>
            </div>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
} 