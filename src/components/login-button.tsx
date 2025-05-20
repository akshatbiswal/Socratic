"use client"

import { LogIn, ChevronsUpDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { SidebarMenuButton } from "./ui/sidebar"

export function LoginButton() {
  const router = useRouter()

  const navigateToLogin = () => {
    router.push('/login')
  }

  return (
    <SidebarMenuButton
      size="lg"
      onClick={navigateToLogin}
      className="w-full justify-between"
    >
      <div className="flex items-center">
        <LogIn className="h-5 w-5 mr-2" />
        <span className="truncate font-medium">Sign In</span>
      </div>
      <ChevronsUpDown className="ml-auto size-4" />
    </SidebarMenuButton>
  )
} 