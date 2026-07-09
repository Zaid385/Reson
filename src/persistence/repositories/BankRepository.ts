import { db } from '../db'
import { BankData } from '@types/models'

export class BankRepository {
  async getBanksForProject(projectId: string): Promise<BankData[]> {
    return db.banks.where('projectId').equals(projectId).sortBy('index')
  }
}

export const bankRepository = new BankRepository()
