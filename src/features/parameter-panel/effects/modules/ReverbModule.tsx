import React from 'react'
import { EffectModuleProps } from '../types'
import { FXModule } from '../../components/FXModule'
import { KnobControl } from '@components/controls'

export const ReverbModule: React.FC<EffectModuleProps> = ({ padData, onChange }) => {
  return (
    <FXModule 
      title="Reverb" 
      helpText="Adds ambience by simulating acoustic space."
      enabled={padData.reverbEnabled}
      onToggle={(enabled) => onChange({ reverbEnabled: enabled })}
      onReset={() => onChange({ reverbEnabled: false, reverbSize: 0.7, reverbDecay: 3, reverbWet: 0.5, reverbDry: 1 })}
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        <KnobControl 
          label="Size" 
          value={padData.reverbSize} 
          min={0.01} max={1} step={0.01} unit=""
          onChange={(val) => onChange({ reverbSize: val })}
        />
        <KnobControl 
          label="Decay" 
          value={padData.reverbDecay} 
          min={0.1} max={10} step={0.1} unit="s"
          onChange={(val) => onChange({ reverbDecay: val })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <KnobControl 
          label="Wet" 
          value={padData.reverbWet} 
          min={0} max={1} step={0.01} unit=""
          onChange={(val) => onChange({ reverbWet: val })}
        />
        <KnobControl 
          label="Dry" 
          value={padData.reverbDry} 
          min={0} max={1} step={0.01} unit=""
          onChange={(val) => onChange({ reverbDry: val })}
        />
      </div>
    </FXModule>
  )
}
