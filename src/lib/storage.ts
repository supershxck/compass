/**
 * Compass — Local persistence helpers
 * All data stays in the user's browser. No accounts, no servers.
 */

const STORAGE_KEY = 'compass:saved-charts'
const DRAFT_KEY = 'compass:last-birth-draft'

export interface SavedChart {
  id: string
  name: string
  birthData: {
    date: string
    time: string
    lat: number
    lon: number
    unknownTime: boolean
    name?: string
  }
  savedAt: string
}

/** Get all saved charts (most recent first) */
export function getSavedCharts(): SavedChart[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Save a new chart (or overwrite if id matches) */
export function saveChart(chart: Omit<SavedChart, 'id' | 'savedAt'> & { id?: string }): SavedChart {
  const charts = getSavedCharts()

  const now = new Date().toISOString()
  const newChart: SavedChart = {
    id: chart.id || crypto.randomUUID(),
    name: chart.name || 'Untitled Chart',
    birthData: chart.birthData,
    savedAt: now,
  }

  // If an id was provided, replace the existing one
  const filtered = charts.filter(c => c.id !== newChart.id)
  const updated = [newChart, ...filtered].slice(0, 30) // cap at 30 for sanity

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return newChart
}

/** Delete a saved chart by id */
export function deleteChart(id: string): void {
  const charts = getSavedCharts().filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts))
}

/** Save the current birth data as a draft (for "continue where you left off") */
export function saveBirthDraft(birthData: SavedChart['birthData']): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(birthData))
  } catch {}
}

/** Load the last birth data draft */
export function loadBirthDraft(): SavedChart['birthData'] | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
