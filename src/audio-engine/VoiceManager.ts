import * as Tone from 'tone'
import { Voice } from './Voice'
import { PadPlaybackParams, VoiceHandle } from './types'
import { BufferRegistry } from './BufferRegistry'
import { generateId } from '@utils/id'
import { MAX_VOICES, MAX_VOICES_PER_PAD } from '@config/constants'
import { engineEvents } from './engineEvents'

export class VoiceManager {
  private activeVoices: Voice[] = []
  
  constructor(
    private bufferRegistry: BufferRegistry,
    private padBuses: Map<string, Tone.InputNode>
  ) {}

  playVoice(padId: string, params: PadPlaybackParams, velocity: number = 1): VoiceHandle | null {
    const toneBuffer = this.bufferRegistry.getBuffer(params.assetId, params.reverse)
    if (!toneBuffer) return null

    const destination = this.padBuses.get(padId)
    if (!destination) return null
    
    this.enforceLimits(padId)

    const voiceId = generateId()
    const voice = new Voice(voiceId, padId, toneBuffer, destination)
    
    voice.onEnded = (v) => this.handleVoiceEnded(v)
    this.activeVoices.push(voice)
    
    voice.start(params, velocity)
    
    engineEvents.emit('voice:started', { voiceId, padId })
    return { voiceId, padId }
  }

  releasePad(padId: string) {
    this.activeVoices
      .filter(v => v.padId === padId && v.isPlaying && !v.isReleasing)
      .forEach(v => v.release(v.releaseMs))
  }

  stopPad(padId: string, fadeMs: number = 5) {
    this.activeVoices
      .filter(v => v.padId === padId && v.isPlaying)
      .forEach(v => v.stop(fadeMs))
  }

  private enforceLimits(padId: string) {
    if (this.activeVoices.length >= MAX_VOICES) {
      this.stealOldestVoice()
    }
    
    const padVoices = this.activeVoices.filter(v => v.padId === padId && !v.isReleasing)
    if (padVoices.length >= MAX_VOICES_PER_PAD) {
      const oldest = padVoices[0]
      oldest.stop(5)
    }
  }

  private stealOldestVoice() {
    if (this.activeVoices.length === 0) return
    const oldest = this.activeVoices[0]
    oldest.stop(5)
  }

  private handleVoiceEnded(voice: Voice) {
    const idx = this.activeVoices.indexOf(voice)
    if (idx !== -1) {
      this.activeVoices.splice(idx, 1)
    }
    voice.dispose()
    engineEvents.emit('voice:ended', { voiceId: voice.voiceId, padId: voice.padId })
  }

  getActiveVoiceCount(): number {
    return this.activeVoices.length
  }
}
