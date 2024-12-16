const Draw = 'draw'
const Discard = 'discard'
const TutorDeck = 'tutor_deck'
const TutorDiscard = 'tutor_discard'
const Create = 'create'
const Shuffle = 'shuffle'
const Mill = 'mill'
const Top = 'top'

interface AnimationParams {
  zone_from: string
  zone_to?: string
  card?: string
  index?: number
  index2?: number
}

export class Anim {
  zone_from: string
  zone_to?: string
  card?: string
  index?: number
  index2?: number

  constructor({ zone_from, zone_to, card, index, index2 }: AnimationParams) {
    this.zone_from = zone_from
    this.zone_to = zone_to
    this.card = card
    this.index = index
    this.index2 = index2
  }
}
