import { useEffect } from 'react'
import { AudioEngine } from '@audio-engine'
import { SoloMuteResolver } from '@audio-engine/SoloMuteResolver'
import { useStore } from '@state/store'

export function useAudioEngineBinding() {
  // We can subscribe to store changes and push them to AudioEngine
  // This is typically done via zustand subscribe in a useEffect
  
  useEffect(() => {
    const unsubPads = useStore.subscribe((state, prevState) => {
      if (state.pads !== prevState.pads) {
        
        // 1. Resolve Mute/Solo logic
        const padList = Object.values(state.pads)
        const anySoloChanged = padList.some(p => p.solo !== prevState.pads[p.id]?.solo)
        const anyMuteChanged = padList.some(p => p.mute !== prevState.pads[p.id]?.mute)
        
        let resolvedAudibility: Map<string, boolean> | null = null
        if (anySoloChanged || anyMuteChanged || Object.keys(state.pads).length !== Object.keys(prevState.pads).length) {
          resolvedAudibility = SoloMuteResolver.resolve(padList)
        }

        // 2. Iterate and apply changes
        for (const pad of padList) {
          const prevPad = prevState.pads[pad.id]
          if (!prevPad) continue
          
          if (pad.volume !== prevPad.volume) AudioEngine.setPadVolume(pad.id, pad.volume)
          if (pad.pan !== prevPad.pan) AudioEngine.setPadPan(pad.id, pad.pan)
          
          if (resolvedAudibility) {
            const isAudible = resolvedAudibility.get(pad.id)
            AudioEngine.setPadMute(pad.id, !isAudible)
          }
        }
      }
      
      // Master settings binding
      if (state.settings && prevState.settings && state.settings !== prevState.settings) {
        if (state.settings.masterVolume !== prevState.settings.masterVolume) {
          AudioEngine.setMasterVolume(state.settings.masterVolume)
        }
        if (state.settings.masterMute !== prevState.settings.masterMute) {
          AudioEngine.setMasterMute(state.settings.masterMute)
        }
      }
    })
    
    return () => {
      unsubPads()
    }
  }, [])
}
