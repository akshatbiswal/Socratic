"use client"

import { useEffect } from "react"
import { CommandPalette } from "@/components/command-palette"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useCommand } from "@/hooks/use-command"

export function CommandProvider() {
  const { open, setOpen } = useCommand()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, setOpen])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <CommandPalette />
      </DialogContent>
    </Dialog>
  )
} 