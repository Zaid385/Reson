import { assetRepository } from '@persistence/repositories/AssetRepository'
import { PadData } from '@types/models'
import { AudioEngine } from '@audio-engine'
import { builtInSampleManifest } from '@persistence/builtInSampleManifest'

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
        let arrayBuffer: ArrayBuffer

        if (asset && asset.audioData) {
          // User upload or edited built-in that got cached
          arrayBuffer = await asset.audioData.arrayBuffer()
        } else {
          // It's likely a built-in sample reference without a blob
          const url = await builtInSampleManifest.getSampleUrl(assetId)
          if (!url) {
            console.warn(`Could not resolve asset data or URL for ${assetId}`)
            return
          }
          const response = await fetch(`${url}?v=1`)
          if (!response.ok) throw new Error('Failed to fetch built-in sample')
          arrayBuffer = await response.arrayBuffer()
        }

        const audioBuffer = await this.tempContext.decodeAudioData(arrayBuffer.slice(0))
        AudioEngine.registerBuffer(assetId, audioBuffer)
      } catch (e) {
        console.error(`Failed to hydrate asset ${assetId}`, e)
      }
    })

    await Promise.all(loadPromises)
  }
}

export const audioHydrationService = new AudioHydrationService()
