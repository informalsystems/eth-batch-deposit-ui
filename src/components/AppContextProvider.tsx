"use client"

import { ReactNode, createContext } from "react"

export interface SiteContextObject {}

export interface MediaDescriptor {
  description: string
  height: number
  title: string
  url: string
  width: number
}

export const SiteContext = createContext<SiteContextObject>({
  spotCopy: {},
})

export function AppContextProvider({ children }: { children: ReactNode }) {
  return <SiteContext value={{}}>{children}</SiteContext>
}
