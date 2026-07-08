import { describe, it, expect } from 'vitest'
import { SoloMuteResolver } from '@audio-engine/SoloMuteResolver'

describe('SoloMuteResolver', () => {
  it('should mute pads if no solos and pad is muted', () => {
    const pads = [
      { id: '1', mute: false, solo: false },
      { id: '2', mute: true, solo: false },
    ]
    const result = SoloMuteResolver.resolve(pads)
    expect(result.get('1')).toBe(true)
    expect(result.get('2')).toBe(false)
  })

  it('should only make soloed pads audible when solos are present', () => {
    const pads = [
      { id: '1', mute: false, solo: false },
      { id: '2', mute: true, solo: true },
      { id: '3', mute: false, solo: true },
    ]
    const result = SoloMuteResolver.resolve(pads)
    expect(result.get('1')).toBe(false)
    expect(result.get('2')).toBe(true)
    expect(result.get('3')).toBe(true)
  })
})
