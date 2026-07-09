import { useEffect, useState } from 'react'
import { AppProviders } from './AppProviders'
import { AppShell } from './AppShell'
import { ErrorBoundary } from './ErrorBoundary'
import { AudioEngine } from '@audio-engine'
import { useStore } from '@state/store'
import { projectBootstrapService } from '@persistence/ProjectBootstrapService'

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
      
      // We will eventually hydrate AudioEngine with real user samples here,
      // but for now, generate synthetic test sounds if they're assigned to pads.
      // E.g., pad 0 and 1 were given test-kick and test-hat in the previous phase.
      // If we see those assetIds, we can recreate the synthetic buffers.
      const hasTestKick = snapshot.pads.some(p => p.assetId === 'test-kick')
      const hasTestHat = snapshot.pads.some(p => p.assetId === 'test-hat')
      
      const ctx = new AudioContext()
      if (hasTestKick) {
        const bufKick = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
        const dataKick = bufKick.getChannelData(0)
        for (let i = 0; i < dataKick.length; i++) {
          const t = i / ctx.sampleRate
          dataKick[i] = Math.sin(2 * Math.PI * 150 * t * Math.exp(-t * 20)) * Math.exp(-t * 10)
        }
        AudioEngine.registerBuffer('test-kick', bufKick)
      }
      
      if (hasTestHat) {
        const bufHat = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
        const dataHat = bufHat.getChannelData(0)
        for (let i = 0; i < dataHat.length; i++) {
          const t = i / ctx.sampleRate
          dataHat[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40)
        }
        AudioEngine.registerBuffer('test-hat', bufHat)
      }

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
