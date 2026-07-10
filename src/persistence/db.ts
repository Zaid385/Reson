import Dexie, { Table } from 'dexie'
import { ProjectData, BankData, PadData, AssetData, SettingsData } from '@models/models'

export class ResonDatabase extends Dexie {
  projects!: Table<ProjectData, string>
  banks!: Table<BankData, string>
  pads!: Table<PadData, string>
  assets!: Table<AssetData, string>
  settings!: Table<SettingsData, string>

  constructor() {
    super('Reson-db')
    
    // Schema definition (Version 1)
    this.version(1).stores({
      projects: 'id, isActive, updatedAt',
      banks: 'id, projectId, [projectId+index]',
      pads: 'id, bankId, [bankId+slotIndex], assetId',
      assets: 'id, sourceType, name',
      settings: 'projectId'
    })
  }
}

export const db = new ResonDatabase()
