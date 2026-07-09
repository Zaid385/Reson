import { useEffect, useState } from 'react'
import { AppProviders } from './AppProviders'
import { AppShell } from './AppShell'
import { ErrorBoundary } from './ErrorBoundary'
import { AudioEngine } from '@audio-engine'
import { useStore } from '@state/store'
import { projectBootstrapService } from '@persistence/ProjectBootstrapService'

import { audioHydrationService } from '@domain/project/AudioHydrationService'

export function App() {
  const [isReady, setIsReady] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  
  useEffect(() => {
    if (!hasStarted) return
    
    async function init() {
      await AudioEngine.initialize()
      
      // Load project state from IndexedDB
      const snapshot = await projectBootstrapService.loadActiveProject()
      
      const store = useStore.getState()
      store.setActiveProject(snapshot.project)
      store.initSettings(snapshot.settings)
      store._initBanks(snapshot.banks, snapshot.banks[0]?.id)
      store._initPads(snapshot.pads)
      
      // Hydrate all actual audio buffers into the Engine
      await audioHydrationService.hydratePads(snapshot.pads)

      setIsReady(true)
    }
    
    init()
  }, [hasStarted])

  if (!hasStarted) {
    return (
      <div className="h-screen w-screen bg-[var(--bg-base)] text-white flex items-center justify-center font-mono">
        <button 
          className="px-6 py-3 bg-[var(--accent-cyan)] text-black rounded-full font-bold hover:bg-[var(--accent-cyan-hover)] transition-colors"
          onClick={() => setHasStarted(true)}
        >
          Click to Start Engine
        </button>
      </div>
    )
  }

  if (!isReady) return <div className="h-screen w-screen bg-[var(--bg-base)] text-white flex items-center justify-center font-mono">Initializing Data...</div>

  return (
    <ErrorBoundary>
      <AppProviders>
        <AppShell />
      </AppProviders>
    </ErrorBoundary>
  )
}
