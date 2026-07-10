import { StateCreator } from 'zustand'
import { StoreState } from '../store'

export interface EngineUiSlice {
  triggeredPads: Record<string, boolean>
  setPadTriggered: (padId: string, triggered: boolean) => void
  isPadTriggered: (padId: string) => boolean
  activeVoices: number
  setActiveVoices: (count: number) => void
}

export const createEngineUiSlice: StateCreator<StoreState, [], [], EngineUiSlice> = (set, get) => ({
  triggeredPads: {},
  setPadTriggered: (padId, triggered) => set((state) => ({
    triggeredPads: {
      ...state.triggeredPads,
      [padId]: triggered
    }
  })),
  isPadTriggered: (padId) => !!get().triggeredPads[padId],
  activeVoices: 0,
  setActiveVoices: (count) => set({ activeVoices: count })
})
