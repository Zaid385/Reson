import { useEffect, useRef } from 'react'
import { useStore } from '@state/store'
import { triggerPadAction, releasePadAction } from '@utils/padAction'

export function useMidiController() {
  const midiAccessRef = useRef<MIDIAccess | null>(null)
  
  useEffect(() => {
    let unmounted = false

    const handleMidiMessage = (event: Event) => {
      const midiEvent = event as MIDIMessageEvent
      const data = midiEvent.data
      if (!data) return

      const state = useStore.getState()
      if (!state.activeBankId) return

      // Command is the upper 4 bits
      const command = data[0] >> 4
      // const channel = data[0] & 0xf
      const note = data[1]
      const velocity = data[2]

      // We only care about Note On (9) and Note Off (8)
      if (command === 9 || command === 8) {
        // Map MIDI note 36 (C1) to pad 0, up to 67 for pad 31
        const padIndex = note - 36
        
        if (padIndex >= 0 && padIndex < 32) {
          const padId = `${state.activeBankId}:${padIndex}`
          
          if (command === 9 && velocity > 0) {
            // Note On
            const velocityScale = velocity / 127
            triggerPadAction(padId, velocityScale)
          } else {
            // Note Off (or Note On with velocity 0)
            releasePadAction(padId)
          }
        }
      }
    }

    const initMidi = async () => {
      try {
        if (navigator.requestMIDIAccess) {
          const access = await navigator.requestMIDIAccess()
          if (unmounted) return
          midiAccessRef.current = access
          
          for (const input of access.inputs.values()) {
            input.onmidimessage = handleMidiMessage
          }
          
          access.onstatechange = (e: Event) => {
            const connectionEvent = e as MIDIConnectionEvent
            if (connectionEvent.port?.type === 'input' && connectionEvent.port?.state === 'connected') {
              const input = connectionEvent.port as MIDIInput
              input.onmidimessage = handleMidiMessage
            }
          }
        } else {
          console.warn('Web MIDI API is not supported in this browser.')
        }
      } catch (err) {
        console.error('Failed to get MIDI access', err)
      }
    }

    initMidi()

    return () => {
      unmounted = true
      if (midiAccessRef.current) {
        midiAccessRef.current.onstatechange = null
        for (const input of midiAccessRef.current.inputs.values()) {
          input.onmidimessage = null
        }
      }
    }
  }, [])
}
