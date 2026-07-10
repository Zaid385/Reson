import { useStore } from '@state/store'
import { assetRepository } from '@persistence/repositories/AssetRepository'
import { projectRepository } from '@persistence/repositories/ProjectRepository'
import { db } from '@persistence/db'
import { FullProjectSnapshot, AssetData } from '@types/models'

export interface ExportFormat {
  formatVersion: number
  exportedAt: string
  project: any
  settings: any
  banks: any[]
  assets: any[]
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      // data:audio/wav;base64,.... -> extract just the base64 part
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const base64ToBlob = async (base64: string, mimeType: string): Promise<Blob> => {
  const res = await fetch(`data:${mimeType};base64,${base64}`)
  return await res.blob()
}

export class ProjectIoService {
  
  async exportProject(exportName: string): Promise<void> {
    const state = useStore.getState()
    const snapshot: FullProjectSnapshot = {
      project: state.activeProject!,
      settings: state.settings!,
      banks: state.banks,
      pads: Object.values(state.pads)
    }

    // Collect used asset IDs
    const usedAssetIds = new Set<string>()
    for (const pad of snapshot.pads) {
      if (pad.assetId) {
        usedAssetIds.add(pad.assetId)
      }
    }

    const exportedAssets: any[] = []
    
    for (const assetId of Array.from(usedAssetIds)) {
      const asset = await assetRepository.getAsset(assetId)
      if (asset) {
        const exportedAsset: any = {
          id: asset.id,
          name: asset.name,
          sourceType: asset.sourceType,
          mimeType: asset.mimeType,
          durationSeconds: asset.durationSeconds,
          waveformPeaksLow: asset.waveformPeaksLow,
          waveformPeaksHigh: asset.waveformPeaksHigh,
          fileSizeBytes: asset.fileSizeBytes,
        }

        // Only inline audio if it's user uploaded
        if (asset.sourceType === 'user-upload' && asset.audioData) {
          exportedAsset.audioDataBase64 = await blobToBase64(asset.audioData)
        }
        
        exportedAssets.push(exportedAsset)
      }
    }

    // Format banks exactly as specified in 08_DATABASE.md
    const formattedBanks = snapshot.banks.map(bank => {
      return {
        ...bank,
        pads: snapshot.pads
          .filter(p => p.bankId === bank.id)
          .map(p => ({
            ...p,
            assetRef: p.assetId // map to assetRef for export as per docs
          }))
      }
    })

    const exportData: ExportFormat = {
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      project: {
        ...snapshot.project,
        name: exportName
      },
      settings: snapshot.settings,
      banks: formattedBanks,
      assets: exportedAssets
    }

    // Trigger download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportName.endsWith('.json') ? exportName : `${exportName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async importProject(file: File): Promise<boolean> {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as ExportFormat
      
      if (!data.formatVersion || !data.project) {
        throw new Error("Invalid project file")
      }

      // Generate a new project ID for the imported project to avoid collisions
      const newProjectId = crypto.randomUUID()
      data.project.id = newProjectId
      
      if (data.settings) {
        data.settings.projectId = newProjectId
      }

      // We need to decode assets and store them, keeping their IDs intact if possible,
      // or generating new ones. For simplicity, we keep original IDs since it's local.
      // Wait, if importing on same machine, asset ID might clash.
      // We should generate new asset IDs and map them.
      const assetIdMap = new Map<string, string>()

      for (const exportedAsset of data.assets) {
        let finalAssetId = exportedAsset.id
        
        // If it's a built-in ref, we can just use the original ID
        if (exportedAsset.sourceType === 'user-upload' && exportedAsset.audioDataBase64) {
          // Check if an identical asset already exists in the local database
          const existingAsset = await assetRepository.findExistingAsset(
            exportedAsset.name,
            exportedAsset.fileSizeBytes,
            exportedAsset.durationSeconds
          )

          if (existingAsset) {
            // Deduplicate: use the existing asset ID instead of creating a new one
            assetIdMap.set(exportedAsset.id, existingAsset.id)
          } else {
            const blob = await base64ToBlob(exportedAsset.audioDataBase64, exportedAsset.mimeType)
            
            const newAssetId = await assetRepository.saveAsset(blob, {
              name: exportedAsset.name,
              sourceType: 'user-upload',
              mimeType: exportedAsset.mimeType,
              durationSeconds: exportedAsset.durationSeconds,
              waveformPeaksLow: exportedAsset.waveformPeaksLow,
              waveformPeaksHigh: exportedAsset.waveformPeaksHigh,
              refCount: 0, // Will be incremented when pads are imported
              fileSizeBytes: exportedAsset.fileSizeBytes
            })
            assetIdMap.set(exportedAsset.id, newAssetId)
          }
        } else {
          assetIdMap.set(exportedAsset.id, exportedAsset.id)
        }
      }

      // Now map the pads and increment ref counts, and generate new bank/pad IDs
      const allPads: any[] = []
      
      for (const bank of data.banks) {
        const oldBankId = bank.id
        const newBankId = crypto.randomUUID()
        bank.id = newBankId
        bank.projectId = newProjectId

        for (const pad of bank.pads) {
          pad.bankId = newBankId
          // reconstruct pad id using new bank id
          pad.id = `${newBankId}:${pad.slotIndex}`
          
          if (pad.assetRef) {
            pad.assetId = assetIdMap.get(pad.assetRef) || pad.assetRef
            if (pad.assetId) {
              await assetRepository.incrementRefCount(pad.assetId)
            }
          } else {
            pad.assetId = null
          }
          // Remove assetRef
          delete pad.assetRef
          allPads.push(pad)
        }
        delete bank.pads
      }

      // Check if current project is empty. If so, replace it by deleting it first.
      const currentActive = await projectRepository.getActiveProject()
      if (currentActive) {
        const isEmpty = await projectRepository.isProjectEmpty(currentActive.id)
        if (isEmpty) {
          await projectRepository.deleteProject(currentActive.id)
        }
      }

      // Write everything to DB
      await db.transaction('rw', db.projects, db.settings, db.banks, db.pads, async () => {
        // Deselect previous project (if it wasn't deleted)
        await db.projects.filter(p => p.isActive).modify({ isActive: false })
        
        data.project.isActive = true
        await db.projects.put(data.project)
        await db.settings.put(data.settings)
        await db.banks.bulkPut(data.banks)
        await db.pads.bulkPut(allPads)
      })

      // Reload the page to bootstrap the new project
      window.location.reload()
      return true
    } catch (e) {
      console.error('Import failed', e)
      return false
    }
  }
}

export const projectIoService = new ProjectIoService()
