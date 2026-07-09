import { db } from '../db'
import { PadData } from '@types/models'

export class PadRepository {
  async getPadsForBank(bankId: string): Promise<PadData[]> {
    return db.pads.where('bankId').equals(bankId).sortBy('slotIndex')
  }

  async updatePad(padId: string, changes: Partial<PadData>): Promise<void> {
    changes.updatedAt = Date.now()
    await db.pads.update(padId, changes)
  }

  async bulkUpdatePads(updates: Array<{ padId: string; changes: Partial<PadData> }>): Promise<void> {
    const now = Date.now()
    await db.transaction('rw', db.pads, async () => {
      for (const update of updates) {
        update.changes.updatedAt = now
        await db.pads.update(update.padId, update.changes)
      }
    })
  }
}

export const padRepository = new PadRepository()
