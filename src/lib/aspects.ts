/**
 * Simple, beginner-friendly aspect calculator.
 * Used for "The Sky Now" personal contacts.
 */

export type AspectName = 'conjunction' | 'opposition' | 'square' | 'trine' | 'sextile'

export interface AspectHit {
  aspect: AspectName
  orb: number
  applying: boolean   // rough heuristic
  angle: number
}

const ASPECTS: Record<AspectName, number> = {
  conjunction: 0,
  opposition: 180,
  square: 90,
  trine: 120,
  sextile: 60,
}

const ORB = 8 // generous beginner-friendly orb

export function getAspect(lon1: number, lon2: number): AspectHit | null {
  let diff = Math.abs(((lon1 - lon2 + 180) % 360) - 180)
  diff = Math.min(diff, 360 - diff)

  for (const [name, target] of Object.entries(ASPECTS) as [AspectName, number][]) {
    const orb = Math.abs(diff - target)
    if (orb <= ORB) {
      // Very rough applying/separating using current speeds would be better,
      // but for the "sky now" view this is acceptable.
      return {
        aspect: name,
        orb: Math.round(orb * 10) / 10,
        applying: false, // we can improve later
        angle: target,
      }
    }
  }
  return null
}

export function aspectSymbol(aspect: AspectName): string {
  switch (aspect) {
    case 'conjunction': return '☌'
    case 'opposition': return '☍'
    case 'square': return '□'
    case 'trine': return '△'
    case 'sextile': return '⚹'
  }
}

export function aspectLabel(aspect: AspectName): string {
  return aspect.charAt(0).toUpperCase() + aspect.slice(1)
}
