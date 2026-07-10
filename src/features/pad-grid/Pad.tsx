import React, { useState } from 'react'
import { useStore } from '@state/store'
import { PadWaveformThumbnail } from './PadWaveformThumbnail'
import { PadBadge } from './PadBadge'
import { useAsset } from '@hooks/useAsset'
import { sampleAssignmentService } from '@domain/sample-assignment/SampleAssignmentService'
import { showConfirmDialog } from '@utils/dialog'

interface PadProps {
  bankId: string
  slotIndex: number
}

import { KeyboardLabels } from '@state/keyMap'

export const Pad: React.FC<PadProps> = ({ bankId, slotIndex }) => {
  const padId = `${bankId}:${slotIndex}`
  
  const padData = useStore(state => state.pads[padId])
  const isTriggered = useStore(state => !!state.triggeredPads[padId])
  const isSelected = useStore(state => state.selectedPadId === padId)
  const selectPad = useStore(state => state.selectPad)

  const asset = useAsset(padData?.assetId || null)
  const [isDragOver, setIsDragOver] = useState(false)

  const keyboardLayout = useStore(state => state.settings?.keyboardLayout || 'qwerty')
  const keyMapLabels = KeyboardLabels[keyboardLayout] || KeyboardLabels.qwerty
  const keyLabel = keyMapLabels[slotIndex]

  if (!padData) return null

  const isEmpty = !padData.assetId
  const categoryColor = padData.color || '#00F0FF'

  const borderClass = isEmpty ? 'border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]' : 'border-2'
  const scaleClass = isTriggered ? 'scale-[0.95]' : 'scale-100 shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
  const ringClass = isSelected ? 'ring-2 ring-[var(--accent-cyan)] ring-offset-2 ring-offset-[var(--bg-base)]' : ''
  const dragClass = isDragOver ? 'ring-4 ring-[var(--accent-cyan)] opacity-80' : ''

  const dynamicStyles: React.CSSProperties = {
    borderColor: !isEmpty ? categoryColor : undefined,
    backgroundColor: !isEmpty 
      ? (isTriggered ? categoryColor : `${categoryColor}1A`) 
      : undefined,
    boxShadow: isTriggered && !isEmpty ? `inset 0 4px 8px rgba(0,0,0,0.4), 0 0 16px ${categoryColor}` : undefined,
    transitionDuration: isTriggered ? '0ms' : '150ms'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    // Check if it's a file drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (!isEmpty) {
        const confirmBeforeReplace = useStore.getState().settings?.confirmBeforeReplace ?? true
        if (confirmBeforeReplace) {
          const confirmed = await showConfirmDialog({
            title: 'Replace Sample',
            message: `Are you sure you want to replace the sample on Pad ${keyLabel}?`,
            confirmText: 'Replace',
            isDanger: true
          })
          if (!confirmed) return
        }
      }
      await sampleAssignmentService.assignFileToPad(file, padId)
      return
    }

    // Check if it's a built-in sample drop from the Sample Browser
    const sampleId = e.dataTransfer.getData('application/reson-sample-id')
    const sampleName = e.dataTransfer.getData('application/reson-sample-name')
    const sampleUrl = e.dataTransfer.getData('application/reson-sample-url')

    if (sampleId) {
      if (!isEmpty) {
        const confirmBeforeReplace = useStore.getState().settings?.confirmBeforeReplace ?? true
        if (confirmBeforeReplace) {
          const confirmed = await showConfirmDialog({
            title: 'Replace Sample',
            message: `Are you sure you want to replace the sample on Pad ${keyLabel}?`,
            confirmText: 'Replace',
            isDanger: true
          })
          if (!confirmed) return
        }
      }
      
      if (sampleUrl) {
        await sampleAssignmentService.assignBuiltInSampleToPad(sampleId, sampleName, sampleUrl, padId)
      } else {
        await sampleAssignmentService.assignExistingAssetToPad(sampleId, padId)
      }
    }
  }

  return (
    <div 
      className={`relative w-full aspect-square rounded-lg flex flex-col justify-between p-2 cursor-pointer transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] ${borderClass} ${scaleClass} ${ringClass} ${dragClass}`}
      style={dynamicStyles}
      data-pad-id={padId}
      role="button"
      tabIndex={0}
      aria-label={`Pad ${keyLabel} - ${!isEmpty ? padData.displayName : 'Empty'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          selectPad(padId)
        }
      }}
      onClick={() => selectPad(padId)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
          <span className="text-2xl text-[var(--text-disabled)]">+</span>
          {isDragOver && <span className="text-[10px] uppercase text-[var(--accent-cyan)] font-bold mt-1">Drop Sample</span>}
        </div>
      )}

      {!isEmpty && asset && (
        <PadWaveformThumbnail color={categoryColor} peaks={asset.waveformPeaksLow} />
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

      {/* Hover Actions */}
      {!isEmpty && (
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center z-20 rounded-lg">
          <button 
            className="p-2 bg-[var(--bg-elevated)] rounded-full text-white hover:text-[var(--accent-cyan)] transition-colors transform hover:scale-110 shadow-lg"
            onClick={(e) => {
              e.stopPropagation()
              selectPad(padId)
              useStore.getState().openModal('sampleEditor', padId)
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 Z"></path></svg>
          </button>
        </div>
      )}
    </div>
  )
}
