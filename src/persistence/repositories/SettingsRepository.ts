import { db } from '../db'
import { SettingsData } from '@types/models'

export class SettingsRepository {
  async getSettingsForProject(projectId: string): Promise<SettingsData | undefined> {
    return db.settings.get(projectId)
  }

  async updateSettings(projectId: string, changes: Partial<SettingsData>): Promise<void> {
    await db.settings.update(projectId, changes)
  }
}

export const settingsRepository = new SettingsRepository()
