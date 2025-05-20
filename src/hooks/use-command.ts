"use client"

import { create } from "zustand"

interface CommandStore {
  open: boolean
  setOpen: (open: boolean) => void
}

export const useCommand = create<CommandStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
})) 