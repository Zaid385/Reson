import { describe, it, expect } from 'vitest'
import { clamp, lerp, linearToDb, dbToLinear } from '@utils/math'

describe('math utils', () => {
  it('clamp works', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('lerp works', () => {
    expect(lerp(0, 10, 0.5)).toBe(5)
  })

  it('linearToDb works', () => {
    expect(linearToDb(1)).toBe(0)
    expect(linearToDb(0)).toBe(-Infinity)
  })

  it('dbToLinear works', () => {
    expect(dbToLinear(0)).toBe(1)
  })
})
