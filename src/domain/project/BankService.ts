import { useStore } from '@state/store'
import { assetRepository } from '@persistence/repositories/AssetRepository'

export class BankService {
  async copyBank(sourceBankId: string, targetBankId: string): Promise<void> {
    const store = useStore.getState()
    const { pads, updatePad } = store
    
    // Iterate through all 32 slots
    for (let i = 0; i < 32; i++) {
      const sourcePadId = `${sourceBankId}:${i}`
      const targetPadId = `${targetBankId}:${i}`
      
      const sourcePad = pads[sourcePadId]
      const targetPad = pads[targetPadId]
      
      if (!sourcePad || !targetPad) continue

      // Handle ref counts for target
      if (targetPad.assetId) {
        await assetRepository.decrementRefCount(targetPad.assetId)
      }

      // Handle ref counts for source
      if (sourcePad.assetId) {
        await assetRepository.incrementRefCount(sourcePad.assetId)
      }

      // Copy data from source to target, excluding ID mapping fields
      updatePad(targetPadId, {
        assetId: sourcePad.assetId,
        displayName: sourcePad.displayName,
        color: sourcePad.color,
        volume: sourcePad.volume,
        pan: sourcePad.pan,
        pitchSemitones: sourcePad.pitchSemitones,
        reverse: sourcePad.reverse,
        attackMs: sourcePad.attackMs,
        releaseMs: sourcePad.releaseMs,
        mute: sourcePad.mute,
        solo: sourcePad.solo,
        playMode: sourcePad.playMode,
        startMarker: sourcePad.startMarker,
        endMarker: sourcePad.endMarker,
        loop: sourcePad.loop,
        fadeInMs: sourcePad.fadeInMs,
        fadeOutMs: sourcePad.fadeOutMs,
        gainDb: sourcePad.gainDb,
        normalizeApplied: sourcePad.normalizeApplied,
        chokeGroup: sourcePad.chokeGroup,
      })
    }
  }
}

export const bankService = new BankService()
