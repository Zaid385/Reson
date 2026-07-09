import { create } from 'zustand'
import { createPadSlice, PadSlice } from './slices/padSlice'
import { createBankSlice, BankSlice } from './slices/bankSlice'
import { createUiSlice, UiSlice } from './slices/uiSlice'
import { createEngineUiSlice, EngineUiSlice } from './slices/engineUiSlice'

import { createProjectSlice, ProjectSlice } from './slices/projectSlice'
import { createSettingsSlice, SettingsSlice } from './slices/settingsSlice'

export type StoreState = PadSlice & BankSlice & UiSlice & EngineUiSlice & ProjectSlice & SettingsSlice

export const useStore = create<StoreState>()((...a) => ({
  ...createPadSlice(...a),
  ...createBankSlice(...a),
  ...createUiSlice(...a),
  ...createEngineUiSlice(...a),
  ...createProjectSlice(...a),
  ...createSettingsSlice(...a),
}))
