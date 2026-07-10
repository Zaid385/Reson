import React from 'react'
import { EffectModuleProps } from '../types'
import { FXModule } from '../../components/FXModule'
import { KnobControl } from '@components/controls'

export const EnvelopeModule: React.FC<EffectModuleProps> = ({ padData, onChange }) => {
  return (
    <FXModule 
      title="Envelope" 
      hasToggle={false}
      defaultExpanded={true}
      onReset={() => onChange({ attackMs: 0, decayMs: 0, sustainLevel: 1, releaseMs: 50 })}
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        <KnobControl 
          label="Attack" 
          value={padData.attackMs} 
          min={0} max={2000} step={10} unit="ms"
          onChange={(val) => onChange({ attackMs: val })}
        />
        <KnobControl 
          label="Decay" 
          value={padData.decayMs} 
          min={0} max={2000} step={10} unit="ms"
          onChange={(val) => onChange({ decayMs: val })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <KnobControl 
          label="Sustain" 
          value={padData.sustainLevel} 
          min={0} max={1} step={0.01} unit=""
          onChange={(val) => onChange({ sustainLevel: val })}
        />
        <KnobControl 
          label="Release" 
          value={padData.releaseMs} 
          min={0} max={5000} step={10} unit="ms"
          onChange={(val) => onChange({ releaseMs: val })}
        />
      </div>
    </FXModule>
  )
}
