import * as Tone from 'tone'
import { AudioEngine as IAudioEngine, PadPlaybackParams, VoiceHandle, SampleEditParams, VoiceEventPayload } from './types'
import { BufferRegistry } from './BufferRegistry'
import { VoiceManager } from './VoiceManager'
import { MasterBus } from './MasterBus'
import { PadBus } from './PadBus'
import { engineEvents } from './engineEvents'
import { PreviewPlayer } from './PreviewPlayer'

export class AudioEngineImpl implements IAudioEngine {
  private bufferRegistry: BufferRegistry
  private voiceManager: VoiceManager
  private masterBus: MasterBus
  private previewPlayer: PreviewPlayer
  private padBuses = new Map<string, PadBus>()
  
  constructor() {
    this.bufferRegistry = new BufferRegistry()
    this.masterBus = new MasterBus()
    
    // Initialize 128 pad buses statically for all 4 banks
    const padBusesMap = new Map<string, Tone.InputNode>()
    const prefixes = ['A', 'B', 'C', 'D']
    for (const prefix of prefixes) {
      for (let i = 1; i <= 32; i++) {
        const id = `${prefix}${i.toString().padStart(2, '0')}`
        const padBus = new PadBus()
        padBus.connect(this.masterBus.volumeNode)
        this.padBuses.set(id, padBus)
        padBusesMap.set(id, padBus.volumeNode)
      }
    }

    this.voiceManager = new VoiceManager(this.bufferRegistry, padBusesMap)
    this.previewPlayer = new PreviewPlayer(this.bufferRegistry, this.masterBus.volumeNode)
  }

  async initialize(): Promise<void> {
    await Tone.start()
    Tone.context.lookAhead = 0.05
  }

  async resumeContext(): Promise<void> {
    if (Tone.context.state !== 'running') {
      await Tone.context.resume()
    }
  }

  registerBuffer(assetId: string, buffer: AudioBuffer): void {
    this.bufferRegistry.registerBuffer(assetId, buffer)
  }

  unregisterBuffer(assetId: string): void {
    this.bufferRegistry.unregisterBuffer(assetId)
  }

  triggerPad(padId: string, params: PadPlaybackParams, velocity?: number): VoiceHandle | null {
    this.resumeContext()
    return this.voiceManager.playVoice(padId, params, velocity)
  }

  releasePad(padId: string): void {
    this.voiceManager.releasePad(padId)
  }

  stopPad(padId: string, fadeMs?: number): void {
    this.voiceManager.stopPad(padId, fadeMs)
  }

  setPadVolume(padId: string, volume: number): void {
    this.padBuses.get(padId)?.setVolume(volume)
  }

  setPadPan(padId: string, pan: number): void {
    this.padBuses.get(padId)?.setPan(pan)
  }

  setPadMute(padId: string, muted: boolean): void {
    this.padBuses.get(padId)?.setMute(muted)
  }

  setMasterVolume(volume: number): void {
    this.masterBus.setVolume(volume)
  }

  setMasterMute(muted: boolean): void {
    this.masterBus.setMute(muted)
  }

  previewPlay(assetId: string, editParams: SampleEditParams): void {
    this.resumeContext()
    this.previewPlayer.play(assetId, editParams)
  }
  
  previewStop(): void {
    this.previewPlayer.stop()
  }
  
  previewSeek(positionNormalized: number): void {
    this.previewPlayer.seek(positionNormalized)
  }
  
  getPreviewPlayheadPosition(): number {
    return this.previewPlayer.getPlayheadPosition()
  }

  getActiveVoiceCount(): number {
    return this.voiceManager.getActiveVoiceCount()
  }

  getMasterLevel(): { peak: number; rms: number } {
    return this.masterBus.getLevel()
  }

  on(event: 'voice:started' | 'voice:ended', handler: (payload: VoiceEventPayload) => void): () => void {
    return engineEvents.on(event, handler)
  }
}

export const engine = new AudioEngineImpl()
