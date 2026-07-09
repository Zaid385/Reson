import { useEffect } from 'react'
import { AudioEngine } from '@audio-engine'
import { useStore } from '@state/store'

export function useAudioEngineBinding() {
  // We can subscribe to store changes and push them to AudioEngine
  // This is typically done via zustand subscribe in a useEffect
  
  useEffect(() => {
    const unsubPads = useStore.subscribe((state, prevState) => {
      // In a more granular implementation, we'd only react to specific pad changes
      // For now, if a pad's volume/pan/mute changes, we update the engine
      if (state.pads !== prevState.pads) {
        for (const [id, pad] of Object.entries(state.pads)) {
          const prevPad = prevState.pads[id]
          if (!prevPad) continue
          
          if (pad.volume !== prevPad.volume) AudioEngine.setPadVolume(id, pad.volume)
          if (pad.pan !== prevPad.pan) AudioEngine.setPadPan(id, pad.pan)
          if (pad.mute !== prevPad.mute) AudioEngine.setPadMute(id, pad.mute)
          // Solo requires re-evaluating the SoloMuteResolver, which we haven't wired 
          // fully at the global level yet, but AudioEngine exposes setPadMute
        }
      }
    })
    
    return () => {
      unsubPads()
    }
  }, [])
}
