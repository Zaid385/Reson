import { create } from 'zustand'
import { createPadSlice, PadSlice } from './slices/padSlice'
import { createBankSlice, BankSlice } from './slices/bankSlice'
import { createUiSlice, UiSlice } from './slices/uiSlice'
import { createEngineUiSlice, EngineUiSlice } from './slices/engineUiSlice'

export type StoreState = PadSlice & BankSlice & UiSlice & EngineUiSlice

export const useStore = create<StoreState>()((...a) => ({
  ...createPadSlice(...a),
  ...createBankSlice(...a),
  ...createUiSlice(...a),
  ...createEngineUiSlice(...a),
}))
