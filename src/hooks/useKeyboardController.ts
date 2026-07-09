import { useEffect, useRef } from 'react'
import { useStore } from '@state/store'
import { QwertyKeyMap } from '@state/keyMap'
import { triggerPadAction, releasePadAction } from '@utils/padAction'

export function useKeyboardController() {
  const activeKeys = useRef<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useStore.getState()
      
      // Guard against typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Ignore repeat events (FR-KEY-002)
      if (e.repeat) return

      // Bank switching
      if ((e.ctrlKey || e.metaKey) && e.key.match(/^[1-4]$/)) {
        e.preventDefault()
        const bankIndex = parseInt(e.key, 10) - 1
        const bank = state.banks.find(b => b.index === bankIndex)
        if (bank) {
          state.setActiveBank(bank.id)
        }
        return
      }

      // Modifier guard (FR-KEY-004) - don't trigger pads if modifying
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
      
      // Don't trigger if modal is open
      if (state.activeModal) return

      const slotIndex = QwertyKeyMap[e.code]
      if (slotIndex !== undefined && state.activeBankId) {
        activeKeys.current.add(e.code)
        const padId = `${state.activeBankId}:${slotIndex}`
        triggerPadAction(padId)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const state = useStore.getState()
      
      const slotIndex = QwertyKeyMap[e.code]
      if (slotIndex !== undefined && activeKeys.current.has(e.code)) {
        activeKeys.current.delete(e.code)
        if (state.activeBankId) {
          const padId = `${state.activeBankId}:${slotIndex}`
          releasePadAction(padId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
}
