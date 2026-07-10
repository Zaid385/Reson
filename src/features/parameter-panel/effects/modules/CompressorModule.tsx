import React from 'react'
import { EffectModuleProps } from '../types'
import { FXModule } from '../../components/FXModule'
import { KnobControl } from '@components/controls'

export const CompressorModule: React.FC<EffectModuleProps> = ({ padData, onChange }) => {
  return (
    <FXModule 
      title="Compressor" 
      enabled={padData.compressorEnabled}
      onToggle={(enabled) => onChange({ compressorEnabled: enabled })}
      onReset={() => onChange({ compressorEnabled: false, compressorThreshold: -24, compressorRatio: 4, compressorMix: 1 })}
    >
      <div className="grid grid-cols-2 gap-4">
        <KnobControl 
          label="Thresh" 
          value={padData.compressorThreshold} 
          min={-60} max={0} step={1} unit="dB"
          onChange={(val) => onChange({ compressorThreshold: val })}
        />
        <KnobControl 
          label="Ratio" 
          value={padData.compressorRatio} 
          min={1} max={20} step={0.5} unit=":1"
          onChange={(val) => onChange({ compressorRatio: val })}
        />
      </div>
    </FXModule>
  )
}
