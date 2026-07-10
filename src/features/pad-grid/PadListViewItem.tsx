import React, { useState } from 'react'
import { useStore } from '@state/store'
import { Settings2, Volume2, MicOff, Scissors } from 'lucide-react'
import { sampleAssignmentService } from '@domain/sample-assignment/SampleAssignmentService'
import { showConfirmDialog } from '@utils/dialog'

interface PadListViewItemProps {
  bankId: string
  slotIndex: number
}

const keyMapLabels = [
  '1','2','3','4','5','6','7','8',
  'Q','W','E','R','T','Y','U','I',
  'A','S','D','F','G','H','J','K',
  'Z','X','C','V','B','N','M',','
]

export const PadListViewItem: React.FC<PadListViewItemProps> = ({ bankId, slotIndex }) => {
  const padId = `${bankId}:${slotIndex}`
  const padData = useStore(state => state.pads[padId])
  const selectPad = useStore(state => state.selectPad)
  const isSelected = useStore(state => state.selectedPadId === padId)
  const isTriggered = useStore(state => !!state.triggeredPads[padId])
  
  const [isDragOver, setIsDragOver] = useState(false)
  
  const keyLabel = keyMapLabels[slotIndex] || ''

  if (!padData) return null

  const isEmpty = !padData.assetId
  const categoryColor = padData.color || '#00F0FF'

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

  const dragClass = isDragOver ? 'ring-2 ring-[var(--accent-cyan)] ring-offset-2 ring-offset-[var(--bg-base)]' : ''
  const scaleClass = isTriggered ? 'scale-[0.98]' : 'scale-100'

  const dynamicStyles: React.CSSProperties = {
    borderColor: !isEmpty ? (isSelected ? 'var(--accent-cyan)' : categoryColor) : undefined,
    backgroundColor: !isEmpty 
      ? (isTriggered ? categoryColor : `${categoryColor}1A`) 
      : undefined,
    boxShadow: isTriggered && !isEmpty ? `inset 0 4px 8px rgba(0,0,0,0.4), 0 0 16px ${categoryColor}` : undefined,
    transitionDuration: isTriggered ? '0ms' : '150ms'
  }

  return (
    <div 
      className={`flex items-center gap-4 p-4 rounded-lg border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] transition-all ${isEmpty ? 'opacity-50 border-[var(--border-subtle)] bg-[var(--bg-elevated)]' : ''} ${dragClass} ${scaleClass}`}
      style={dynamicStyles}
      data-pad-id={padId}
      tabIndex={0}
      role="button"
      aria-label={`Pad ${keyLabel} - ${!isEmpty ? padData.displayName : 'Empty'}`}
      onClick={() => selectPad(padId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          selectPad(padId)
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="w-8 h-8 flex items-center justify-center bg-[var(--bg-base)] text-[var(--text-secondary)] font-mono rounded">
        {keyLabel}
      </div>
      
      <div className="flex-1">
        <div className="font-medium flex items-center gap-2" style={{ color: isTriggered ? '#000' : 'var(--text-primary)' }}>
          {!isEmpty ? padData.displayName : 'Empty Pad'}
          {isDragOver && <span className="text-[10px] uppercase text-[var(--accent-cyan)] font-bold">Drop Sample</span>}
        </div>
        {!isEmpty && (
          <div className="text-xs flex items-center gap-2 mt-1" style={{ color: isTriggered ? '#000000B3' : 'var(--text-muted)' }}>
            <span>Vol: {Math.round(padData.volume * 100)}%</span>
            <span>Pan: {padData.pan.toFixed(2)}</span>
            <span>Mode: {padData.playMode}</span>
          </div>
        )}
      </div>

      {!isEmpty && (
        <div className="flex items-center gap-2">
          {padData.mute && <MicOff className="w-4 h-4 text-[var(--accent-danger)]" aria-label="Muted" />}
          {padData.solo && <Volume2 className="w-4 h-4 text-[var(--accent-amber)]" aria-label="Soloed" />}
          <button 
            className="p-2 hover:bg-[var(--bg-surface-raised)] rounded text-[var(--text-muted)] hover:text-white transition-colors"
            style={{ color: isTriggered ? '#000' : undefined }}
            aria-label={`Edit ${padData.displayName}`}
            onClick={(e) => {
              e.stopPropagation()
              useStore.getState().openModal('sampleEditor', padId)
            }}
          >
            <Scissors className="w-4 h-4" />
          </button>
          <button 
            className="p-2 hover:bg-[var(--bg-surface-raised)] rounded text-[var(--text-muted)] hover:text-white transition-colors"
            style={{ color: isTriggered ? '#000' : undefined }}
            aria-label={`Parameters for ${padData.displayName}`}
            onClick={(e) => {
              e.stopPropagation()
              selectPad(padId)
              if (!useStore.getState().isParamPanelOpen) {
                useStore.getState().toggleParamPanel()
              }
            }}
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
