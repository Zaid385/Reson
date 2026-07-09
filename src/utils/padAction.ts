import { AudioEngine } from '@audio-engine'
import { useStore } from '@state/store'

export function triggerPadAction(padId: string, velocity: number = 1) {
  const state = useStore.getState()
  const [bankId, slotStr] = padId.split(':')
  const padData = state.getPad(bankId, parseInt(slotStr, 10))
  
  if (!padData || !padData.assetId) return null

  state.setPadTriggered(padId, true)

  const handle = AudioEngine.triggerPad(padId, {
    assetId: padData.assetId,
    startMarker: padData.startMarker,
    endMarker: padData.endMarker,
    reverse: padData.reverse,
    loop: padData.loop,
    pitchSemitones: padData.pitchSemitones,
    gainDb: padData.gainDb,
    attackMs: padData.attackMs,
    releaseMs: padData.releaseMs,
    fadeInMs: padData.fadeInMs,
    fadeOutMs: padData.fadeOutMs,
    playMode: padData.playMode
  }, velocity)

  if (padData.playMode === 'oneshot') {
    setTimeout(() => {
      // Need fresh state or just directly call setPadTriggered
      useStore.getState().setPadTriggered(padId, false)
    }, 150)
  }

  return handle
}

export function releasePadAction(padId: string) {
  const state = useStore.getState()
  const [bankId, slotStr] = padId.split(':')
  const padData = state.getPad(bankId, parseInt(slotStr, 10))
  
  if (padData?.playMode === 'gate') {
    state.setPadTriggered(padId, false)
    AudioEngine.releasePad(padId)
  }
}
