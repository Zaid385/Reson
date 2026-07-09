import { validateSampleFile } from './fileValidation'
import { extractPeaks } from './peakExtraction'
import { assetRepository } from '@persistence/repositories/AssetRepository'
import { useStore } from '@state/store'
import { AudioEngine } from '@audio-engine'

export class SampleAssignmentService {
  private tempContext = new AudioContext()

  async assignFileToPad(file: File, padId: string): Promise<void> {
    const val = validateSampleFile(file)
    if (!val.valid) {
      // Dispatch error toast (to be implemented)
      console.error(val.error)
      return
    }

    try {
      // Read array buffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Decode audio
      const audioBuffer = await this.tempContext.decodeAudioData(arrayBuffer.slice(0))
      
      // Extract peaks
      const peaks = extractPeaks(audioBuffer)
      
      // Create blob for storage
      const blob = new Blob([arrayBuffer], { type: file.type || 'audio/wav' })
      
      // Save asset
      const assetId = await assetRepository.saveAsset(blob, {
        name: file.name,
        sourceType: 'user-upload',
        mimeType: file.type || 'audio/wav',
        durationSeconds: audioBuffer.duration,
        waveformPeaksLow: peaks.low,
        waveformPeaksHigh: peaks.high,
        refCount: 1, // Start with 1 reference
        fileSizeBytes: file.size
      })

      // Register with Audio Engine
      AudioEngine.registerBuffer(assetId, audioBuffer)

      // Get current pad to see if we need to deref old asset
      const store = useStore.getState()
      const pad = store.pads[padId]
      if (pad?.assetId) {
        await assetRepository.decrementRefCount(pad.assetId)
        // Note: engine might still need the buffer if it's playing, 
        // engine has its own registry cache, we keep it simple for now.
      }

      // Update store pad
      store.updatePad(padId, {
        assetId,
        displayName: file.name.replace(/\.[^/.]+$/, "").substring(0, 32),
        // reset some playback params
        startMarker: 0,
        endMarker: 1,
        reverse: false
      })

    } catch (e) {
      console.error('Failed to assign sample', e)
    }
  }

  async assignBuiltInSampleToPad(sampleId: string, sampleName: string, sampleUrl: string, padId: string): Promise<void> {
    try {
      const response = await fetch(sampleUrl)
      if (!response.ok) throw new Error('Failed to fetch built-in sample')
      
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.tempContext.decodeAudioData(arrayBuffer.slice(0))
      
      // We use the URL as the asset ID for built-in samples since they are static
      const assetId = sampleId
      
      // If we haven't already registered it to the engine, do so
      // Actually, Engine might need it registered. Let's just do it.
      try {
        AudioEngine.registerBuffer(assetId, audioBuffer)
      } catch (e) {
        // Might already be registered
      }

      const store = useStore.getState()
      const pad = store.pads[padId]
      if (pad?.assetId) {
        await assetRepository.decrementRefCount(pad.assetId)
      }

      store.updatePad(padId, {
        assetId,
        displayName: sampleName,
        startMarker: 0,
        endMarker: 1,
        reverse: false
      })

    } catch (e) {
      console.error('Failed to assign built-in sample', e)
    }
  }

  async removeSampleFromPad(padId: string): Promise<void> {
    const store = useStore.getState()
    const pad = store.pads[padId]
    if (pad?.assetId) {
      await assetRepository.decrementRefCount(pad.assetId)
      store.updatePad(padId, { assetId: null, displayName: '' })
    }
  }
}

export const sampleAssignmentService = new SampleAssignmentService()
