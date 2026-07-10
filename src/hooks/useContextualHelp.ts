import { useStatusStore } from '@state/statusStore'

export function useContextualHelp(message: string) {
  return {
    onMouseEnter: () => useStatusStore.getState().setContextMessage(message),
    onMouseLeave: () => useStatusStore.getState().setContextMessage(null),
  }
}
