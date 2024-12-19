import Card from '../../../shared/state/card'

export default class Story {
  acts: Act[]

  constructor() {
    this.acts = []
  }

  addAct(card: Card, owner: number, source: number = -1) {
    let act = new Act(card, owner, source)
    this.acts.push(act)
  }
}

class Act {
  card: Card
  owner: number
  source: number
  countered: boolean
  bonus: number

  constructor(card: Card, owner: number, source: number) {
    this.card = card
    this.owner = owner
    this.source = source

    this.countered = false
    this.bonus = 0
  }
}
