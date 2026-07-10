import React, { useEffect, useRef } from 'react'
import { Copy, ClipboardPaste, Edit2 } from 'lucide-react'
import { bankService } from '@domain/project/BankService'
import { showConfirmDialog } from '@utils/dialog'

export interface BankContextMenuProps {
  x: number
  y: number
  bankId: string
  onClose: () => void
  onRename: () => void
}

export const BankContextMenu: React.FC<BankContextMenuProps> = ({ x, y, bankId, onClose, onRename }) => {
  const menuRef = useRef<HTMLDivElement>(null)
  
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
    ;(window as Window & { __resonBankClipboard?: string }).__resonBankClipboard = bankId
    onClose()
  }

  const handlePaste = async () => {
    const clipboardBankId = (window as Window & { __resonBankClipboard?: string }).__resonBankClipboard
    if (clipboardBankId) {
      const confirmed = await showConfirmDialog({
        title: 'Paste Bank',
        message: 'Are you sure you want to paste? This will overwrite the current bank.',
        confirmText: 'Paste',
        isDanger: true
      })
      if (confirmed) {
        await bankService.copyBank(clipboardBankId, bankId)
      }
    }
    onClose()
  }

  const handleRename = () => {
    onRename()
    onClose()
  }

  const hasClipboard = !!(window as Window & { __resonBankClipboard?: string }).__resonBankClipboard

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
        className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[var(--bg-surface-raised)] flex items-center gap-2"
        onClick={handleRename}
      >
        <Edit2 className="w-3 h-3" /> Rename
      </button>
      <button 
        className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[var(--bg-surface-raised)] flex items-center gap-2"
        onClick={handleCopy}
      >
        <Copy className="w-3 h-3" /> Copy Bank
      </button>
      <button 
        className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[var(--bg-surface-raised)] flex items-center gap-2 disabled:opacity-50"
        onClick={handlePaste}
        disabled={!hasClipboard}
      >
        <ClipboardPaste className="w-3 h-3" /> Paste Bank
      </button>
    </div>
  )
}
