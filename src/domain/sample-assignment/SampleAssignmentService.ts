import { validateSampleFile } from './fileValidation'
import { extractPeaks } from './peakExtraction'
import { assetRepository } from '@persistence/repositories/AssetRepository'
import { useStore } from '@state/store'
import { AudioEngine } from '@audio-engine'
import { toast } from '@state/toastStore'

export class SampleAssignmentService {
  private tempContext = new AudioContext()

  async assignFileToPad(file: File, padId: string): Promise<void> {
    const val = validateSampleFile(file)
    if (!val.valid) {
      toast.error(val.error || 'Invalid file format')
      console.error(val.error)
      return
    }

    const store = useStore.getState()
    try {
      store.setProcessing(true, 'Processing audio...')
      
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
      console.error('Failed to assign file to pad', e)
      toast.error('Failed to process audio file')
    } finally {
      store.setProcessing(false)
    }
  }

  async assignBuiltInSampleToPad(sampleId: string, sampleName: string, _sampleUrl: string, padId: string): Promise<void> {
    const store = useStore.getState()
    try {
      store.setProcessing(true, 'Assigning sample...')
      const assetId = sampleId
      
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
    } finally {
      store.setProcessing(false)
    }
  }

  async assignExistingAssetToPad(assetId: string, padId: string): Promise<void> {
    const store = useStore.getState()
    try {
      store.setProcessing(true, 'Loading asset...')
      const asset = await assetRepository.getAsset(assetId)
      if (!asset) return

      const pad = store.pads[padId]
      if (pad?.assetId) {
        await assetRepository.decrementRefCount(pad.assetId)
      }

      await assetRepository.incrementRefCount(assetId)

      store.updatePad(padId, {
        assetId,
        displayName: asset.name,
        startMarker: 0,
        endMarker: 1,
        reverse: false
      })
    } catch (e) {
      console.error('Failed to assign existing asset', e)
    } finally {
      store.setProcessing(false)
    }
  }

  async removeSampleFromPad(padId: string): Promise<void> {
    const store = useStore.getState()
    const pad = store.pads[padId]
    if (pad?.assetId) {
      AudioEngine.stopPad(padId)
      await assetRepository.decrementRefCount(pad.assetId)
      store.updatePad(padId, { assetId: null, displayName: `Pad ${padId.split(':')[1]}` })
      toast.success('Sample removed from pad')
    }
  }

  async deleteUserSample(assetId: string): Promise<void> {
    const store = useStore.getState()
    
    // Remove from all pads
    Object.keys(store.pads).forEach(padId => {
      if (store.pads[padId].assetId === assetId) {
        AudioEngine.stopPad(padId)
        store.updatePad(padId, { assetId: null, displayName: `Pad ${padId.split(':')[1]}` })
      }
    })
    
    // Stop preview if it's currently playing
    AudioEngine.previewStop()
    
    // Delete from DB directly
    await assetRepository.deleteAsset(assetId)
    toast.success('Sample deleted completely')
  }
}

export const sampleAssignmentService = new SampleAssignmentService()
