export interface PadPlaybackParams {
  assetId: string
  startMarker: number // 0-1 normalized
  endMarker: number // 0-1 normalized
  reverse: boolean
  loop: boolean
  pitchSemitones: number
  gainDb: number // baked "editor" gain, distinct from live pad volume
  attackMs: number
  decayMs: number
  sustainLevel: number
  releaseMs: number
  fadeInMs: number
  fadeOutMs: number
  playMode: 'oneshot' | 'gate'
}

export interface PadFxParams {
  filterEnabled: boolean
  filterType: 'lowpass' | 'highpass' | 'bandpass'
  filterFrequency: number
  filterResonance: number
  
  driveEnabled: boolean
  driveAmount: number
  driveTone: number
  driveMix: number

  bitcrusherEnabled: boolean
  bitcrusherDepth: number
  bitcrusherSampleRate: number
  bitcrusherMix: number

  compressorEnabled: boolean
  compressorThreshold: number
  compressorRatio: number
  compressorMix: number

  delayEnabled: boolean
  delayTime: number
  delayFeedback: number
  delayWet: number
  delayDry: number

  reverbEnabled: boolean
  reverbSize: number
  reverbDecay: number
  reverbWet: number
  reverbDry: number
}

export interface VoiceHandle {
  voiceId: string
  padId: string
}

export interface VoiceEventPayload {
  voiceId: string
  padId: string
}

export interface SampleEditParams {
  startMarker: number
  endMarker: number
  reverse: boolean
  loop: boolean
  pitchSemitones: number
  gainDb: number
  fadeInMs: number
  fadeOutMs: number
}

export interface AudioEngine {
  // Lifecycle
  initialize(): Promise<void>
  resumeContext(): Promise<void>

  // Buffer / Asset registration
  registerBuffer(assetId: string, buffer: AudioBuffer): void
  unregisterBuffer(assetId: string): void

  // Performance triggering
  triggerPad(padId: string, params: PadPlaybackParams, velocity?: number): VoiceHandle | null
  releasePad(padId: string): void
  stopPad(padId: string, fadeMs?: number): void

  // Live parameter updates
  setPadVolume(padId: string, volume: number): void
  setPadPan(padId: string, pan: number): void
  setPadMute(padId: string, muted: boolean): void
  setPadFx(padId: string, params: Partial<PadFxParams>): void
  setMasterVolume(volume: number): void
  setMasterMute(muted: boolean): void

  // Preview Player
  previewPlay(assetId: string, editParams: SampleEditParams): void
  previewStop(): void
  previewSeek(positionNormalized: number): void
  getPreviewPlayheadPosition(): number

  // Introspection
  getActiveVoiceCount(): number
  getMasterLevel(): { peak: number; rms: number }

  // Events
  on(event: 'voice:started' | 'voice:ended', handler: (payload: VoiceEventPayload) => void): () => void
}
