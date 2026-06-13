/**
 * Compass Ephemeris — thin, typed wrapper around @swisseph/browser
 * Moshier mode by default (instant, offline, excellent accuracy for astrology).
 * Whole Sign houses are the pedagogical default for beginners.
 */

import { SwissEphemeris } from '@swisseph/browser'

import type { PlanetName, Sign } from './constants'
import { longitudeToSignAndDegree } from './constants'

let sweInstance: SwissEphemeris | null = null
let initPromise: Promise<SwissEphemeris> | null = null

export interface PlanetPosition {
  name: PlanetName
  longitude: number
  latitude: number
  speed: number
  sign: Sign
  degreeInSign: number
  formatted: string // e.g. "14°32'"
  isRetrograde: boolean
}

export interface HouseData {
  ascendant: number
  mc: number
  cusps: number[] // 12 cusps, Whole Sign friendly
}

export interface NatalChart {
  jd: number
  dateIso: string
  lat: number
  lon: number
  planets: PlanetPosition[]
  houses: HouseData
  houseSystem: 'whole' // we default to Whole Sign for beginners
}

/**
 * Lazy singleton initializer. Safe to call many times.
 */
export async function getSwiss(): Promise<SwissEphemeris> {
  if (sweInstance) return sweInstance
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const swe = new SwissEphemeris()
      await swe.init()
      // Moshier is used automatically. For ultra-precision later:
      // await swe.loadStandardEphemeris()
      sweInstance = swe
      return swe
    } catch (err) {
      console.error('Swiss Ephemeris initialization failed:', err)
      initPromise = null // allow retry
      throw new Error(
        'Failed to initialize Swiss Ephemeris (WASM). ' +
        'This often happens when opening the standalone compass.html directly from the filesystem in certain browsers. ' +
        'Try Chrome/Edge, or serve the file with a local server (e.g. npx serve).'
      )
    }
  })()

  return initPromise
}

/**
 * Convert a JS Date (assumed UTC or with correct offset) to Julian Day.
 */
export function toJulianDay(date: Date, swe: SwissEphemeris): number {
  return swe.dateToJulianDay(date)
}

/**
 * Main entry point: given birth data, return a clean, usable chart object.
 * Time is optional (unknownTime). When unknown we still compute planets but skip houses/Asc.
 */
export async function computeNatalChart(input: {
  date: string
  time?: string
  lat: number
  lon: number
  unknownTime?: boolean
}): Promise<NatalChart> {
  const swe = await getSwiss()

  const dateStr = input.unknownTime
    ? `${input.date}T12:00:00Z`
    : `${input.date}T${input.time || '12:00'}:00Z`

  const birthDate = new Date(dateStr)
  const jd = toJulianDay(birthDate, swe)

  // Planets (Moshier by default)
  const planetNames: PlanetName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
  const swePlanets = ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO']

  const planets: PlanetPosition[] = planetNames.map((name, i) => {
    const pos = swe.calculatePosition(jd, swePlanets[i] as any)
    const { sign, degree } = longitudeToSignAndDegree(pos.longitude)
    const retro = (pos.longitudeSpeed ?? 0) < 0

    return {
      name,
      longitude: pos.longitude,
      latitude: pos.latitude ?? 0,
      speed: pos.longitudeSpeed ?? 0,
      sign,
      degreeInSign: degree,
      formatted: `${Math.floor(degree)}°${Math.round((degree % 1) * 60).toString().padStart(2, '0')}'`,
      isRetrograde: retro,
    }
  })

  let houses: HouseData = { ascendant: 0, mc: 0, cusps: [] }

  if (!input.unknownTime) {
    // Use Whole Sign for pedagogical clarity in a beginner tool
    const h = swe.calculateHouses(jd, input.lat, input.lon, 'W' as any) // 'W' = Whole Sign
    houses = {
      ascendant: h.ascendant,
      mc: h.mc,
      cusps: h.cusps.slice(1, 13) // 1-based in the lib usually
    }
  } else {
    // Fallback: still compute Asc using a simple approximation or skip
    // For now we leave asc at 0; the UI will hide house-dependent features.
  }

  return {
    jd,
    dateIso: birthDate.toISOString(),
    lat: input.lat,
    lon: input.lon,
    planets,
    houses,
    houseSystem: 'whole',
  }
}

/**
 * Quick helper: get current sky positions (for "The Sky Now").
 */
export async function getCurrentSky(): Promise<PlanetPosition[]> {
  const swe = await getSwiss()
  const now = new Date()
  const jd = toJulianDay(now, swe)

  const planetNames: PlanetName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
  const swePlanets = ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO']

  return planetNames.map((name, i) => {
    const pos = swe.calculatePosition(jd, swePlanets[i] as any)
    const { sign, degree } = longitudeToSignAndDegree(pos.longitude)
    const retro = (pos.longitudeSpeed ?? 0) < 0
    return {
      name,
      longitude: pos.longitude,
      latitude: pos.latitude ?? 0,
      speed: pos.longitudeSpeed ?? 0,
      sign,
      degreeInSign: degree,
      formatted: `${Math.floor(degree)}°${Math.round((degree % 1) * 60).toString().padStart(2, '0')}'`,
      isRetrograde: retro,
    }
  })
}
