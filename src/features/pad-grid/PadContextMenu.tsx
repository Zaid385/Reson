import React, { useEffect, useRef } from 'react'
import { useStore } from '@state/store'
import { Copy, ClipboardPaste, Trash2, Search } from 'lucide-react'

export interface PadContextMenuProps {
  x: number
  y: number
  padId: string
  onClose: () => void
}

export const PadContextMenu: React.FC<PadContextMenuProps> = ({ x, y, padId, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const padData = useStore(state => state.pads[padId])
  const updatePad = useStore(state => state.updatePad)
  
  // We can just use a simple global state for clipboard if we don't want to add to Zustand
  // For a real implementation, we could put this in uiSlice or similar.
  // Actually, let's just add a copyPad/pastePad to Zustand or use window.__resonClipboard
  
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    window.addEventListener('mousedown', handleGlobalClick)
    return () => window.removeEventListener('mousedown', handleGlobalClick)
  }, [onClose])

  const handleCopy = () => {
    if (padData) {
      (window as any).__resonPadClipboard = { ...padData }
    }
    onClose()
  }

  const handlePaste = () => {
    const clipboard = (window as any).__resonPadClipboard
    if (clipboard) {
      // Don't copy id, bankId, slotIndex
      const { id, bankId, slotIndex, ...data } = clipboard
      updatePad(padId, data)
    }
    onClose()
  }

  const handleClear = () => {
    // Basic clear - could also reset params, but definitely clears assetId
    updatePad(padId, { assetId: null, displayName: `Pad ${padId.split(':')[1]}` })
    onClose()
  }

  const handleReplace = () => {
    useStore.getState().selectPad(padId)
    // Focus or open sample browser?
    // In our UI, sample browser is always visible on the left side on desktop.
    // If not visible, we can't easily "open" it here without mobile layout context.
    onClose()
  }

  const hasClipboard = !!(window as any).__resonPadClipboard

  // Prevent menu from overflowing screen
  const safeX = Math.min(x, window.innerWidth - 160)
  const safeY = Math.min(y, window.innerHeight - 150)

  return (
    <div 
      ref={menuRef}
      className="fixed z-[100] w-40 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg shadow-2xl py-1 flex flex-col backdrop-blur-md"
      style={{ top: safeY, left: safeX }}
      onContextMenu={e => e.preventDefault()}
    >
      <button 
        className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[var(--bg-surface-raised)] flex items-center gap-2 disabled:opacity-50"
        onClick={handleCopy}
        disabled={!padData?.assetId}
      >
        <Copy className="w-3 h-3" /> Copy Pad
      </button>
      <button 
        className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[var(--bg-surface-raised)] flex items-center gap-2 disabled:opacity-50"
        onClick={handlePaste}
        disabled={!hasClipboard}
      >
        <ClipboardPaste className="w-3 h-3" /> Paste Pad
      </button>
      <div className="h-px bg-[var(--border-subtle)] my-1 mx-2" />
      <button 
        className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[var(--bg-surface-raised)] flex items-center gap-2 disabled:opacity-50"
        onClick={handleReplace}
      >
        <Search className="w-3 h-3" /> Replace Sample
      </button>
      <button 
        className="w-full text-left px-3 py-1.5 text-xs text-[var(--accent-danger)] hover:bg-[var(--bg-surface-raised)] flex items-center gap-2 disabled:opacity-50"
        onClick={handleClear}
        disabled={!padData?.assetId}
      >
        <Trash2 className="w-3 h-3" /> Clear Pad
      </button>
    </div>
  )
}
