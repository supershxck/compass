import React, { useState } from 'react'
import { X } from 'lucide-react'

interface LearnProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Calm, beginner-friendly reference section.
 * Content adapted from earlier educational work (planets, signs, houses, aspects).
 * Tone: warm, clear, non-overwhelming.
 */
export const Learn: React.FC<LearnProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'planets' | 'signs' | 'houses' | 'aspects'>('planets')

  if (!isOpen) return null

  const tabs = [
    { id: 'planets' as const, label: 'Planets' },
    { id: 'signs' as const, label: 'Signs' },
    { id: 'houses' as const, label: 'Houses' },
    { id: 'aspects' as const, label: 'Aspects' },
  ]

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-[#0a0f1c] border border-[#2a3855] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a3855] px-6 py-4">
          <div>
            <div className="text-xl tracking-tight text-[#f0e6d2]">Learn</div>
            <div className="text-sm text-[#8a96b0]">A gentle introduction to the language of the sky</div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#8a96b0] hover:text-[#c8d1e0] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a3855] px-6 pt-2 bg-[#121a2e]/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-[#c5a26f] text-[#f0e6d2]' 
                  : 'border-transparent text-[#8a96b0] hover:text-[#c8d1e0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto flex-1 prose prose-invert max-w-none text-[#c8d1e0]">
          {activeTab === 'planets' && <PlanetsSection />}
          {activeTab === 'signs' && <SignsSection />}
          {activeTab === 'houses' && <HousesSection />}
          {activeTab === 'aspects' && <AspectsSection />}
        </div>

        <div className="border-t border-[#2a3855] px-6 py-3 text-xs text-[#8a96b0] bg-[#121a2e]/30">
          These descriptions are starting points. The real meaning always comes from how a symbol shows up in a real life.
        </div>
      </div>
    </div>
  )
}

function PlanetsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[#f0e6d2] text-lg mb-2">The Planets</h3>
        <p className="text-[#c8d1e0]">
          In astrology, “planets” include the Sun and Moon. They represent different psychological functions or energies that are active in everyone.
        </p>
      </div>

      <div className="grid gap-4">
        <PlanetCard name="Sun" glyph="☉" description="Core identity, vitality, and sense of self. Where you naturally shine." />
        <PlanetCard name="Moon" glyph="☽" description="Emotional needs, instincts, and inner life. What makes you feel safe and nurtured." />
        <PlanetCard name="Mercury" glyph="☿" description="Thinking, communication, and how you process information." />
        <PlanetCard name="Venus" glyph="♀" description="What you value, how you love, and what brings you pleasure." />
        <PlanetCard name="Mars" glyph="♂" description="Drive, courage, anger, and how you go after what you want." />
        <PlanetCard name="Jupiter" glyph="♃" description="Growth, meaning, faith, and where life tends to expand." />
        <PlanetCard name="Saturn" glyph="♄" description="Structure, limits, responsibility, and long-term mastery." />
      </div>

      <p className="text-sm text-[#8a96b0] pt-2">
        The outer planets (Uranus, Neptune, Pluto) move slowly and describe generational themes as well as deep personal transformation when they touch your chart.
      </p>
    </div>
  )
}

function SignsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[#f0e6d2] text-lg mb-2">The Twelve Signs</h3>
        <p>
          The signs describe *how* planetary energy expresses itself. Each sign has an element (Fire, Earth, Air, Water) and a mode (Cardinal, Fixed, Mutable).
        </p>
      </div>

      <div>
        <h4 className="font-medium text-[#c5a26f] mb-2">Elements</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><strong className="text-[#e07a5f]">Fire</strong> — initiative, spirit, inspiration (Aries, Leo, Sagittarius)</div>
          <div><strong className="text-[#81b29a]">Earth</strong> — form, practicality, the body (Taurus, Virgo, Capricorn)</div>
          <div><strong className="text-[#a8b5d6]">Air</strong> — mind, connection, ideas (Gemini, Libra, Aquarius)</div>
          <div><strong className="text-[#6b9ac4]">Water</strong> — feeling, depth, the unseen (Cancer, Scorpio, Pisces)</div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-[#c5a26f] mb-2">Modes</h4>
        <ul className="text-sm space-y-1 text-[#c8d1e0]">
          <li><strong>Cardinal</strong> — starting energy, initiative (Aries, Cancer, Libra, Capricorn)</li>
          <li><strong>Fixed</strong> — stabilizing energy, persistence (Taurus, Leo, Scorpio, Aquarius)</li>
          <li><strong>Mutable</strong> — adapting energy, flexibility (Gemini, Virgo, Sagittarius, Pisces)</li>
        </ul>
      </div>
    </div>
  )
}

function HousesSection() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[#f0e6d2] text-lg mb-2">The Houses</h3>
        <p>
          Houses show *where* planetary energy plays out in your life. They are areas of experience rather than personality traits.
        </p>
      </div>

      <div className="text-sm space-y-3">
        <p><strong className="text-[#c5a26f]">Angular houses</strong> (1, 4, 7, 10) are especially powerful. They relate to major life axes: self, home, relationships, and vocation.</p>
        
        <div className="pl-3 border-l border-[#2a3855] space-y-2 text-[#c8d1e0]">
          <div><strong>1st house</strong> — How you meet the world, your natural style of being.</div>
          <div><strong>4th house</strong> — Roots, home, family, emotional foundation.</div>
          <div><strong>7th house</strong> — One-to-one relationships, partnership, the “other”.</div>
          <div><strong>10th house</strong> — Public life, reputation, contribution, direction.</div>
        </div>
      </div>

      <p className="text-sm text-[#8a96b0]">
        In Compass we default to Whole Sign houses because they are the clearest for beginners. Other systems (Placidus, etc.) divide the sky differently.
      </p>
    </div>
  )
}

function AspectsSection() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[#f0e6d2] text-lg mb-2">Aspects</h3>
        <p>
          Aspects describe how planets “talk” to each other. They are the angles between planets in the chart.
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <div><strong className="text-[#c5a26f]">Conjunction (0°)</strong> — Planets fused together. Blended, intense, new beginnings.</div>
        <div><strong className="text-[#c5a26f]">Sextile (60°)</strong> — Easy cooperation and opportunity.</div>
        <div><strong className="text-[#c5a26f]">Square (90°)</strong> — Friction and dynamic tension. Often the most growth-oriented.</div>
        <div><strong className="text-[#c5a26f]">Trine (120°)</strong> — Natural flow and support. Can sometimes be too easy.</div>
        <div><strong className="text-[#c5a26f]">Opposition (180°)</strong> — Polarity and awareness. “Me vs. other” or internal tension seeking balance.</div>
      </div>

      <p className="text-sm text-[#8a96b0]">
        In Compass we highlight aspects between your natal chart and the current sky. These are often the most noticeable in daily life.
      </p>
    </div>
  )
}

function PlanetCard({ name, glyph, description }: { name: string; glyph: string; description: string }) {
  return (
    <div className="flex gap-4 border border-[#2a3855] rounded-xl p-4 bg-[#121a2e]/50">
      <div className="text-2xl text-[#c5a26f] w-8 shrink-0">{glyph}</div>
      <div>
        <div className="font-medium text-[#f0e6d2]">{name}</div>
        <div className="text-sm text-[#c8d1e0]">{description}</div>
      </div>
    </div>
  )
}
