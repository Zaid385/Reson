import { StateCreator } from 'zustand'
import { StoreState } from '../store'
import { SettingsData } from '@models/models'
import { settingsRepository } from '@persistence/repositories/SettingsRepository'

export interface SettingsSlice {
  settings: SettingsData | null
  initSettings: (settings: SettingsData) => void
  updateSettings: (changes: Partial<SettingsData>) => void
}

export const createSettingsSlice: StateCreator<StoreState, [], [], SettingsSlice> = (set, get) => ({
  settings: null,
  initSettings: (settings) => set({ settings }),
  updateSettings: (changes) => {
    const current = get().settings
    if (current) {
      const next = { ...current, ...changes }
      set({ settings: next })
      // Fire-and-forget persistence update for settings immediately
      settingsRepository.updateSettings(current.projectId, changes).catch(console.error)
    }
  }
})
