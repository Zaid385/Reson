import { useEffect, useRef } from 'react'
import { triggerPadAction, releasePadAction } from '@utils/padAction'

export function usePointerRollController() {
  const activePointers = useRef<Map<number, string>>(new Map()) // pointerId -> padId

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // If this pointer isn't down, ignore
      if (e.buttons === 0 && e.pointerType !== 'touch') return
      
      // Only track if it started on a pad, or just any touch/drag?
      // For a groovebox, sliding a finger anywhere onto a pad should trigger it.
      
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      const padEl = target?.closest('[data-pad-id]')
      const currentPadId = padEl ? padEl.getAttribute('data-pad-id') : null

      const previousPadId = activePointers.current.get(e.pointerId) || null

      if (currentPadId !== previousPadId) {
        if (previousPadId) {
          releasePadAction(previousPadId)
        }
        
        if (currentPadId) {
          activePointers.current.set(e.pointerId, currentPadId)
          // For touch, we need to ensure velocity is 1
          triggerPadAction(currentPadId)
        } else {
          activePointers.current.delete(e.pointerId)
        }
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      const padId = activePointers.current.get(e.pointerId)
      if (padId) {
        releasePadAction(padId)
        activePointers.current.delete(e.pointerId)
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      // Pointer capture prevents elementFromPoint from working on other elements during drag
      const target = e.target as HTMLElement
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId)
      }

      // Initial hit detection
      const padEl = target.closest('[data-pad-id]')
      if (padEl) {
        const padId = padEl.getAttribute('data-pad-id')
        if (padId) {
          activePointers.current.set(e.pointerId, padId)
          triggerPadAction(padId)
        }
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, { passive: false })
    document.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointercancel', handlePointerUp)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [])
}
