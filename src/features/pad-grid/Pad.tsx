import React from 'react'
import { useStore } from '@state/store'
import { PadWaveformThumbnail } from './PadWaveformThumbnail'
import { PadBadge } from './PadBadge'

interface PadProps {
  bankId: string
  slotIndex: number
}

const keyMapLabels = [
  '1','2','3','4','5','6','7','8',
  'Q','W','E','R','T','Y','U','I',
  'A','S','D','F','G','H','J','K',
  'Z','X','C','V','B','N','M',','
]

export const Pad: React.FC<PadProps> = ({ bankId, slotIndex }) => {
  const padId = `${bankId}:${slotIndex}`
  
  const padData = useStore(state => state.pads[padId])
  const isTriggered = useStore(state => !!state.triggeredPads[padId])
  const isSelected = useStore(state => state.selectedPadId === padId)
  const selectPad = useStore(state => state.selectPad)

  const keyLabel = keyMapLabels[slotIndex] || ''

  if (!padData) return null

  const isEmpty = !padData.assetId
  const categoryColor = padData.color || '#00F0FF'

  const borderClass = isEmpty ? 'border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]' : 'border-2'
  const scaleClass = isTriggered ? 'scale-[0.95]' : 'scale-100 shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
  const ringClass = isSelected ? 'ring-2 ring-[var(--accent-cyan)] ring-offset-2 ring-offset-[var(--bg-base)]' : ''

  const dynamicStyles: React.CSSProperties = {
    borderColor: !isEmpty ? categoryColor : undefined,
    backgroundColor: !isEmpty 
      ? (isTriggered ? categoryColor : `${categoryColor}1A`) 
      : undefined,
    boxShadow: isTriggered && !isEmpty ? `inset 0 4px 8px rgba(0,0,0,0.4), 0 0 16px ${categoryColor}` : undefined,
    transitionDuration: isTriggered ? '0ms' : '150ms'
  }

  return (
    <div 
      className={`relative w-full aspect-square rounded-lg flex flex-col justify-between p-2 cursor-pointer transition-all select-none ${borderClass} ${scaleClass} ${ringClass}`}
      style={dynamicStyles}
      data-pad-id={padId}
      onClick={() => selectPad(padId)}
    >
      <div className="flex justify-between w-full z-10 pointer-events-none">
        <span className={`text-xs font-mono font-medium ${isEmpty ? 'text-[var(--text-disabled)]' : 'text-[var(--text-secondary)]'}`}>
          {keyLabel}
        </span>
        {!isEmpty && (padData.mute || padData.solo) && (
          <PadBadge state={padData.mute ? 'mute' : 'solo'} />
        )}
      </div>

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <span className="text-2xl text-[var(--text-disabled)]">+</span>
        </div>
      )}

      {!isEmpty && (
        <PadWaveformThumbnail color={categoryColor} peaks={[]} />
      )}

      <div className="flex justify-between items-end w-full z-10 pointer-events-none">
        {!isEmpty && (
          <span className="text-xs font-mono font-medium truncate max-w-[80%]"
                style={{ color: isTriggered ? '#000' : 'var(--text-primary)' }}>
            {padData.displayName}
          </span>
        )}
        {!isEmpty && (
          <span className="text-[10px]" style={{ color: isTriggered ? '#000' : categoryColor }}>
            {padData.playMode === 'oneshot' ? '▶' : '⊓'}
          </span>
        )}
      </div>
    </div>
  )
}
