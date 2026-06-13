/**
 * Compass — Curated beginner-friendly interpretations
 * Tone: warm, direct, balanced (gift + edge), never fluffy or salesy.
 * These are seeds. We will expand and refine heavily.
 */

import type { Sign } from '../lib/constants'

type BigThreeKey = 'sun' | 'moon' | 'rising'

export const BIG_THREE: Record<BigThreeKey, Partial<Record<Sign, string>>> = {
  sun: {
    Aries: "Your core vitality wants to initiate and lead. You tend to meet life head-on, with a direct, courageous style. The gift is clarity and momentum; the edge is learning to consider others' pace and needs.",
    Taurus: "You are built for steady, embodied presence. Pleasure, reliability, and the slow cultivation of value are central to your sense of self. The gift is patience and loyalty; the edge is rigidity when life asks you to move faster.",
    Gemini: "Your identity is expressed through curiosity, language, and movement. You need variety and mental stimulation to feel alive. The gift is adaptability and wit; the edge is scattered energy and difficulty committing to depth.",
    Cancer: "Your sense of self is deeply tied to belonging, memory, and emotional attunement. You are a natural protector and feeler. The gift is profound empathy and loyalty; the edge is defensiveness and difficulty separating your feelings from others'.",
    Leo: "You are here to be seen and to express from the heart. Creative self-expression and generosity of spirit are central. The gift is warmth, courage, and the ability to uplift others; the edge is needing constant validation or performing instead of simply being.",
    Virgo: "Your identity is refined through service, discernment, and the desire to be useful. You notice what others miss. The gift is precision, care, and quiet competence; the edge is self-criticism and difficulty feeling 'good enough' without constant improvement.",
    Libra: "You discover yourself through relationship and the art of balance. Harmony, fairness, and the perspective of the other are essential. The gift is diplomacy and the ability to create beauty in connection; the edge is losing yourself in the pursuit of being liked.",
    Scorpio: "Your core self is intense, private, and transformative. You are drawn to depth, truth, and what lies beneath the surface. The gift is profound resilience and x-ray perception; the edge is control, suspicion, and the fear of vulnerability.",
    Sagittarius: "You need freedom, meaning, and the open horizon. Your identity expands through exploration, philosophy, and the search for truth. The gift is optimism and the ability to inspire; the edge is restlessness and bluntness that can wound others.",
    Capricorn: "You are built for long-game mastery and responsibility. Structure, achievement, and contributing something lasting matter deeply. The gift is discipline and quiet authority; the edge is emotional guardedness and measuring your worth only by what you produce.",
    Aquarius: "Your sense of self is tied to being different, innovative, and in service to the collective. You see patterns others don't. The gift is originality and humanitarian vision; the edge is emotional detachment and the feeling of never quite belonging.",
    Pisces: "You are permeable, imaginative, and connected to the unseen. Compassion and the dissolution of boundaries are part of your nature. The gift is profound empathy and artistic/spiritual sensitivity; the edge is boundary loss and escapism when reality feels too sharp.",
  },

  moon: {
    Aries: "Your emotional needs are direct and immediate. You feel safest when you can act on your feelings. Anger is often a cover for hurt. You recover quickly but can burn hot in the moment.",
    Taurus: "You need consistency, beauty, and physical comfort to feel secure. Slow, sensual pleasures (food, touch, nature, music) are medicine. Change feels threatening even when it's good for you.",
    Gemini: "Your feelings move fast and need to be talked through. Boredom is a form of emotional distress. You can talk yourself into or out of almost any mood. Connection through ideas is as real as connection through touch.",
    Cancer: "You feel everything. Home, belonging, and emotional safety are non-negotiable. You have a long memory for both kindness and injury. Nurturing others is natural; receiving it can feel vulnerable.",
    Leo: "Your heart wants to be celebrated and to celebrate others. You feel most loved when your unique self is seen and appreciated. Rejection or feeling invisible can be devastating. Play and creative self-expression are emotional needs, not luxuries.",
    Virgo: "You feel safe when things are orderly and useful. Worry is your default emotional weather. You show love through acts of service and improvement. Self-compassion is often harder than compassion for others.",
    Libra: "You need harmony in your relationships to feel emotionally well. Conflict (even healthy) can feel like a threat to your security. You are skilled at seeing everyone's side — sometimes at the cost of knowing your own.",
    Scorpio: "Your emotional life is deep, private, and all-or-nothing. Betrayal cuts to the bone. You can hold space for the darkest feelings in yourself and others. Trust is earned slowly and lost quickly.",
    Sagittarius: "You need emotional freedom and the sense that tomorrow can be better. Confinement (physical or emotional) makes you panic. You can talk yourself out of feelings with philosophy. Adventure and meaning-making are how you heal.",
    Capricorn: "You learned early that feelings are something you manage, not something you are managed by. You respect competence and self-reliance in yourself and others. Tenderness can feel risky. You soften over time with people who prove trustworthy.",
    Aquarius: "Your feelings often feel slightly alien even to you. You intellectualize emotion and need space to process. You can be the calm one in a crisis and strangely detached in your own. Belonging to a tribe of fellow weirdos helps.",
    Pisces: "Your boundaries between self and other (and self and world) are thin. You absorb moods like a sponge. Art, music, dreams, and compassion are how you stay afloat. Escapism (in its many forms) is the shadow side of your sensitivity.",
  },

  rising: {
    // Rising sign interpretations are more about the style of meeting the world
    Aries: "You meet the world with directness and initiative. People often experience you as bold or impatient, even when you're being gentle. Life feels like something to engage with, not something that happens to you.",
    Taurus: "You move through life at a deliberate pace. People experience you as steady, sensual, and sometimes immovable. You create safety and beauty wherever you land.",
    Gemini: "You are curious about everything and everyone. People often experience you as quick, witty, and slightly restless. You collect information and connections the way others collect objects.",
    Cancer: "You enter spaces cautiously and read the emotional temperature immediately. People experience you as protective, moody, or nurturing depending on whether they feel like 'family' yet.",
    Leo: "You have a natural warmth and sense of occasion. People notice when you enter a room. You bring generosity and a desire for mutual recognition.",
    Virgo: "You meet the world by noticing what needs fixing or refining. People experience you as helpful, precise, and sometimes quietly critical. You serve through competence.",
    Libra: "You are exquisitely attuned to social balance and beauty. People often experience you as charming, fair, and sometimes indecisive because you can see every side.",
    Scorpio: "You reveal very little until trust is established. People often experience you as intense, private, or magnetic. You see what others prefer to keep hidden.",
    Sagittarius: "You bring a spirit of adventure and philosophical inquiry. People experience you as optimistic, blunt, and sometimes hard to pin down. You are here to expand the possible.",
    Capricorn: "You carry an air of responsibility and quiet authority. People often assume you are more serious or capable than you feel. You earn respect slowly and hold it carefully.",
    Aquarius: "You are slightly outside the normal flow. People experience you as original, detached, or ahead of your time. You are most yourself when you're slightly strange.",
    Pisces: "You have a porous, dreamy quality that others find either soothing or confusing. People project onto you easily. Your boundaries are an ongoing spiritual practice.",
  },
}

export function getBigThreeText(kind: BigThreeKey, sign: Sign): string {
  const entry = BIG_THREE[kind][sign]
  if (entry) return entry

  return "This placement carries a distinctive flavor that shapes how you move through the world. The more you learn the language of this sign, the more clearly you'll see its signature in your life."
}
