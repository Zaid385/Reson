import React from 'react'
import { EffectModuleProps } from '../types'
import { FXModule } from '../../components/FXModule'
import { FXSelect } from '../../components/FXSelect'
import { KnobControl } from '@components/controls'

export const FilterModule: React.FC<EffectModuleProps> = ({ padData, onChange }) => {
  return (
    <FXModule 
      title="Filter" 
      enabled={padData.filterEnabled}
      onToggle={(enabled) => onChange({ filterEnabled: enabled })}
      onReset={() => onChange({ filterEnabled: false, filterType: 'lowpass', filterFrequency: 20000, filterResonance: 0 })}
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        <FXSelect
          label="Type"
          value={padData.filterType}
          options={[
            { label: 'Low Pass', value: 'lowpass' },
            { label: 'High Pass', value: 'highpass' },
            { label: 'Band Pass', value: 'bandpass' }
          ]}
          onChange={(val) => onChange({ filterType: val })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <KnobControl 
          label="Cutoff" 
          value={padData.filterFrequency} 
          min={20} max={20000} step={100} unit="Hz"
          onChange={(val) => onChange({ filterFrequency: val })}
        />
        <KnobControl 
          label="Resonance" 
          value={padData.filterResonance} 
          min={0} max={20} step={0.1} unit="Q"
          onChange={(val) => onChange({ filterResonance: val })}
        />
      </div>
    </FXModule>
  )
}
