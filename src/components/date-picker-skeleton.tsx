"use client"

import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

export function DatePickerSkeleton() {
  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <div className="p-3">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-24" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-5" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Day names */}
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={`day-${i}`} className="h-4 w-full" />
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={`date-${i}`} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
} 