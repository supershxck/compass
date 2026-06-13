import React from 'react'
import type { NatalChart, PlanetPosition } from '../lib/ephemeris'
import { SIGNS, SIGN_GLYPHS, PLANET_GLYPHS, SIGN_ELEMENTS } from '../lib/constants'

interface ChartWheelProps {
  chart: NatalChart
  size?: number
  onPlanetClick?: (planet: PlanetPosition) => void
  highlightedPlanet?: string | null
  showHouses?: boolean
  // Optional: current transiting planets to overlay (powerful for beginners)
  currentSky?: PlanetPosition[]
  onTransitClick?: (planet: PlanetPosition) => void
}

const ELEMENT_COLORS: Record<'fire' | 'earth' | 'air' | 'water', string> = {
  fire: '#e07a5f',
  earth: '#81b29a',
  air: '#a8b5d6',
  water: '#6b9ac4',
}

const SOFT_ELEMENT: Record<'fire' | 'earth' | 'air' | 'water', string> = {
  fire: 'rgba(224, 122, 95, 0.12)',
  earth: 'rgba(129, 178, 154, 0.12)',
  air: 'rgba(168, 181, 214, 0.12)',
  water: 'rgba(107, 154, 196, 0.12)',
}

export const ChartWheel: React.FC<ChartWheelProps> = ({
  chart,
  size = 420,
  onPlanetClick,
  highlightedPlanet,
  showHouses = true,
  currentSky,
  onTransitClick,
}) => {
  const cx = size / 2
  const cy = size / 2
  const rOuter = size * 0.46
  const rInner = size * 0.34
  const rPlanet = size * 0.40
  const rSignLabel = size * 0.395

  const toXY = (lonDeg: number, r: number) => {
    const a = ((lonDeg - 90) * Math.PI) / 180
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const
  }

  const hasHouses = chart.houses.cusps.length === 12

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="wheel select-none"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Background circle */}
      <circle
        cx={cx}
        cy={cy}
        r={rOuter + 8}
        fill="var(--bg-elev)"
        stroke="var(--border)"
        strokeWidth={1}
      />

      {/* Sign wedges with soft element colors */}
      {SIGNS.map((sign, i) => {
        const start = i * 30
        const end = start + 30
        const element = SIGN_ELEMENTS[sign]
        const color = SOFT_ELEMENT[element]

        // Create pie slice path
        const [x1, y1] = toXY(start, rInner)
        const [x2, y2] = toXY(end, rInner)
        const [ox1, oy1] = toXY(start, rOuter)
        const [ox2, oy2] = toXY(end, rOuter)

        const largeArc = 0

        const path = `
          M ${cx} ${cy}
          L ${x1} ${y1}
          A ${rInner} ${rInner} 0 ${largeArc} 1 ${x2} ${y2}
          L ${ox2} ${oy2}
          A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${ox1} ${oy1}
          Z
        `

        return (
          <g key={sign}>
            <path d={path.trim()} fill={color} stroke="var(--border)" strokeWidth={0.5} />
          </g>
        )
      })}

      {/* Sign boundary lines */}
      {Array.from({ length: 12 }).map((_, i) => {
        const [ix, iy] = toXY(i * 30, rInner)
        const [ox, oy] = toXY(i * 30, rOuter)
        return (
          <line
            key={i}
            x1={ix}
            y1={iy}
            x2={ox}
            y2={oy}
            stroke="var(--border)"
            strokeWidth={1}
            opacity={0.6}
          />
        )
      })}

      {/* Sign glyphs */}
      {SIGNS.map((sign, i) => {
        const [x, y] = toXY(i * 30 + 15, rSignLabel)
        return (
          <text
            key={sign}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text)"
            fontSize={13}
            fontWeight={500}
            opacity={0.85}
          >
            {SIGN_GLYPHS[sign]}
          </text>
        )
      })}

      {/* House cusps (light) */}
      {showHouses && hasHouses && chart.houses.cusps.map((cusp, i) => {
        const [ix, iy] = toXY(cusp, rInner - 4)
        const [ox, oy] = toXY(cusp, rOuter + 4)
        return (
          <line
            key={`house-${i}`}
            x1={ix}
            y1={iy}
            x2={ox}
            y2={oy}
            stroke="var(--accent)"
            strokeWidth={0.75}
            opacity={0.25}
          />
        )
      })}

      {/* Ascendant marker (strong) */}
      {hasHouses && (
        <g>
          <line
            x1={toXY(chart.houses.ascendant, rInner - 12)[0]}
            y1={toXY(chart.houses.ascendant, rInner - 12)[1]}
            x2={toXY(chart.houses.ascendant, rOuter + 18)[0]}
            y2={toXY(chart.houses.ascendant, rOuter + 18)[1]}
            stroke="var(--accent-warm)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <text
            x={toXY(chart.houses.ascendant, rOuter + 28)[0]}
            y={toXY(chart.houses.ascendant, rOuter + 28)[1]}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--accent-warm)"
            fontSize={10}
            fontWeight={600}
            letterSpacing="0.5px"
          >
            ASC
          </text>
        </g>
      )}

      {/* Natal Planets */}
      {chart.planets.map((p) => {
        const [x, y] = toXY(p.longitude, rPlanet)
        const isHighlighted = highlightedPlanet === p.name
        const element = SIGN_ELEMENTS[p.sign]
        const planetColor = ELEMENT_COLORS[element]

        return (
          <g
            key={p.name}
            onClick={() => onPlanetClick?.(p)}
            style={{ cursor: onPlanetClick ? 'pointer' : 'default' }}
            className="transition-all duration-150"
          >
            {/* Glow when highlighted */}
            {isHighlighted && (
              <circle
                cx={x}
                cy={y}
                r={11}
                fill="none"
                stroke={planetColor}
                strokeWidth={3}
                opacity={0.25}
              />
            )}

            {/* Planet dot */}
            <circle
              cx={x}
              cy={y}
              r={isHighlighted ? 5.5 : 4.5}
              fill={planetColor}
              stroke="var(--bg)"
              strokeWidth={1.5}
              opacity={p.isRetrograde ? 0.7 : 1}
            />

            {/* Proper planet glyph */}
            <text
              x={x}
              y={y - 14}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isHighlighted ? 'var(--text-strong)' : 'var(--text)'}
              fontSize={isHighlighted ? 13 : 11}
              fontWeight={isHighlighted ? 600 : 500}
              style={{ pointerEvents: 'none' }}
            >
              {PLANET_GLYPHS[p.name]}
            </text>

            {/* Tiny label when highlighted */}
            {isHighlighted && (
              <text
                x={x}
                y={y + 17}
                textAnchor="middle"
                fill="var(--accent)"
                fontSize={9}
                fontWeight={500}
              >
                {p.name}
              </text>
            )}
          </g>
        )
      })}

      {/* Current Transiting Planets (overlay ring) — very powerful for beginners */}
      {currentSky && currentSky.length > 0 && (
        <>
          {/* Subtle outer ring to indicate "now" layer */}
          <circle
            cx={cx}
            cy={cy}
            r={rOuter + 22}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={0.5}
            strokeDasharray="2 3"
            opacity={0.35}
          />

          {currentSky.map((p) => {
            const [x, y] = toXY(p.longitude, rOuter + 22)
            const isNatalHighlighted = highlightedPlanet === p.name
            const element = SIGN_ELEMENTS[p.sign]
            const tColor = ELEMENT_COLORS[element]

            return (
              <g
                key={`transit-${p.name}`}
                onClick={() => onTransitClick?.(p)}
                style={{ cursor: onTransitClick ? 'pointer' : 'default' }}
                opacity={0.75}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isNatalHighlighted ? 4 : 3}
                  fill={tColor}
                  stroke="var(--bg)"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={y - 9}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text-dim)"
                  fontSize={9}
                  fontWeight={500}
                  style={{ pointerEvents: 'none' }}
                >
                  {PLANET_GLYPHS[p.name]}
                </text>
              </g>
            )
          })}
        </>
      )}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill="var(--accent)" />
    </svg>
  )
}
