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
    assetRepository.getAsset(assetId).then(data => {
      if (isMounted && data) {
        setAsset(data)
      }
    }).catch(console.error)

    return () => {
      isMounted = false
    }
  }, [assetId])

  return asset
}
