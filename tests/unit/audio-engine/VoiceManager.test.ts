import { describe, it, expect, vi } from 'vitest'
import { VoiceManager } from '@audio-engine/VoiceManager'
import { BufferRegistry } from '@audio-engine/BufferRegistry'
import { PadPlaybackParams } from '@audio-engine/types'

vi.mock('tone', () => {
  return {
    Player: class MockPlayer {
      connect = vi.fn()
      start = vi.fn()
      stop = vi.fn()
      dispose = vi.fn()
      buffer = { duration: 1 }
    },
    Gain: class MockGain {
      connect = vi.fn()
      dispose = vi.fn()
      gain = { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn(), value: 0 }
    },
    ToneAudioBuffer: class MockToneAudioBuffer {},
    now: () => 0
  }
})

describe('VoiceManager', () => {
  it('instantiates and plays voice when buffer exists', () => {
    const registry = new BufferRegistry()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(registry, 'getBuffer').mockReturnValue({} as any)
    
    const padBuses = new Map()
    padBuses.set('A01', {})
    
    const vm = new VoiceManager(registry, (padId) => padBuses.get(padId))
    const params: PadPlaybackParams = {
      assetId: 'asset-1', startMarker: 0, endMarker: 1, reverse: false, loop: false,
      pitchSemitones: 0, gainDb: 0, attackMs: 0, releaseMs: 0, fadeInMs: 0, fadeOutMs: 0, playMode: 'oneshot'
    }
    
    const handle = vm.playVoice('A01', params)
    expect(handle).toBeDefined()
    expect(handle?.padId).toBe('A01')
    expect(vm.getActiveVoiceCount()).toBe(1)
  })
})
