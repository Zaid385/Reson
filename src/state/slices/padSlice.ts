import { StateCreator } from 'zustand'
import { StoreState } from '../store'
import { PadData } from '@types/models'

export interface PadSlice {
  pads: Record<string, PadData>
  getPad: (bankId: string, slotIndex: number) => PadData | undefined
  updatePad: (id: string, updates: Partial<PadData>) => void
  _initPads: (pads: PadData[]) => void
}

export const createPadSlice: StateCreator<StoreState, [], [], PadSlice> = (set, get) => ({
  pads: {},
  getPad: (bankId, slotIndex) => {
    const id = `${bankId}:${slotIndex}`
    return get().pads[id]
  },
  updatePad: (id, updates) => set((state) => ({
    pads: {
      ...state.pads,
      [id]: { ...state.pads[id], ...updates }
    }
  })),
  _initPads: (padsList) => {
    const padsMap: Record<string, PadData> = {}
    padsList.forEach(p => padsMap[p.id] = p)
    set({ pads: padsMap })
  }
})
