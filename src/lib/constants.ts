// Compass — Core constants (self-contained, no external deps)

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const

export type Sign = typeof SIGNS[number]

export const SIGN_GLYPHS: Record<Sign, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
}

export const PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
] as const

export type PlanetName = typeof PLANETS[number]

export const PLANET_GLYPHS: Record<PlanetName, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
}

// Rough element mapping for visual theming (used in wheel later)
export const SIGN_ELEMENTS: Record<Sign, 'fire' | 'earth' | 'air' | 'water'> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water'
}

export function longitudeToSignAndDegree(lon: number): { sign: Sign; degree: number } {
  const normalized = ((lon % 360) + 360) % 360
  const signIndex = Math.floor(normalized / 30)
  const degree = normalized % 30
  return {
    sign: SIGNS[signIndex],
    degree: Math.round(degree * 100) / 100
  }
}

export function formatDegree(deg: number): string {
  const d = Math.floor(deg)
  const m = Math.round((deg - d) * 60)
  return `${d}°${m.toString().padStart(2, '0')}'`
}
