import { StateCreator } from 'zustand'
import { StoreState } from '../store'

export interface UiSlice {
  selectedPadId: string | null
  isSampleBrowserOpen: boolean
  isParamPanelOpen: boolean
  activeModal: 'sampleEditor' | 'settings' | 'confirm' | 'shortcuts' | null
  
  selectPad: (padId: string | null) => void
  toggleSampleBrowser: () => void
  toggleParamPanel: () => void
  openModal: (modalName: 'sampleEditor' | 'settings' | 'confirm' | 'shortcuts', contextId?: string) => void
  closeModal: () => void
}

export const createUiSlice: StateCreator<StoreState, [], [], UiSlice> = (set) => ({
  selectedPadId: null,
  isSampleBrowserOpen: true,
  isParamPanelOpen: true,
  activeModal: null,

  selectPad: (padId) => set({ selectedPadId: padId }),
  toggleSampleBrowser: () => set((state) => ({ isSampleBrowserOpen: !state.isSampleBrowserOpen })),
  toggleParamPanel: () => set((state) => ({ isParamPanelOpen: !state.isParamPanelOpen })),
  openModal: (modalName, contextId) => set({ activeModal: modalName, ...(contextId && modalName === 'sampleEditor' ? { selectedPadId: contextId } : {}) }),
  closeModal: () => set({ activeModal: null })
})
