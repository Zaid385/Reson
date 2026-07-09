import { useEffect, useState } from 'react'
import { AppProviders } from './AppProviders'
import { AppShell } from './AppShell'
import { ErrorBoundary } from './ErrorBoundary'
import { AudioEngine } from '@audio-engine'
import { useStore } from '@state/store'
import { PadData, BankData } from '@types/models'

export function App() {
  const [isReady, setIsReady] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  
  useEffect(() => {
    if (!hasStarted) return
    
    async function init() {
      await AudioEngine.initialize()
      
      const initBanks = useStore.getState()._initBanks
      const initPads = useStore.getState()._initPads
      
      const mockBank: BankData = {
        id: 'bank-A',
        projectId: 'mock-proj',
        index: 0,
        name: 'Bank A'
      }
      
      initBanks([mockBank], 'bank-A')
      
      const defaultPad = (index: number): PadData => ({
        id: `bank-A:${index}`,
        bankId: 'bank-A',
        slotIndex: index,
        assetId: null,
        displayName: '',
        color: '#00F0FF',
        volume: 0.8,
        pan: 0,
        pitchSemitones: 0,
        reverse: false,
        attackMs: 0,
        releaseMs: 50,
        mute: false,
        solo: false,
        playMode: 'oneshot',
        startMarker: 0,
        endMarker: 1,
        loop: false,
        fadeInMs: 0,
        fadeOutMs: 0,
        gainDb: 0,
        normalizeApplied: false,
        chokeGroup: null
      })
      
      const pads = Array.from({ length: 32 }, (_, i) => defaultPad(i))
      
      pads[0].assetId = 'test-kick'
      pads[0].displayName = 'Test Kick'
      pads[0].color = '#FF007A' // Pink for oneshot
      
      pads[1].assetId = 'test-hat'
      pads[1].displayName = 'Test Hat'
      pads[1].color = '#C3F400' // Lime
      
      initPads(pads)
      
      // Generate synthetic sounds for testing without network
      const ctx = new AudioContext()
      
      // Kick
      const bufKick = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
      const dataKick = bufKick.getChannelData(0)
      for (let i = 0; i < dataKick.length; i++) {
        const t = i / ctx.sampleRate
        dataKick[i] = Math.sin(2 * Math.PI * 150 * t * Math.exp(-t * 20)) * Math.exp(-t * 10)
      }
      AudioEngine.registerBuffer('test-kick', bufKick)
      
      // Hat
      const bufHat = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
      const dataHat = bufHat.getChannelData(0)
      for (let i = 0; i < dataHat.length; i++) {
        const t = i / ctx.sampleRate
        dataHat[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40)
      }
      AudioEngine.registerBuffer('test-hat', bufHat)

      setIsReady(true)
    }
    
    init()
  }, [hasStarted])

  if (!hasStarted) {
    return (
      <div className="h-screen w-screen bg-bg-base text-white flex items-center justify-center font-mono">
        <button 
          className="px-6 py-3 bg-[var(--accent-cyan)] text-black rounded-full font-bold hover:bg-[var(--accent-cyan-hover)] transition-colors"
          onClick={() => setHasStarted(true)}
        >
          Click to Start Engine
        </button>
      </div>
    )
  }

  if (!isReady) return <div className="h-screen w-screen bg-bg-base text-white flex items-center justify-center font-mono">Initializing Data...</div>

  return (
    <ErrorBoundary>
      <AppProviders>
        <AppShell />
      </AppProviders>
    </ErrorBoundary>
  )
}
