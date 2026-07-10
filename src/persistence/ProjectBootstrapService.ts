import { projectRepository } from './repositories/ProjectRepository'
import { bankRepository } from './repositories/BankRepository'
import { padRepository } from './repositories/PadRepository'
import { settingsRepository } from './repositories/SettingsRepository'
import { FullProjectSnapshot, ProjectData, BankData, PadData, SettingsData } from '@types/models'
import { v4 as uuidv4 } from 'uuid'
import { CURRENT_SCHEMA_VERSION } from './migrations'

export class ProjectBootstrapService {
  async loadActiveProject(): Promise<FullProjectSnapshot> {
    let project = await projectRepository.getActiveProject()

    if (!project) {
      project = await this.createAndSaveDefaultProject()
    }

    const settings = await settingsRepository.getSettingsForProject(project.id)
    const banks = await bankRepository.getBanksForProject(project.id)
    
    let pads: PadData[] = []
    for (const bank of banks) {
      const bankPads = await padRepository.getPadsForBank(bank.id)
      pads = pads.concat(bankPads)
    }

    return {
      project,
      settings: settings!,
      banks,
      pads
    }
  }

  async createAndSaveDefaultProject(): Promise<ProjectData> {
    const project = await projectRepository.createDefaultProject()
    const now = Date.now()

    const settings: SettingsData = {
      projectId: project.id,
      masterVolume: 0.8,
      masterMute: false,
      confirmBeforeReplace: true,
      useListView: false,
      keyboardMappingMode: 'physical',
      keyboardLayout: 'qwerty',
      themeDensity: 'comfortable',
      hasSeenOnboarding: false
    }

    const banks: BankData[] = []
    const pads: PadData[] = []

    const bankLetters = ['A', 'B', 'C', 'D']
    for (let i = 0; i < 4; i++) {
      const bankId = uuidv4()
      banks.push({
        id: bankId,
        projectId: project.id,
        index: i,
        name: `Bank ${bankLetters[i]}`
      })

      for (let slot = 0; slot < 32; slot++) {
        pads.push({
          id: `${bankId}:${slot}`,
          bankId,
          slotIndex: slot,
          assetId: null,
          displayName: '',
          color: '#00F0FF',
          volume: 0.8,
          pan: 0,
          pitchSemitones: 0,
          reverse: false,
          attackMs: 0,
          releaseMs: 50,
          mute: false,
          solo: false,
          playMode: 'oneshot',
          startMarker: 0,
          endMarker: 1,
          loop: false,
          fadeInMs: 0,
          fadeOutMs: 0,
          gainDb: 0,
          normalizeApplied: false,
          chokeGroup: null
        })
      }
    }

    await projectRepository.saveProjectSnapshot({
      project,
      settings,
      banks,
      pads
    })

    return project
  }
}

export const projectBootstrapService = new ProjectBootstrapService()
