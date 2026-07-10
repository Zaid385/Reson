export interface PadData {
  id: string
  bankId: string
  slotIndex: number
  assetId: string | null
  displayName: string
  color: string
  volume: number
  pan: number
  pitchSemitones: number
  reverse: boolean
  // Envelope (Amplitude)
  attackMs: number
  decayMs: number
  sustainLevel: number
  releaseMs: number

  // Filter
  filterEnabled: boolean
  filterType: 'lowpass' | 'highpass' | 'bandpass'
  filterFrequency: number
  filterResonance: number

  // Drive
  driveEnabled: boolean
  driveAmount: number
  driveTone: number
  driveMix: number

  // Bitcrusher
  bitcrusherEnabled: boolean
  bitcrusherDepth: number
  bitcrusherSampleRate: number
  bitcrusherMix: number

  // Compressor
  compressorEnabled: boolean
  compressorThreshold: number
  compressorRatio: number
  compressorMix: number

  // Delay
  delayEnabled: boolean
  delayTime: number
  delayFeedback: number
  delayWet: number
  delayDry: number

  // Reverb
  reverbEnabled: boolean
  reverbSize: number
  reverbDecay: number
  reverbWet: number
  reverbDry: number

  // Misc
  mute: boolean
  solo: boolean
  playMode: 'oneshot' | 'gate'
  startMarker: number
  endMarker: number
  loop: boolean
  fadeInMs: number
  fadeOutMs: number
  gainDb: number
  normalizeApplied: boolean
  chokeGroup: string | null
}

export interface BankData {
  id: string
  projectId: string
  index: number
  name: string
}

export interface ProjectData {
  id: string
  name: string
  schemaVersion: number
  createdAt: number
  updatedAt: number
  isActive: boolean
}

export interface AssetData {
  id: string
  name: string
  sourceType: 'built-in' | 'user-upload'
  audioData?: Blob
  mimeType: string
  durationSeconds: number
  waveformPeaksLow: number[]
  waveformPeaksHigh: number[]
  refCount: number
  createdAt: number
  fileSizeBytes: number
}

export interface SettingsData {
  projectId: string
  masterVolume: number
  masterMute: boolean
  confirmBeforeReplace: boolean
  useListView: boolean
  keyboardMappingMode: 'physical' | 'printed'
  keyboardLayout: 'qwerty' | 'azerty' | 'qwertz'
  themeDensity: 'compact' | 'comfortable'
  hasSeenOnboarding: boolean
}

export interface FullProjectSnapshot {
  project: ProjectData
  settings: SettingsData
  banks: BankData[]
  pads: PadData[]
}
