import { describe, it, expect, vi } from 'vitest'
import { PadBus } from '@audio-engine/PadBus'

vi.mock('tone', () => {
  class MockNode {
    connect = vi.fn()
    dispose = vi.fn()
    volume = { value: 0, rampTo: vi.fn() }
    pan = { value: 0, rampTo: vi.fn() }
    gain = { value: 1, rampTo: vi.fn() }
  }
  return {
    Volume: MockNode,
    Panner: MockNode,
    Gain: MockNode,
  }
})

describe('PadBus', () => {
  it('instantiates without error and has nodes', () => {
    const bus = new PadBus()
    expect(bus.volumeNode).toBeDefined()
    expect(bus.pannerNode).toBeDefined()
    expect(bus.output).toBeDefined()
    bus.dispose()
  })

  it('methods do not throw', () => {
    const bus = new PadBus()
    expect(() => bus.setVolume(0.5)).not.toThrow()
    expect(() => bus.setPan(0.5)).not.toThrow()
    expect(() => bus.setMute(true)).not.toThrow()
    bus.dispose()
  })
})
