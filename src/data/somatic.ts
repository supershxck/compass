/**
 * Compass — Somatic / Body & Sky layer
 *
 * Harvested and adapted from previous astro-body work.
 * Tone: curious, traditional-but-not-literal, empowering for beginners.
 * Never diagnostic or medical advice.
 */

import type { PlanetName, Sign } from '../lib/constants'

// Direct planet → traditional body associations (simplified for beginners)
export const PLANET_BODY_PARTS: Record<PlanetName, string[]> = {
  Sun: ['Heart', 'Spine', 'Upper back', 'Vitality center'],
  Moon: ['Chest', 'Breasts', 'Stomach', 'Fluid systems'],
  Mercury: ['Arms', 'Lungs', 'Hands', 'Nerves', 'Communication pathways'],
  Venus: ['Neck', 'Throat', 'Kidneys', 'Hips', 'Sensual & relational tissues'],
  Mars: ['Head', 'Muscles', 'Blood', 'Inflammatory response'],
  Jupiter: ['Liver', 'Thighs', 'Hips', 'Expansion & growth areas'],
  Saturn: ['Knees', 'Bones', 'Skin', 'Teeth', 'Structural tissues'],
  Uranus: ['Ankles', 'Calves', 'Circulation', 'Nervous system innovations'],
  Neptune: ['Feet', 'Immune system', 'Lymphatic system', 'Boundary tissues'],
  Pluto: ['Reproductive organs', 'Colon', 'Deep transformation sites'],
}

// Zodiac sign → traditional body associations
export const SIGN_BODY_PARTS: Record<Sign, string[]> = {
  Aries: ['Head', 'Face', 'Brain', 'Eyes'],
  Taurus: ['Neck', 'Throat', 'Thyroid', 'Vocal cords'],
  Gemini: ['Arms', 'Lungs', 'Shoulders', 'Hands', 'Nervous system'],
  Cancer: ['Chest', 'Breasts', 'Stomach', 'Digestive fluids'],
  Leo: ['Heart', 'Spine', 'Upper back'],
  Virgo: ['Intestines', 'Digestion', 'Spleen', 'Discrimination systems'],
  Libra: ['Kidneys', 'Lower back', 'Hips', 'Balance organs'],
  Scorpio: ['Reproductive organs', 'Bladder', 'Colon', 'Pelvic basin'],
  Sagittarius: ['Hips', 'Thighs', 'Liver', 'Sciatic nerve'],
  Capricorn: ['Knees', 'Bones', 'Skin', 'Teeth', 'Structural framework'],
  Aquarius: ['Ankles', 'Calves', 'Circulation', 'Shins'],
  Pisces: ['Feet', 'Immune system', 'Lymphatic system', 'Boundary tissues'],
}

// Simple, warm descriptions for beginners
export function getPlanetBodyDescription(planet: PlanetName): string {
  const parts = PLANET_BODY_PARTS[planet].join(', ')
  return `Traditionally associated with the ${parts.toLowerCase()}. When this planet is strong in a chart or currently active, people sometimes notice themes or sensitivity in these areas.`
}

export function getSignBodyDescription(sign: Sign): string {
  const parts = SIGN_BODY_PARTS[sign].join(', ')
  return `The sign ${sign} is classically linked to the ${parts.toLowerCase()}.`
}

// Compute "lit up" body regions from the current chart + sky
export interface BodyActivation {
  region: string
  sources: string[]           // e.g. ["Natal Sun in Leo", "Transiting Mars square natal Moon"]
  intensity: 'gentle' | 'noticeable' | 'strong'
}

export function computeBodyActivations(
  natalPlanets: Array<{ name: PlanetName; sign: Sign }>,
  _currentSky: Array<{ name: PlanetName; sign: Sign }>, // reserved for future use
  personalContacts: Array<any>
): BodyActivation[] {
  const activations = new Map<string, BodyActivation>()

  // 1. Natal signatures (what your chart naturally emphasizes)
  natalPlanets.forEach(p => {
    const signParts = SIGN_BODY_PARTS[p.sign] || []
    const planetParts = PLANET_BODY_PARTS[p.name] || []

    const allRegions = [...new Set([...signParts, ...planetParts])]

    allRegions.forEach(region => {
      if (!activations.has(region)) {
        activations.set(region, { region, sources: [], intensity: 'gentle' })
      }
      const act = activations.get(region)!
      act.sources.push(`Natal ${p.name} in ${p.sign}`)
      if (['Sun', 'Moon'].includes(p.name)) act.intensity = 'noticeable'
    })
  })

  // 2. Current transits that are contacting the natal chart
  personalContacts.forEach(contact => {
    const tPlanet = contact.transiting.name as PlanetName
    const nPlanet = contact.natal.name as PlanetName

    const transitParts = PLANET_BODY_PARTS[tPlanet] || []
    const natalParts = PLANET_BODY_PARTS[nPlanet] || []

    const relevantRegions = [...new Set([...transitParts, ...natalParts])]

    relevantRegions.forEach(region => {
      if (!activations.has(region)) {
        activations.set(region, { region, sources: [], intensity: 'gentle' })
      }
      const act = activations.get(region)!
      act.sources.push(`Transiting ${tPlanet} ${contact.aspect.aspect} natal ${nPlanet}`)
      act.intensity = 'strong'
    })
  })

  // Sort so stronger / more mentioned regions come first
  return Array.from(activations.values())
    .sort((a, b) => {
      const intensityOrder = { strong: 3, noticeable: 2, gentle: 1 }
      return intensityOrder[b.intensity] - intensityOrder[a.intensity] || b.sources.length - a.sources.length
    })
    .slice(0, 8) // keep it digestible for beginners
}
