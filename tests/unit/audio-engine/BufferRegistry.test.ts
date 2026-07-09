import { describe, it, expect, vi } from 'vitest'
import { BufferRegistry } from '@audio-engine/BufferRegistry'

vi.mock('tone', () => {
  return {
    ToneAudioBuffer: class MockToneAudioBuffer {
      constructor() {}
      dispose = vi.fn()
      get = vi.fn()
      reverse = false
    },
    getContext: () => ({
      rawContext: {
        createBuffer: vi.fn()
      }
    })
  }
})

describe('BufferRegistry', () => {
  it('registers and unregisters buffer', () => {
    const registry = new BufferRegistry()
    const dummyBuffer = {} as AudioBuffer
    
    registry.registerBuffer('asset-1', dummyBuffer)
    expect(registry.getBuffer('asset-1')).toBeDefined()
    
    registry.unregisterBuffer('asset-1')
    expect(registry.getBuffer('asset-1')).toBeUndefined()
  })
})
