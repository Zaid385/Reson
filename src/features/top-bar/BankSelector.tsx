import React, { useEffect, useState, useRef } from 'react'
import { useStore } from '@state/store'
import { BankContextMenu } from './BankContextMenu'

export const BankSelector: React.FC = () => {
  const activeBankId = useStore(state => state.activeBankId)
  const banks = useStore(state => state.banks)
  const setActiveBank = useStore(state => state.setActiveBank)
  const updateBank = useStore(state => state.updateBank)
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; bankId: string } | null>(null)
  const [editingBankId, setEditingBankId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key >= '1' && e.key <= '4') {
          e.preventDefault()
          const index = parseInt(e.key) - 1
          if (banks[index]) {
            setActiveBank(banks[index].id)
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [banks, setActiveBank])

  useEffect(() => {
    if (editingBankId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingBankId])

  const handleContextMenu = (e: React.MouseEvent, bankId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, bankId })
  }

  const handleDoubleClick = (bankId: string, currentName: string) => {
    setEditName(currentName)
    setEditingBankId(bankId)
  }

  const submitEdit = () => {
    if (editingBankId && editName.trim()) {
      updateBank(editingBankId, { name: editName.trim() })
    }
    setEditingBankId(null)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitEdit()
    } else if (e.key === 'Escape') {
      setEditingBankId(null)
    }
  }

  return (
    <>
      <div className="flex bg-[var(--bg-base)] p-1 rounded-lg gap-1 ml-6 border border-[var(--border-subtle)]/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)]">
        {banks.map((bank, i) => (
          <div key={bank.id} className="relative flex items-center">
            {editingBankId === bank.id ? (
              <input
                ref={inputRef}
                className="px-2 py-1 text-sm font-medium rounded-md bg-[var(--bg-surface)] border border-[var(--accent-cyan)] outline-none text-[var(--text-primary)] w-20"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={submitEdit}
                onKeyDown={handleInputKeyDown}
              />
            ) : (
              <button
                className={`px-4 py-1 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer select-none ${
                  activeBankId === bank.id
                    ? 'bg-[var(--bg-surface-raised)] text-[var(--accent-cyan)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.05)] border border-[var(--border-subtle)]/50'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent'
                }`}
                onClick={() => setActiveBank(bank.id)}
                onDoubleClick={() => handleDoubleClick(bank.id, bank.name)}
                onContextMenu={e => handleContextMenu(e, bank.id)}
                title={`Bank ${String.fromCharCode(65 + i)}: ${bank.name} (Ctrl+${i+1})`}
              >
                {bank.name !== `Bank ${String.fromCharCode(65 + i)}` ? bank.name : String.fromCharCode(65 + i)}
              </button>
            )}
          </div>
        ))}
      </div>

      {contextMenu && (
        <BankContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          bankId={contextMenu.bankId}
          onClose={() => setContextMenu(null)}
          onRename={() => {
            const bank = banks.find(b => b.id === contextMenu.bankId)
            if (bank) {
              setEditName(bank.name)
              setEditingBankId(bank.id)
            }
          }}
        />
      )}
    </>
  )
}
