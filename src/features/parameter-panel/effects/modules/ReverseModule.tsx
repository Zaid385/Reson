import React from 'react'
import { EffectModuleProps } from '../types'
import { FXModule } from '../../components/FXModule'

export const ReverseModule: React.FC<EffectModuleProps> = ({ padData, onChange }) => {
  return (
    <FXModule 
      title="Reverse" 
      enabled={padData.reverse}
      onToggle={(enabled) => onChange({ reverse: enabled })}
      onReset={() => onChange({ reverse: false })}
    >
      <div className="text-center text-[var(--text-muted)] text-xs p-2">
        Playback is {padData.reverse ? 'reversed' : 'forward'}.
      </div>
    </FXModule>
  )
}
