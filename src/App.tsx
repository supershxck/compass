import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Star, BookOpen, Save, RefreshCw, Loader2 } from 'lucide-react'
import { computeNatalChart, type NatalChart, getCurrentSky } from './lib/ephemeris'
import type { PlanetPosition } from './lib/ephemeris'
import { longitudeToSignAndDegree, PLANET_GLYPHS } from './lib/constants'
import { getBigThreeText } from './data/interpretations'
import { getAspect, aspectSymbol, type AspectHit } from './lib/aspects'
import { ChartWheel } from './components/ChartWheel'
import { computeBodyActivations, type BodyActivation } from './data/somatic'
import { BodyMap } from './components/BodyMap'
import { getSavedCharts, saveChart, deleteChart, saveBirthDraft, loadBirthDraft, type SavedChart } from './lib/storage'
import { generateReflectionPrompts } from './data/prompts'
import { Learn } from './components/Learn'

interface BirthData {
  date: string
  time: string
  lat: number
  lon: number
  unknownTime: boolean
  name?: string
}

function App() {
  const [birthData, setBirthData] = useState<BirthData>({
    date: '',
    time: '12:00',
    lat: 40.7128,   // Default: New York
    lon: -74.0060,
    unknownTime: false,
    name: '',
  })
  const [hasCalculated, setHasCalculated] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [chart, setChart] = useState<NatalChart | null>(null)
  const [calcError, setCalcError] = useState<string | null>(null)

  // Live sky + personal contacts
  const [currentSky, setCurrentSky] = useState<PlanetPosition[] | null>(null)
  const [skyLoading, setSkyLoading] = useState(false)
  const [personalContacts, setPersonalContacts] = useState<Array<{
    transiting: PlanetPosition
    natal: PlanetPosition
    aspect: AspectHit
  }>>([])

  const [highlightedPlanet, setHighlightedPlanet] = useState<string | null>(null)
  const [bodyActivations, setBodyActivations] = useState<BodyActivation[]>([])
  const [selectedBodyRegion, setSelectedBodyRegion] = useState<string | null>(null)

  // Saved charts
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>(() => getSavedCharts())
  const [showSavedPanel, setShowSavedPanel] = useState(false)
  const [saveName, setSaveName] = useState('')

  // Learn modal
  const [showLearn, setShowLearn] = useState(false)

  // Reflection notes (simple global journal for now)
  const [reflections, setReflections] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('compass:reflections')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  // On first load, restore last birth draft if it exists
  useEffect(() => {
    const draft = loadBirthDraft()
    if (draft && !hasCalculated) {
      setBirthData(draft)
    }
  }, []) // run once on mount

  // Reflection prompts — regenerated when chart or contacts change
  const reflectionPrompts = chart
    ? generateReflectionPrompts(chart.planets, personalContacts)
    : []

  const updateField = (field: keyof BirthData, value: string | number | boolean) => {
    setBirthData(prev => ({ ...prev, [field]: value }))
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please enter lat/lon manually.")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateField('lat', Number(pos.coords.latitude.toFixed(4)))
        updateField('lon', Number(pos.coords.longitude.toFixed(4)))
        setIsLocating(false)
      },
      (err) => {
        alert("Could not get your location: " + err.message)
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleCalculate = async () => {
    if (!birthData.date) {
      alert("Please enter a birth date.")
      return
    }
    setIsCalculating(true)
    setCalcError(null)

    try {
      const result = await computeNatalChart({
        date: birthData.date,
        time: birthData.time,
        lat: birthData.lat,
        lon: birthData.lon,
        unknownTime: birthData.unknownTime,
      })
      setChart(result)
      setHasCalculated(true)
      saveBirthDraft(birthData) // persist draft for next visit

      // Also fetch the current sky and compute personal contacts
      await loadCurrentSkyAndContacts(result)
    } catch (err) {
      console.error(err)
      setCalcError(err instanceof Error ? err.message : 'Calculation failed. Please check your inputs.')
    } finally {
      setIsCalculating(false)
    }
  }

  const reset = () => {
    setHasCalculated(false)
    setChart(null)
    setCalcError(null)
    setCurrentSky(null)
    setPersonalContacts([])
    setBodyActivations([])
    setSelectedBodyRegion(null)
    setHighlightedPlanet(null)
    setSaveName('')
    setShowSavedPanel(false)
  }

  const loadCurrentSkyAndContacts = async (natal: NatalChart) => {
    setSkyLoading(true)
    try {
      const sky = await getCurrentSky()
      setCurrentSky(sky)

      // Find meaningful personal contacts (transiting planet aspecting natal planet)
      const contacts: Array<{
        transiting: PlanetPosition
        natal: PlanetPosition
        aspect: AspectHit
      }> = []

      sky.forEach(transiting => {
        natal.planets.forEach(natalPlanet => {
          const hit = getAspect(transiting.longitude, natalPlanet.longitude)
          if (hit && natalPlanet.name !== transiting.name) {
            contacts.push({ transiting, natal: natalPlanet, aspect: hit })
          }
        })
      })

      // Sort by tightest orb
      contacts.sort((a, b) => a.aspect.orb - b.aspect.orb)
      const topContacts = contacts.slice(0, 6)
      setPersonalContacts(topContacts)

      // Compute somatic / body activations
      const natalForSomatic = natal.planets.map(p => ({ name: p.name, sign: p.sign }))
      const activations = computeBodyActivations(natalForSomatic, sky, topContacts)
      setBodyActivations(activations)
    } catch (e) {
      console.error('Failed to load current sky', e)
    } finally {
      setSkyLoading(false)
    }
  }

  const useExample = () => {
    // A friendly, well-known example: someone born in the evening in a major city
    setBirthData({
      date: '1990-07-15',
      time: '21:30',
      lat: 51.5074,   // London
      lon: -0.1278,
      unknownTime: false,
      name: 'Example: London Evening',
    })
    setHasCalculated(false)
  }

  const handleSaveChart = () => {
    if (!chart) return
    const displayName = saveName.trim() || birthData.name || `Chart • ${birthData.date}`
    const saved = saveChart({
      name: displayName,
      birthData,
    })
    setSavedCharts(getSavedCharts())
    setSaveName('')
    // Nice feedback
    alert(`Saved as "${saved.name}"`)
  }

  const handleLoadSaved = async (saved: SavedChart) => {
    setBirthData(saved.birthData)
    setShowSavedPanel(false)
    setSaveName('')

    // Trigger full calculation flow
    setIsCalculating(true)
    setCalcError(null)
    try {
      const result = await computeNatalChart(saved.birthData)
      setChart(result)
      setHasCalculated(true)
      await loadCurrentSkyAndContacts(result)
    } catch (err) {
      console.error(err)
      setCalcError('Failed to load the saved chart.')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleDeleteSaved = (id: string) => {
    if (!confirm('Delete this saved chart?')) return
    deleteChart(id)
    setSavedCharts(getSavedCharts())
  }

  const updateReflection = (key: string, value: string) => {
    const next = { ...reflections, [key]: value }
    setReflections(next)
    try {
      localStorage.setItem('compass:reflections', JSON.stringify(next))
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-[#c8d1e0]">
      {/* Calm, spacious header */}
      <header className="border-b border-[#2a3855] bg-[#0a0f1c]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c5a26f] flex items-center justify-center">
              <Star className="w-4 h-4 text-[#0a0f1c]" />
            </div>
            <div>
              <div className="font-semibold tracking-[0.5px] text-lg text-[#f0e6d2]">compass</div>
              <div className="text-[10px] text-[#8a96b0] -mt-1">your sky, made simple</div>
            </div>
          </div>

          <nav className="flex items-center gap-2 text-sm">
            <button 
              className="btn-ghost flex items-center gap-2" 
              onClick={() => setShowLearn(true)}
            >
              <BookOpen className="w-4 h-4" /> Learn
            </button>
            <button
              className="btn-ghost flex items-center gap-2"
              onClick={() => setShowSavedPanel(true)}
            >
              <Save className="w-4 h-4" /> Saved {savedCharts.length > 0 && `(${savedCharts.length})`}
            </button>
            <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" /> New Chart
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero / Invitation */}
        {!hasCalculated && (
          <div className="text-center mb-12 pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#121a2e] border border-[#2a3855] text-xs tracking-[1px] mb-4">
              ACCURATE • LOCAL • BEGINNER-FRIENDLY
            </div>
            <h1 className="text-6xl font-semibold tracking-tighter text-[#f0e6d2] text-balance">
              Meet your sky.
            </h1>
            <p className="mt-4 max-w-md mx-auto text-xl text-[#8a96b0]">
              A quiet, powerful space to understand your birth chart — without the jargon or overwhelm.
            </p>
            <button onClick={useExample} className="mt-6 text-sm underline underline-offset-4 text-[#c5a26f]">
              Try an example chart instead
            </button>
          </div>
        )}

        {/* Birth Data Form — spacious and calm */}
        {!hasCalculated && (
          <div className="max-w-2xl mx-auto">
            <div className="card p-8">
              <h2 className="text-2xl tracking-tight text-[#f0e6d2] mb-6">Enter your birth details</h2>

              <div className="space-y-6">
                {/* Name (optional) */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#8a96b0] mb-1.5">Chart name (optional)</label>
                  <input
                    type="text"
                    value={birthData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="My natal chart"
                    className="input w-full"
                  />
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8a96b0] mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Birth date
                    </label>
                    <input
                      type="date"
                      value={birthData.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8a96b0] mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Birth time (local)
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="time"
                        value={birthData.time}
                        onChange={(e) => updateField('time', e.target.value)}
                        className="input flex-1"
                        disabled={birthData.unknownTime}
                      />
                      <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={birthData.unknownTime}
                          onChange={(e) => updateField('unknownTime', e.target.checked)}
                        />
                        <span className="text-[#8a96b0]">I don't know</span>
                      </label>
                    </div>
                    {birthData.unknownTime && (
                      <p className="text-xs text-[#8a96b0] mt-1.5">We'll work with sign placements only. Rising sign &amp; houses need a birth time.</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#8a96b0] mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Birth location
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={birthData.lat}
                        onChange={(e) => updateField('lat', parseFloat(e.target.value))}
                        className="input w-full"
                        placeholder="Latitude"
                      />
                      <div className="text-[10px] text-[#8a96b0] mt-0.5 pl-1">Latitude (−90 to 90)</div>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={birthData.lon}
                        onChange={(e) => updateField('lon', parseFloat(e.target.value))}
                        className="input w-full"
                        placeholder="Longitude"
                      />
                      <div className="text-[10px] text-[#8a96b0] mt-0.5 pl-1">Longitude (−180 to 180)</div>
                    </div>
                    <div className="sm:col-span-1 flex items-end">
                      <button
                        onClick={handleGeolocate}
                        disabled={isLocating}
                        className="btn-secondary w-full h-[46px] text-sm flex items-center justify-center gap-2"
                      >
                        {isLocating ? 'Locating…' : 'Use my location'}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#8a96b0] mt-2 pl-0.5">
                    Accurate location gives a precise Ascendant and houses. Timezone is derived from the date + location.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={handleCalculate} className="btn flex-1 text-base py-3.5">
                  Draw my chart
                </button>
                <button onClick={useExample} className="btn-secondary flex-1 text-base py-3.5">
                  Load example
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-[#8a96b0] mt-6 max-w-sm mx-auto">
              Your data never leaves this browser. Everything is calculated locally using Swiss Ephemeris.
            </p>
          </div>
        )}

        {/* === Your Sky — the heart of the beginner experience === */}
        {hasCalculated && chart && (
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <div className="uppercase tracking-[2px] text-xs text-[#c5a26f]">Your natal chart</div>
                <h2 className="text-4xl tracking-tighter text-[#f0e6d2]">{birthData.name || 'Untitled Chart'}</h2>
                <div className="text-sm text-[#8a96b0] mt-1">
                  {birthData.date} {birthData.unknownTime ? '(time unknown)' : `at ${birthData.time}`} • {birthData.lat}° N, {birthData.lon}° E
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Name this chart (optional)"
                    className="input text-sm w-48"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveChart() }}
                  />
                  <button onClick={handleSaveChart} className="btn-secondary text-sm px-4">
                    Save
                  </button>
                </div>
                <button onClick={reset} className="btn-secondary text-sm">Edit birth data</button>
              </div>
            </div>

            {calcError && <div className="mb-4 text-red-400 text-sm">{calcError}</div>}

            {/* === Interactive Chart Wheel === */}
            <div className="flex flex-col items-center mb-8 -mx-4">
              <div className="relative">
                <ChartWheel
                  chart={chart}
                  size={380}
                  onPlanetClick={(p) => {
                    setHighlightedPlanet(p.name)
                    setTimeout(() => setHighlightedPlanet(null), 2200)
                  }}
                  highlightedPlanet={highlightedPlanet}
                  currentSky={currentSky || undefined}
                  onTransitClick={(tp) => {
                    const natalMatch = chart.planets.find(p => p.name === tp.name)
                    if (natalMatch) {
                      setHighlightedPlanet(natalMatch.name)
                      setTimeout(() => setHighlightedPlanet(null), 2200)
                    }
                  }}
                />
              </div>

              {currentSky && (
                <div className="text-[11px] text-[#8a96b0] -mt-1 flex items-center gap-2">
                  <span className="inline-block w-3 h-px border-t border-dashed border-[#c5a26f] opacity-60" /> 
                  Dashed ring = current sky (transiting planets)
                </div>
              )}
            </div>

            {/* === The Big Three — warm, personal language === */}
            <div className="mb-8">
              <div className="uppercase tracking-[1.5px] text-xs text-[#c5a26f] mb-3 px-1">The Big Three</div>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Sun */}
                {chart.planets.find(p => p.name === 'Sun') && (() => {
                  const sun = chart.planets.find(p => p.name === 'Sun')!
                  return (
                    <div className="card p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">☉</span>
                        <div>
                          <div className="text-sm text-[#8a96b0]">Sun in</div>
                          <div className="text-xl font-semibold text-[#f0e6d2]">{sun.sign}</div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-[#c8d1e0]">{getBigThreeText('sun', sun.sign)}</p>
                    </div>
                  )
                })()}

                {/* Moon */}
                {chart.planets.find(p => p.name === 'Moon') && (() => {
                  const moon = chart.planets.find(p => p.name === 'Moon')!
                  return (
                    <div className="card p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">☽</span>
                        <div>
                          <div className="text-sm text-[#8a96b0]">Moon in</div>
                          <div className="text-xl font-semibold text-[#f0e6d2]">{moon.sign}</div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-[#c8d1e0]">{getBigThreeText('moon', moon.sign)}</p>
                    </div>
                  )
                })()}

                {/* Rising */}
                {!birthData.unknownTime && chart.houses.ascendant > 0 && (() => {
                  const { sign } = longitudeToSignAndDegree(chart.houses.ascendant)
                  return (
                    <div className="card p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">Asc</span>
                        <div>
                          <div className="text-sm text-[#8a96b0]">Rising Sign</div>
                          <div className="text-xl font-semibold text-[#f0e6d2]">{sign}</div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-[#c8d1e0]">{getBigThreeText('rising', sign)}</p>
                      <div className="text-[10px] text-[#8a96b0] mt-3">The style in which you meet the world</div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* All Planets + Live Sky side by side */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Natal Planets */}
              <div className="lg:col-span-5 card p-7">
                <div className="flex items-center justify-between mb-4">
                  <div className="uppercase text-xs tracking-[1.5px] text-[#c5a26f]">All Planets</div>
                  <div className="text-[10px] text-[#8a96b0]">Swiss Ephemeris • Moshier</div>
                </div>

                <div className="space-y-1">
                  {chart.planets.map((p: PlanetPosition) => {
                    const isH = highlightedPlanet === p.name
                    return (
                      <div
                        key={p.name}
                        onClick={() => setHighlightedPlanet(isH ? null : p.name)}
                        className={`flex items-center gap-3 text-sm py-1.5 px-3 rounded-lg transition-all cursor-pointer ${isH ? 'bg-[#1f2a45] ring-1 ring-[#c5a26f]/40' : 'hover:bg-[#121a2e]'}`}
                      >
                        <span className="w-6 text-[#c5a26f] text-lg tabular-nums">{PLANET_GLYPHS[p.name as keyof typeof PLANET_GLYPHS] || '●'}</span>
                        <span className="font-medium w-20 text-[#f0e6d2]">{p.name}</span>
                        <span className="font-semibold text-[#f0e6d2] flex-1">{p.sign}</span>
                        <span className="font-mono text-[#8a96b0] tabular-nums w-16 text-right">{p.formatted}</span>
                        {p.isRetrograde && <span className="text-amber-400 text-[10px] font-bold tracking-wider">℞</span>}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-[#2a3855] text-[11px] text-[#8a96b0]">
                  {birthData.unknownTime 
                    ? "Time unknown → houses and Ascendant not calculated." 
                    : "Whole Sign houses. Ascendant marks the start of the 1st house."}
                </div>
              </div>

              {/* The Sky Right Now — personal transits */}
              <div className="lg:col-span-7 card p-7">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="uppercase text-xs tracking-[1.5px] text-[#c5a26f]">The Sky Right Now</div>
                    <div className="text-xs text-[#8a96b0]">What the planets are doing today and how they touch you</div>
                  </div>
                  {skyLoading && <Loader2 className="w-4 h-4 animate-spin text-[#c5a26f]" />}
                </div>

                {personalContacts.length > 0 ? (
                  <div className="space-y-3">
                    {personalContacts.map((contact, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm border-l-2 border-[#c5a26f] pl-4 py-1">
                        <div className="font-medium text-[#f0e6d2] min-w-[110px]">
                          {contact.transiting.name} in {contact.transiting.sign}
                        </div>
                        <div className="flex-1 text-[#c8d1e0]">
                          <span className="text-[#c5a26f] font-semibold">{aspectSymbol(contact.aspect.aspect)}</span>{' '}
                          your natal <span className="font-medium">{contact.natal.name}</span> in {contact.natal.sign}
                          <span className="text-[#8a96b0] text-xs ml-2">({contact.aspect.orb}° orb)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : currentSky ? (
                  <div className="text-sm text-[#8a96b0]">
                    No major personal aspects within 8° right now. The sky is relatively quiet in relation to your chart.
                  </div>
                ) : (
                  <div className="text-sm text-[#8a96b0]">
                    Calculating current transits…
                  </div>
                )}

                <div className="mt-6 text-[11px] text-[#8a96b0] border-t border-[#2a3855] pt-4">
                  These are real-time positions. Tight orbs (under 3°) tend to be more noticeable in daily life.
                </div>
              </div>
            </div>

            {/* === Body & Sky — somatic layer (harvested from your earlier astro-body work) === */}
            {hasCalculated && bodyActivations.length > 0 && (
              <div className="mt-10 max-w-4xl mx-auto">
                <div className="mb-4 px-1">
                  <div className="uppercase tracking-[1.5px] text-xs text-[#c5a26f]">Body &amp; Sky</div>
                  <div className="text-sm text-[#8a96b0] mt-1">
                    Traditional correspondences between planets, signs, and regions of the body.
                    Not medical — just an invitation to notice.
                  </div>
                </div>

                <div className="card p-6">
                  {/* Visual body map */}
                  <div className="mb-5">
                    <BodyMap
                      activations={bodyActivations}
                      selectedRegion={selectedBodyRegion}
                      onRegionClick={(region) => {
                        setSelectedBodyRegion(selectedBodyRegion === region ? null : region)
                      }}
                    />
                  </div>

                  {/* Detailed activations list */}
                  <div className="grid gap-3">
                    {bodyActivations
                      .filter(act => !selectedBodyRegion || act.region === selectedBodyRegion)
                      .map((act, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-[#c5a26f]/40 pl-4 py-1 cursor-pointer"
                          onClick={() => setSelectedBodyRegion(act.region)}
                        >
                          <div className="font-medium text-[#f0e6d2] flex items-center gap-2">
                            {act.region}
                            <span className="text-[10px] font-normal px-1.5 py-px rounded bg-[#c5a26f]/10 text-[#c5a26f]">
                              {act.intensity}
                            </span>
                          </div>
                          <div className="text-xs text-[#8a96b0] mt-0.5 leading-snug">
                            {act.sources.join(' • ')}
                          </div>
                          <div className="text-[11px] text-[#c8d1e0] mt-1.5">
                            {act.intensity === 'strong' && 'Currently quite active in traditional symbolism.'}
                            {act.intensity === 'noticeable' && 'Receiving some emphasis right now or natally.'}
                            {act.intensity === 'gentle' && 'Part of your natural signature or lightly touched at the moment.'}
                          </div>
                        </div>
                      ))}
                  </div>

                  {selectedBodyRegion && (
                    <button
                      onClick={() => setSelectedBodyRegion(null)}
                      className="mt-4 text-xs text-[#c5a26f] hover:underline"
                    >
                      Show all regions
                    </button>
                  )}

                  <div className="mt-6 pt-4 border-t border-[#2a3855] text-[11px] text-[#8a96b0]">
                    These associations come from traditional medical astrology (Paracelsus, Culpeper and others).
                    Many people find it interesting to track whether they notice anything in these areas during strong transits.
                  </div>
                </div>
              </div>
            )}

            {/* === Reflect — guided prompts + journaling (one of the original priorities) === */}
            {hasCalculated && reflectionPrompts.length > 0 && (
              <div className="mt-10 max-w-4xl mx-auto">
                <div className="mb-4 px-1">
                  <div className="uppercase tracking-[1.5px] text-xs text-[#c5a26f]">Reflect</div>
                  <div className="text-sm text-[#8a96b0] mt-1">
                    A few gentle questions to sit with. No right answers. Take what lands.
                  </div>
                </div>

                <div className="card p-6 space-y-8">
                  {reflectionPrompts.map((prompt, idx) => {
                    const key = `prompt-${prompt.id}`
                    const value = reflections[key] || ''
                    return (
                      <div key={idx}>
                        <div className="text-[#f0e6d2] leading-snug">{prompt.text}</div>
                        {prompt.hint && (
                          <div className="text-xs text-[#8a96b0] mt-1 italic">{prompt.hint}</div>
                        )}
                        <textarea
                          value={value}
                          onChange={(e) => updateReflection(key, e.target.value)}
                          placeholder="Write as much or as little as you like…"
                          className="input mt-3 w-full min-h-[90px] resize-y text-sm"
                        />
                      </div>
                    )
                  })}

                  {/* Free journal space */}
                  <div className="pt-4 border-t border-[#2a3855]">
                    <div className="text-[#f0e6d2] mb-2">What else are you noticing lately?</div>
                    <textarea
                      value={reflections['free'] || ''}
                      onChange={(e) => updateReflection('free', e.target.value)}
                      placeholder="Anything else on your mind…"
                      className="input w-full min-h-[110px] resize-y text-sm"
                    />
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-center text-[#8a96b0]">
                  Notes are saved privately in this browser.
                </div>
              </div>
            )}

            <div className="text-center mt-10 text-xs text-[#8a96b0]">
              Everything you see here is calculated locally in your browser using Swiss Ephemeris. Your data never leaves this page.
            </div>
          </div>
        )}

        {/* Learn Modal */}
        <Learn isOpen={showLearn} onClose={() => setShowLearn(false)} />

        {/* Saved Charts Panel */}
        {showSavedPanel && (
          <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowSavedPanel(false)}
            />
            {/* Panel */}
            <div className="relative ml-auto w-full max-w-md bg-[#0a0f1c] border-l border-[#2a3855] h-full overflow-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-xl tracking-tight text-[#f0e6d2]">Saved Charts</div>
                <button onClick={() => setShowSavedPanel(false)} className="text-[#8a96b0] hover:text-[#c8d1e0]">Close</button>
              </div>

              {savedCharts.length === 0 ? (
                <div className="text-[#8a96b0] text-sm">
                  No saved charts yet. Calculate a chart and use the “Save” button to keep it for later.
                </div>
              ) : (
                <div className="space-y-3">
                  {savedCharts.map(chart => (
                    <div key={chart.id} className="card p-4 flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <div className="font-medium text-[#f0e6d2] truncate">{chart.name}</div>
                        <div className="text-xs text-[#8a96b0] mt-0.5">
                          {chart.birthData.date} {chart.birthData.unknownTime ? '(time unknown)' : `• ${chart.birthData.time}`}
                        </div>
                        <div className="text-[10px] text-[#8a96b0] mt-1">
                          Saved {new Date(chart.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-sm shrink-0">
                        <button
                          onClick={() => handleLoadSaved(chart)}
                          className="text-[#c5a26f] hover:underline"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteSaved(chart.id)}
                          className="text-red-400/70 hover:text-red-400 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 text-[11px] text-[#8a96b0]">
                Charts are saved privately in this browser only.
              </div>
            </div>
          </div>
        )}

        {/* Loading state while Swiss WASM initializes + calculates */}
        {isCalculating && (
          <div className="flex justify-center items-center py-16">
            <div className="flex items-center gap-3 text-[#c5a26f]">
              <Loader2 className="w-5 h-5 animate-spin" />
              Calculating your chart with Swiss Ephemeris…
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#2a3855] py-8 text-center text-xs text-[#8a96b0]">
        Built with care. All calculations happen in your browser using Swiss Ephemeris (Moshier mode by default).
      </footer>
    </div>
  )
}

export default App
