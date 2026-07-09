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
  attackMs: number
  releaseMs: number
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
