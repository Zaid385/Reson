import { useEffect, useRef } from 'react'
import { useStore } from '@state/store'
import { projectRepository } from '@persistence/repositories/ProjectRepository'
import { FullProjectSnapshot } from '@models/models'

export function useAutosave() {
  const debounceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    // Subscribe to state changes we want to persist
    const unsub = useStore.subscribe((state, prevState) => {
      // Check if relevant parts of state changed
      const changed = 
        state.pads !== prevState.pads ||
        state.banks !== prevState.banks ||
        state.activeProject !== prevState.activeProject ||
        state.settings !== prevState.settings
      
      if (!changed) return
      
      // Update save status to 'saving' only if it's not already saving to avoid spam
      if (state.saveStatus !== 'saving') {
        state.setSaveStatus('saving')
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = window.setTimeout(async () => {
        const { activeProject, settings, banks, pads } = useStore.getState()
        if (!activeProject || !settings) return

        const snapshot: FullProjectSnapshot = {
          project: activeProject,
          settings,
          banks,
          pads: Object.values(pads)
        }

        try {
          await projectRepository.saveProjectSnapshot(snapshot)
          useStore.getState().setSaveStatus('saved')
        } catch (error) {
          console.error('Autosave failed:', error)
          useStore.getState().setSaveStatus('error')
        }
      }, 500)
    })

    return () => unsub()
  }, [])
}
