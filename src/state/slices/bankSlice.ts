import { StateCreator } from 'zustand'
import { StoreState } from '../store'
import { BankData } from '@types/models'

export interface BankSlice {
  banks: BankData[]
  activeBankId: string | null
  setActiveBank: (bankId: string) => void
  _initBanks: (banks: BankData[], activeId: string) => void
}

export const createBankSlice: StateCreator<StoreState, [], [], BankSlice> = (set) => ({
  banks: [],
  activeBankId: null,
  setActiveBank: (bankId) => set({ activeBankId: bankId }),
  _initBanks: (banks, activeId) => set({ banks, activeBankId: activeId })
})
