import { EffectConfig } from './types'
import { FilterModule } from './modules/FilterModule'
import { DriveModule } from './modules/DriveModule'
import { BitcrusherModule } from './modules/BitcrusherModule'
import { CompressorModule } from './modules/CompressorModule'
import { DelayModule } from './modules/DelayModule'
import { ReverbModule } from './modules/ReverbModule'
import { ReverseModule } from './modules/ReverseModule'
import { EnvelopeModule } from './modules/EnvelopeModule'

export const effectRegistry: EffectConfig[] = [
  {
    id: 'envelope',
    name: 'Envelope',
    defaultExpanded: true,
    hasToggle: false,
    component: EnvelopeModule
  },
  {
    id: 'filter',
    name: 'Filter',
    defaultExpanded: false,
    hasToggle: true,
    component: FilterModule
  },
  {
    id: 'drive',
    name: 'Drive',
    defaultExpanded: false,
    hasToggle: true,
    component: DriveModule
  },
  {
    id: 'bitcrusher',
    name: 'Bitcrusher',
    defaultExpanded: false,
    hasToggle: true,
    component: BitcrusherModule
  },
  {
    id: 'compressor',
    name: 'Compressor',
    defaultExpanded: false,
    hasToggle: true,
    component: CompressorModule
  },
  {
    id: 'delay',
    name: 'Delay',
    defaultExpanded: false,
    hasToggle: true,
    component: DelayModule
  },
  {
    id: 'reverb',
    name: 'Reverb',
    defaultExpanded: false,
    hasToggle: true,
    component: ReverbModule
  },
  {
    id: 'reverse',
    name: 'Reverse',
    defaultExpanded: false,
    hasToggle: true,
    component: ReverseModule
  }
]
