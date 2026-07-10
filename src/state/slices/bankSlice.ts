import { StateCreator } from 'zustand'
import { StoreState } from '../store'
import { BankData } from '@models/models'

export interface BankSlice {
  banks: BankData[]
  activeBankId: string | null
  setActiveBank: (bankId: string) => void
  updateBank: (id: string, updates: Partial<BankData>) => void
  _initBanks: (banks: BankData[], activeId: string) => void
}

export const createBankSlice: StateCreator<StoreState, [], [], BankSlice> = (set) => ({
  banks: [],
  activeBankId: null,
  setActiveBank: (bankId) => set({ activeBankId: bankId }),
  updateBank: (id, updates) => set(state => ({
    banks: state.banks.map(b => b.id === id ? { ...b, ...updates } : b)
  })),
  _initBanks: (banks, activeId) => set({ banks, activeBankId: activeId })
})
