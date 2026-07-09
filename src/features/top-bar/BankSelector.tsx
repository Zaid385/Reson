import React, { useEffect } from 'react'
import { useStore } from '@state/store'

export const BankSelector: React.FC = () => {
  const activeBankId = useStore(state => state.activeBankId)
  const banks = useStore(state => state.banks)
  const setActiveBank = useStore(state => state.setActiveBank)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  return (
    <div className="flex bg-bg-base p-1 rounded-md gap-1 ml-6">
      {banks.map((bank, i) => (
        <button
          key={bank.id}
          className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors ${
            activeBankId === bank.id
              ? 'bg-bg-elevated text-[var(--accent-cyan)] shadow-sm'
              : 'text-text-muted hover:text-white hover:bg-bg-surface'
          }`}
          onClick={() => setActiveBank(bank.id)}
        >
          {String.fromCharCode(65 + i)}
        </button>
      ))}
    </div>
  )
}
