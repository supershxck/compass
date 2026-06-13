import React from 'react'
import type { BodyActivation } from '../data/somatic'

interface BodyMapProps {
  activations: BodyActivation[]
  onRegionClick?: (region: string) => void
  selectedRegion?: string | null
}

/**
 * Simple, elegant visual body map for beginners.
 * Regions light up based on the computed activations.
 * Not anatomical — symbolic and gentle.
 */
export const BodyMap: React.FC<BodyMapProps> = ({
  activations,
  onRegionClick,
  selectedRegion,
}) => {
  // Map our region names to visual zones
  const regionIntensity = new Map<string, BodyActivation['intensity']>()
  activations.forEach(a => {
    regionIntensity.set(a.region, a.intensity)
  })

  const getIntensityClass = (region: string) => {
    const intensity = regionIntensity.get(region)
    if (!intensity) return 'bg-[#1a253f] border-[#2a3855] text-[#8a96b0]'

    if (intensity === 'strong') {
      return 'bg-[#c5a26f]/20 border-[#c5a26f] text-[#f0e6d2] ring-1 ring-[#c5a26f]/40'
    }
    if (intensity === 'noticeable') {
      return 'bg-[#9a8cd4]/15 border-[#9a8cd4]/60 text-[#c8d1e0]'
    }
    return 'bg-[#81b29a]/15 border-[#81b29a]/50 text-[#c8d1e0]'
  }

  const regions = [
    { label: 'Head', key: 'Head' },
    { label: 'Face & Eyes', key: 'Face' },
    { label: 'Throat & Neck', key: 'Throat' },
    { label: 'Heart & Chest', key: 'Heart' },
    { label: 'Stomach & Digestion', key: 'Stomach' },
    { label: 'Arms & Hands', key: 'Arms' },
    { label: 'Lower Back & Hips', key: 'Hips' },
    { label: 'Legs, Knees & Feet', key: 'Knees' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {regions.map(r => {
        const isActive = regionIntensity.has(r.key) || regionIntensity.has(r.label)
        const cls = getIntensityClass(r.key) || getIntensityClass(r.label)
        const isSelected = selectedRegion === r.key || selectedRegion === r.label

        return (
          <button
            key={r.key}
            onClick={() => onRegionClick?.(isActive ? r.key : r.label)}
            className={`text-left rounded-xl border px-3 py-2 text-xs transition-all ${cls} ${isSelected ? 'ring-2 ring-offset-2 ring-offset-[#0a0f1c] ring-[#c5a26f]' : ''} ${isActive ? 'cursor-pointer hover:brightness-110' : 'opacity-60'}`}
          >
            <div className="font-medium">{r.label}</div>
            {isActive && (
              <div className="text-[10px] mt-0.5 opacity-80">
                {regionIntensity.get(r.key)?.toUpperCase() || regionIntensity.get(r.label)?.toUpperCase()}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
