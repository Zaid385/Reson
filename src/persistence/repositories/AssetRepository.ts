import { db } from '../db'
import { AssetData } from '@models/models'
import { v4 as uuidv4 } from 'uuid'

export class AssetRepository {
  async saveAsset(data: Blob | undefined, metadata: Omit<AssetData, 'id' | 'audioData' | 'createdAt'>): Promise<string> {
    const id = uuidv4()
    const now = Date.now()
    
    const asset: AssetData = {
      ...metadata,
      id,
      audioData: data,
      createdAt: now
    }
    
    await db.assets.add(asset)
    return id
  }

  async getAsset(assetId: string): Promise<AssetData | undefined> {
    return db.assets.get(assetId)
  }

  async findExistingAsset(name: string, fileSizeBytes: number, durationSeconds: number): Promise<AssetData | undefined> {
    const assets = await db.assets
      .where('sourceType').equals('user-upload')
      .and(a => a.name === name && a.fileSizeBytes === fileSizeBytes && a.durationSeconds === durationSeconds)
      .toArray()
    return assets[0]
  }

  async incrementRefCount(assetId: string): Promise<void> {
    const asset = await db.assets.get(assetId)
    if (asset) {
      await db.assets.update(assetId, { refCount: asset.refCount + 1 })
    }
  }

  async decrementRefCount(assetId: string): Promise<void> {
    const asset = await db.assets.get(assetId)
    if (asset) {
      const newCount = Math.max(0, asset.refCount - 1)
      if (newCount === 0 && asset.sourceType === 'user-upload') {
        await db.assets.delete(assetId)
      } else {
        await db.assets.update(assetId, { refCount: newCount })
      }
    }
  }

  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 1
      }
    }
    return { usage: 0, quota: 1 }
  }
}

export const assetRepository = new AssetRepository()
