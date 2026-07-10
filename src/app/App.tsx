import { useEffect, useState } from 'react'
import { AppProviders } from './AppProviders'
import { AppShell } from './AppShell'
import { ErrorBoundary } from './ErrorBoundary'
import { AudioEngine } from '@audio-engine'
import { useStore } from '@state/store'
import { projectBootstrapService } from '@persistence/ProjectBootstrapService'
import { audioHydrationService } from '@domain/project/AudioHydrationService'
import { ResonLogo } from '@components/branding/ResonLogo'
import { motion, AnimatePresence } from 'framer-motion'
import { useStatusStore } from '@state/statusStore'
import { BuiltInSampleGenerator } from '@domain/procedural/BuiltInSampleGenerator'
import { builtInSampleManifest } from '@persistence/builtInSampleManifest'

export function App() {
  const [isReady, setIsReady] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [showButton, setShowButton] = useState(false)
  
  useEffect(() => {
    // Show button slightly after animation completes
    const timer = setTimeout(() => setShowButton(true), 1200)
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    if (!hasStarted) return
    
    async function init() {
      await AudioEngine.initialize()
      
      useStatusStore.getState().setAppStatus('Generating Factory Kit...')
      const generated = await BuiltInSampleGenerator.generateAll()
      builtInSampleManifest.setGeneratedSamples(generated)
      useStatusStore.getState().setAppStatus('Loading Project...')
      
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
      useStatusStore.getState().setAppStatus('Ready')
    }
    
    init()
  }, [hasStarted])

  return (
    <AnimatePresence mode="wait">
      {(!hasStarted || !isReady) ? (
        <motion.div 
          key="splash"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[var(--bg-base)] flex flex-col items-center justify-center font-mono gap-16"
        >
          <ResonLogo size={160} animated={true} />
          
          <div className="h-12 flex items-center justify-center">
            {showButton && !hasStarted && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="px-8 py-3 bg-[var(--accent-cyan)] text-black rounded-full font-bold tracking-wider capitalize text-sm hover:bg-[var(--accent-cyan-hover)] transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]"
                onClick={() => setHasStarted(true)}
              >
                Dive in
              </motion.button>
            )}
            
            {hasStarted && !isReady && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-[var(--text-secondary)] text-sm tracking-widest capitalize animate-pulse"
              >
                Initializing...
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="app" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.8 }}
          className="h-screen w-screen"
        >
          <ErrorBoundary>
            <AppProviders>
              <AppShell />
            </AppProviders>
          </ErrorBoundary>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
