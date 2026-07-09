import { useState, useEffect } from 'react'
import { assetRepository } from '@persistence/repositories/AssetRepository'
import { AssetData } from '@types/models'

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
        const url = await builtInSampleManifest.getSampleUrl(assetId)
        if (url && isMounted) {
          setAsset({
            id: assetId,
            name: assetId.split('/').pop() || assetId,
            sourceType: 'built-in',
            durationSeconds: 1, // We don't know the exact duration without fetching
            waveformPeaksLow: [],
            waveformPeaksHigh: []
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
