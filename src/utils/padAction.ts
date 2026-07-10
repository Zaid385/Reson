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
    startMarker: padData.startMarker ?? 0,
    endMarker: padData.endMarker ?? 1,
    reverse: padData.reverse ?? false,
    loop: padData.loop ?? false,
    pitchSemitones: padData.pitchSemitones ?? 0,
    gainDb: padData.gainDb ?? 0,
    attackMs: padData.attackMs ?? 0,
    decayMs: padData.decayMs ?? 0,
    sustainLevel: padData.sustainLevel ?? 1,
    releaseMs: padData.releaseMs ?? 50,
    fadeInMs: padData.fadeInMs ?? 0,
    fadeOutMs: padData.fadeOutMs ?? 0,
    playMode: padData.playMode ?? 'oneshot'
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
