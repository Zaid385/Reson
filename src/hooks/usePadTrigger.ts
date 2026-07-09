import { useCallback } from 'react'
import { triggerPadAction, releasePadAction } from '@utils/padAction'

export function usePadTrigger(padId: string) {
  const trigger = useCallback((velocity: number = 1) => {
    triggerPadAction(padId, velocity)
  }, [padId])

  const release = useCallback(() => {
    releasePadAction(padId)
  }, [padId])

  return { trigger, release }
}
