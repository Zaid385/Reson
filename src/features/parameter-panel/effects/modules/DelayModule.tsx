import React from 'react'
import { EffectModuleProps } from '../types'
import { FXModule } from '../../components/FXModule'
import { KnobControl } from '@components/controls'

export const DelayModule: React.FC<EffectModuleProps> = ({ padData, onChange }) => {
  return (
    <FXModule 
      title="Delay" 
      enabled={padData.delayEnabled}
      onToggle={(enabled) => onChange({ delayEnabled: enabled })}
      onReset={() => onChange({ delayEnabled: false, delayTime: 0.25, delayFeedback: 0.4, delayWet: 0.5, delayDry: 1 })}
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        <KnobControl 
          label="Time" 
          value={padData.delayTime} 
          min={0.01} max={1} step={0.01} unit="s"
          onChange={(val) => onChange({ delayTime: val })}
        />
        <KnobControl 
          label="Feedback" 
          value={padData.delayFeedback} 
          min={0} max={1} step={0.01} unit=""
          onChange={(val) => onChange({ delayFeedback: val })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <KnobControl 
          label="Wet" 
          value={padData.delayWet} 
          min={0} max={1} step={0.01} unit=""
          onChange={(val) => onChange({ delayWet: val })}
        />
        <KnobControl 
          label="Dry" 
          value={padData.delayDry} 
          min={0} max={1} step={0.01} unit=""
          onChange={(val) => onChange({ delayDry: val })}
        />
      </div>
    </FXModule>
  )
}
