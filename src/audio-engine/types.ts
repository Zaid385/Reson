export interface PadPlaybackParams {
  assetId: string
  startMarker: number // 0-1 normalized
  endMarker: number // 0-1 normalized
  reverse: boolean
  loop: boolean
  pitchSemitones: number
  gainDb: number // baked "editor" gain, distinct from live pad volume
  attackMs: number
  releaseMs: number
  fadeInMs: number
  fadeOutMs: number
  playMode: 'oneshot' | 'gate'
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
