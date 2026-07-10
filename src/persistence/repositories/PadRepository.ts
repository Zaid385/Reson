import { db } from '../db'
import { PadData } from '@models/models'

export class PadRepository {
  async getPadsForBank(bankId: string): Promise<PadData[]> {
    return db.pads.where('bankId').equals(bankId).sortBy('slotIndex')
  }

  async updatePad(padId: string, changes: Partial<PadData>): Promise<void> {
    // no updatedAt on PadData
    await db.pads.update(padId, changes)
  }

  async bulkUpdatePads(updates: Array<{ padId: string; changes: Partial<PadData> }>): Promise<void> {
    await db.transaction('rw', db.pads, async () => {
      for (const update of updates) {
        // no updatedAt on PadData
        await db.pads.update(update.padId, update.changes)
      }
    })
  }
}

export const padRepository = new PadRepository()
