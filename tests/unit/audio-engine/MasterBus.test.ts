import { describe, it, expect, vi } from 'vitest'
import { MasterBus } from '@audio-engine/MasterBus'

vi.mock('tone', () => {
  class MockNode {
    connect = vi.fn()
    dispose = vi.fn()
    toDestination = vi.fn()
    volume = { value: 0, rampTo: vi.fn() }
    getValue = vi.fn().mockReturnValue([-6, -6])
  }
  return {
    Volume: MockNode,
    Meter: MockNode,
  }
})

describe('MasterBus', () => {
  it('instantiates without error and has nodes', () => {
    const bus = new MasterBus()
    expect(bus.volumeNode).toBeDefined()
    expect(bus.muteNode).toBeDefined()
    expect(bus.analyser).toBeDefined()
    bus.dispose()
  })

  it('methods do not throw', () => {
    const bus = new MasterBus()
    expect(() => bus.setVolume(0.5)).not.toThrow()
    expect(() => bus.setMute(true)).not.toThrow()
    expect(() => bus.getLevel()).not.toThrow()
    bus.dispose()
  })
})
