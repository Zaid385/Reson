import { create } from 'zustand'

interface StatusState {
  appStatus: string
  contextMessage: string | null
  setAppStatus: (msg: string) => void
  setContextMessage: (msg: string | null) => void
}

export const useStatusStore = create<StatusState>((set) => ({
  appStatus: 'Ready',
  contextMessage: null,
  setAppStatus: (appStatus) => set({ appStatus }),
  setContextMessage: (contextMessage) => set({ contextMessage })
}))
