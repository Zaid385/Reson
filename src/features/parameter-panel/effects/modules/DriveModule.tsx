import React from 'react'
import { EffectModuleProps } from '../types'
import { FXModule } from '../../components/FXModule'
import { KnobControl } from '@components/controls'

export const DriveModule: React.FC<EffectModuleProps> = ({ padData, onChange }) => {
  return (
    <FXModule 
      title="Drive" 
      enabled={padData.driveEnabled}
      onToggle={(enabled) => onChange({ driveEnabled: enabled })}
      onReset={() => onChange({ driveEnabled: false, driveAmount: 0, driveMix: 1, driveTone: 20000 })}
    >
      <div className="grid grid-cols-2 gap-4">
        <KnobControl 
          label="Amount" 
          value={padData.driveAmount} 
          min={0} max={1} step={0.01} unit=""
          onChange={(val) => onChange({ driveAmount: val })}
        />
        <KnobControl 
          label="Mix" 
          value={padData.driveMix} 
          min={0} max={1} step={0.01} unit=""
          onChange={(val) => onChange({ driveMix: val })}
        />
      </div>
    </FXModule>
  )
}
