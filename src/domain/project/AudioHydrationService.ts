/* eslint-disable prefer-const */
import { assetRepository } from '@persistence/repositories/AssetRepository'
import { PadData } from '@models/models'
import { AudioEngine } from '@audio-engine'


export class AudioHydrationService {
  private tempContext = new AudioContext()

  async hydratePads(pads: PadData[]): Promise<void> {
    const uniqueAssetIds = new Set<string>()
    for (const pad of pads) {
      if (pad.assetId) {
        uniqueAssetIds.add(pad.assetId)
      }
    }

    const loadPromises = Array.from(uniqueAssetIds).map(async (assetId) => {
      try {
        const asset = await assetRepository.getAsset(assetId)

        if (asset && asset.audioData) {
          // User upload or edited built-in that got cached
          let arrayBuffer = await asset.audioData.arrayBuffer()
          const audioBuffer = await this.tempContext.decodeAudioData(arrayBuffer.slice(0))
          AudioEngine.registerBuffer(assetId, audioBuffer)
        } else {
          // It's a built-in sample. It is already procedurally generated and registered in AudioEngine during startup.
          return
        }
      } catch (e) {
        console.error(`Failed to hydrate asset ${assetId}`, e)
      }
    })

    await Promise.all(loadPromises)
  }
}

export const audioHydrationService = new AudioHydrationService()
