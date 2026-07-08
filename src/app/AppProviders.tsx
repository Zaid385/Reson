import { ReactNode } from 'react'

export function AppProviders({ children }: { children: ReactNode }) {
  // Setup Zustand providers or context providers if any in the future
  return <>{children}</>
}
