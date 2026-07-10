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
    
    // We will dynamically allocate pad buses as needed
    this.voiceManager = new VoiceManager(this.bufferRegistry, (padId) => this.getPadBus(padId).volumeNode)
    this.previewPlayer = new PreviewPlayer(this.bufferRegistry, this.masterBus.volumeNode)
  }

  private getPadBus(padId: string): PadBus {
    if (!this.padBuses.has(padId)) {
      const bus = new PadBus()
      bus.connect(this.masterBus.volumeNode)
      this.padBuses.set(padId, bus)
    }
    return this.padBuses.get(padId)!
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
    this.getPadBus(padId).setVolume(volume)
  }

  setPadPan(padId: string, pan: number): void {
    this.getPadBus(padId).setPan(pan)
  }

  setPadFx(padId: string, params: Partial<PadFxParams>): void {
    this.getPadBus(padId).setFx(params)
  }

  setPadMute(padId: string, muted: boolean): void {
    this.getPadBus(padId).setMute(muted)
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
