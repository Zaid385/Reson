import React from 'react'
import { PadData } from '@models/models'

export interface EffectModuleProps {
  padData: PadData
  onChange: (updates: Partial<PadData>) => void
}

export interface EffectConfig {
  id: string
  name: string
  defaultExpanded: boolean
  hasToggle: boolean
  component: React.FC<EffectModuleProps>
}
