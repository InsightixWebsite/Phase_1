export interface GlobePoint {
  x: number
  y: number
  r: number
  opacity: number
}

export interface GlobeOptions {
  rings?: number
  pointsPerRing?: number
  maxRadius?: number
}

/**
 * Deterministically scatters points across latitude "rings" to fake a
 * sphere silhouette for the hero's decorative globe graphic. No randomness
 * — this must render identically on the server and after client hydration.
 */
export function generateGlobePoints(options: GlobeOptions = {}): GlobePoint[] {
  const { rings = 7, pointsPerRing = 16, maxRadius = 120 } = options
  const points: GlobePoint[] = []

  for (let ring = 0; ring < rings; ring++) {
    // 0 at the poles (ring 0 / ring rings-1), maxRadius at the equator.
    const latitudeFraction = Math.sin((Math.PI * (ring + 1)) / (rings + 1))
    const ringRadius = maxRadius * latitudeFraction
    const verticalOffset = maxRadius * (0.5 - (ring + 1) / (rings + 1))
    const opacity = 0.25 + 0.55 * latitudeFraction

    for (let i = 0; i < pointsPerRing; i++) {
      const angle = (2 * Math.PI * i) / pointsPerRing + ring * 0.35
      points.push({
        x: ringRadius * Math.cos(angle),
        y: verticalOffset + ringRadius * 0.35 * Math.sin(angle),
        r: 1.4,
        opacity,
      })
    }
  }

  return points
}
