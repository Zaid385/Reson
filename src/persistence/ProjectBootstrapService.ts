 
import { projectRepository } from './repositories/ProjectRepository'
import { bankRepository } from './repositories/BankRepository'
import { padRepository } from './repositories/PadRepository'
import { settingsRepository } from './repositories/SettingsRepository'
import { FullProjectSnapshot, ProjectData, BankData, PadData, SettingsData } from '@models/models'
import { v4 as uuidv4 } from 'uuid'


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
      // Hydrate with defaults in case of older schema versions
      const hydratedPads = bankPads.map(pad => ({
        ...this.createDefaultPad(pad.bankId, pad.slotIndex),
        ...pad
      }))
      pads = pads.concat(hydratedPads)
    }

    return {
      project,
      settings: settings!,
      banks,
      pads
    }
  }

  createDefaultPad(bankId: string, slot: number): PadData {
    return {
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
      decayMs: 0,
      sustainLevel: 1,
      releaseMs: 50,
      
      filterEnabled: false,
      filterType: 'lowpass',
      filterFrequency: 20000,
      filterResonance: 0,

      driveEnabled: false,
      driveAmount: 0,
      driveTone: 20000,
      driveMix: 1,

      bitcrusherEnabled: false,
      bitcrusherDepth: 8,
      bitcrusherSampleRate: 44100,
      bitcrusherMix: 1,

      compressorEnabled: false,
      compressorThreshold: -24,
      compressorRatio: 4,
      compressorMix: 1,

      delayEnabled: false,
      delayTime: 0.25,
      delayFeedback: 0.4,
      delayWet: 0.5,
      delayDry: 1,

      reverbEnabled: false,
      reverbSize: 0.7,
      reverbDecay: 3,
      reverbWet: 0.5,
      reverbDry: 1,

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
    }
  }

  async createAndSaveDefaultProject(): Promise<ProjectData> {
    const project = await projectRepository.createDefaultProject()

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
        pads.push(this.createDefaultPad(bankId, slot))
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
