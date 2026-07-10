import React, { useState, useCallback } from 'react'
import { useStore } from '@state/store'
import { Pad } from './Pad'
import { sampleAssignmentService } from '@domain/sample-assignment/SampleAssignmentService'
import { PadContextMenu } from './PadContextMenu'

export const PadGrid: React.FC = () => {
  const activeBankId = useStore(state => state.activeBankId)
  const [isDragOver, setIsDragOver] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, padId: string } | null>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent, padId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, padId })
  }, [])

  if (!activeBankId) return null

  const padIndices = Array.from({ length: 32 }, (_, i) => i)

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 1) {
      // Multi-file sequential drop
      const files = Array.from(e.dataTransfer.files)
      
      // Find empty pads in current bank
      const emptySlots: number[] = []
      const pads = useStore.getState().pads
      for (let i = 0; i < 32; i++) {
        if (!pads[`${activeBankId}:${i}`]?.assetId) {
          emptySlots.push(i)
        }
      }

      for (let i = 0; i < Math.min(files.length, emptySlots.length); i++) {
        const file = files[i]
        const padId = `${activeBankId}:${emptySlots[i]}`
        await sampleAssignmentService.assignFileToPad(file, padId)
      }
    }
  }

  return (
    <>
      <div 
        className={`grid grid-cols-4 md:grid-cols-8 gap-1 md:gap-2 w-full max-w-[1400px] mx-auto p-2 md:p-8 flex-1 content-center transition-colors ${isDragOver ? 'bg-[var(--bg-surface-raised)] rounded-2xl' : ''} touch-none`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {padIndices.map(index => {
          const padId = `${activeBankId}:${index}`
          return (
            <div key={padId} onContextMenu={(e) => handleContextMenu(e, padId)}>
              <Pad bankId={activeBankId} slotIndex={index} />
            </div>
          )
        })}
      </div>
      
      {contextMenu && (
        <PadContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          padId={contextMenu.padId} 
          onClose={() => setContextMenu(null)} 
        />
      )}
    </>
  )
}
