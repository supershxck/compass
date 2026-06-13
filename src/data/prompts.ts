/**
 * Compass — Guided reflection prompts for beginners
 *
 * These are hand-curated, warm, and practical.
 * The goal is gentle self-inquiry, not "fixing" or performance.
 */

import type { PlanetPosition } from '../lib/ephemeris'

type Prompt = {
  id: string
  text: string
  hint?: string
}

export function generateReflectionPrompts(
  natalPlanets: PlanetPosition[],
  personalContacts: Array<any>
): Prompt[] {
  const prompts: Prompt[] = []

  const sun = natalPlanets.find(p => p.name === 'Sun')
  const moon = natalPlanets.find(p => p.name === 'Moon')

  // Sun prompt
  if (sun) {
    prompts.push({
      id: 'sun',
      text: `Your Sun is in ${sun.sign}. In what small, ordinary ways did you feel most "like yourself" this week?`,
      hint: 'No big revelations needed — just moments of natural aliveness.'
    })
  }

  // Moon prompt
  if (moon) {
    prompts.push({
      id: 'moon',
      text: `Your Moon is in ${moon.sign}. What did your body or emotions actually need this week, even if you didn't give it to yourself?`,
      hint: 'Try to stay with the felt need rather than the story about it.'
    })
  }

  // Current transit prompt (if there's a strong one)
  if (personalContacts.length > 0) {
    const contact = personalContacts[0]
    prompts.push({
      id: 'transit',
      text: `Right now, ${contact.transiting.name} is ${contact.aspect.aspect} your natal ${contact.natal.name}. What tension or invitation have you noticed in that part of your life lately?`,
      hint: 'It doesn’t have to be dramatic. Even subtle shifts count.'
    })
  }

  // Body / somatic prompt (always useful)
  prompts.push({
    id: 'body',
    text: `Looking at the Body & Sky section, which area feels most "talkative" to you right now? What might it be trying to tell you (even if it sounds silly)?`,
    hint: 'Your body is allowed to have a voice in this conversation.'
  })

  // Gentle integration / future prompt
  prompts.push({
    id: 'integration',
    text: `If one thing from your chart or the current sky felt like a quiet invitation, what is the tiniest way you could honor it this week?`,
    hint: 'Tiny is better than ambitious. 2 minutes of something is enough.'
  })

  return prompts.slice(0, 5)
}
