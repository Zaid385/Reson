/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { assetRepository } from '@persistence/repositories/AssetRepository'
import { AssetData } from '@models/models'

export function useAsset(assetId: string | null) {
  const [asset, setAsset] = useState<AssetData | null>(null)

  useEffect(() => {
    if (!assetId) {
      setAsset(null)
      return
    }

    let isMounted = true
    assetRepository.getAsset(assetId).then(async data => {
      if (!isMounted) return
      
      if (data) {
        setAsset(data)
      } else if (assetId.startsWith('acoustic-kit/')) {
        // Fallback for built-in samples that aren't in the DB
        const { builtInSampleManifest } = await import('@persistence/builtInSampleManifest')
        const generated = builtInSampleManifest.getGeneratedSample(assetId)
        if (generated) {
          setAsset({
            id: assetId,
            name: generated.name,
            sourceType: 'built-in',
            mimeType: 'audio/wav',
            durationSeconds: generated.buffer.duration,
            waveformPeaksLow: generated.peaks.low,
            waveformPeaksHigh: generated.peaks.high,
            refCount: 1,
            fileSizeBytes: 0,
            createdAt: Date.now()
          })
        }
      }
    }).catch(console.error)

    return () => {
      isMounted = false
    }
  }, [assetId])

  return asset
}
