import { describe, it, expect } from 'vitest'
import { generateGlobePoints } from './particleGlobe'

describe('generateGlobePoints', () => {
  it('returns rings * pointsPerRing points', () => {
    expect(generateGlobePoints({ rings: 3, pointsPerRing: 4 })).toHaveLength(12)
  })

  it('defaults to a reasonable point count', () => {
    expect(generateGlobePoints().length).toBeGreaterThan(0)
  })

  it('returns an empty array when rings is 0', () => {
    expect(generateGlobePoints({ rings: 0, pointsPerRing: 10 })).toEqual([])
  })

  it('keeps every point within maxRadius on the x axis, with valid opacity', () => {
    const maxRadius = 50
    const points = generateGlobePoints({ rings: 5, pointsPerRing: 8, maxRadius })
    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(-maxRadius)
      expect(point.x).toBeLessThanOrEqual(maxRadius)
      expect(point.opacity).toBeGreaterThan(0)
      expect(point.opacity).toBeLessThanOrEqual(1)
      expect(point.r).toBeGreaterThan(0)
      expect(Number.isFinite(point.y)).toBe(true)
    }
  })

  it('is deterministic across calls with the same options', () => {
    const a = generateGlobePoints({ rings: 4, pointsPerRing: 6, maxRadius: 80 })
    const b = generateGlobePoints({ rings: 4, pointsPerRing: 6, maxRadius: 80 })
    expect(a).toEqual(b)
  })
})
