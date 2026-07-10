import React from 'react'
import { EffectModuleProps } from '../types'
import { FXModule } from '../../components/FXModule'
import { useAsset } from '@hooks/useAsset'
import { PadWaveformThumbnail } from '@features/pad-grid/PadWaveformThumbnail'

export const ReverseModule: React.FC<EffectModuleProps> = ({ padData, onChange }) => {
  const asset = useAsset(padData.assetId || null)
  return (
    <FXModule 
      title="Reverse" 
      enabled={padData.reverse}
      onToggle={(enabled) => onChange({ reverse: enabled })}
      onReset={() => onChange({ reverse: false })}
    >
      <div className={`relative w-full h-10 rounded-md overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)]/30 transition-transform duration-300 ${padData.reverse ? 'scale-x-[-1]' : ''}`}>
        {asset && asset.waveformPeaksLow && asset.waveformPeaksLow.length > 0 ? (
          <PadWaveformThumbnail color={padData.color || 'var(--accent-cyan)'} peaks={asset.waveformPeaksLow} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-[10px]">
            No Sample
          </div>
        )}
      </div>
    </FXModule>
  )
}
