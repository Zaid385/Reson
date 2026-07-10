import React from 'react'
import { EffectModuleProps } from '../types'
import { FXModule } from '../../components/FXModule'
import { KnobControl } from '@components/controls'

export const BitcrusherModule: React.FC<EffectModuleProps> = ({ padData, onChange }) => {
  return (
    <FXModule 
      title="Bitcrusher" 
      enabled={padData.bitcrusherEnabled}
      onToggle={(enabled) => onChange({ bitcrusherEnabled: enabled })}
      onReset={() => onChange({ bitcrusherEnabled: false, bitcrusherDepth: 8, bitcrusherMix: 1, bitcrusherSampleRate: 44100 })}
    >
      <div className="grid grid-cols-2 gap-4">
        <KnobControl 
          label="Bits" 
          value={padData.bitcrusherDepth} 
          min={1} max={16} step={1} unit="bits"
          onChange={(val) => onChange({ bitcrusherDepth: val })}
        />
        <KnobControl 
          label="Mix" 
          value={padData.bitcrusherMix} 
          min={0} max={1} step={0.01} unit=""
          onChange={(val) => onChange({ bitcrusherMix: val })}
        />
      </div>
    </FXModule>
  )
}
