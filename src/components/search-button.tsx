"use client"

import { Search } from "lucide-react"
import { SidebarMenuButton } from "./ui/sidebar"
import { useCommand } from "@/hooks/use-command"

export function SearchButton() {
  const { setOpen } = useCommand()

  return (
    <SidebarMenuButton
      onClick={() => setOpen(true)}
      className="w-full justify-between"
    >
      <div className="flex items-center">
        <Search className="h-5 w-5 mr-2" />
        <span className="truncate font-medium">Search</span>
      </div>
      <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </SidebarMenuButton>
  )
} 