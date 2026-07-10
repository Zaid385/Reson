import { db } from '../db'
import { ProjectData, FullProjectSnapshot } from '@types/models'
import { v4 as uuidv4 } from 'uuid'
import { CURRENT_SCHEMA_VERSION, runMigrations } from '../migrations'

export class ProjectRepository {
  async getActiveProject(): Promise<ProjectData | null> {
    const project = await db.projects.filter(p => p.isActive === true).first()
    if (!project) return null
    
    await runMigrations(project.schemaVersion)
    return project
  }

  async createDefaultProject(): Promise<ProjectData> {
    const projectId = uuidv4()
    const now = Date.now()
    
    const project: ProjectData = {
      id: projectId,
      name: 'My Kit',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      isActive: true
    }
    
    await db.projects.add(project)
    return project
  }

  async saveProjectSnapshot(snapshot: FullProjectSnapshot): Promise<void> {
    const now = Date.now()
    const { project, settings, banks, pads } = snapshot
    
    project.updatedAt = now
    
    await db.transaction('rw', db.projects, db.settings, db.banks, db.pads, async () => {
      await db.projects.put(project)
      await db.settings.put(settings)
      await db.banks.bulkPut(banks)
      await db.pads.bulkPut(pads)
    })
  }

  async listProjects(): Promise<ProjectData[]> {
    return db.projects.orderBy('updatedAt').reverse().toArray()
  }

  async setActiveProject(projectId: string): Promise<void> {
    await db.transaction('rw', db.projects, async () => {
      // Set all to false
      await db.projects.filter(p => p.isActive === true).modify({ isActive: false })
      // Set target to true
      await db.projects.update(projectId, { isActive: true })
    })
  }

  async deleteProject(projectId: string): Promise<void> {
    await db.transaction('rw', db.projects, db.settings, db.banks, db.pads, async () => {
      await db.projects.delete(projectId)
      await db.settings.delete(projectId)
      const banks = await db.banks.where('projectId').equals(projectId).toArray()
      const bankIds = banks.map(b => b.id)
      await db.banks.bulkDelete(bankIds)
      
      for (const bankId of bankIds) {
        const pads = await db.pads.where('bankId').equals(bankId).toArray()
        await db.pads.bulkDelete(pads.map(p => p.id))
      }
    })
  }
}

export const projectRepository = new ProjectRepository()
