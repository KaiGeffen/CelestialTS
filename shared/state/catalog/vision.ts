import Card from '../card'
import { SightCard } from '../card'
import { seen, predator } from './tokens'
import { Status, Quality } from '../effects'
import { Keywords } from '../keyword'

class Dawn extends SightCard {
  morning(player: number, game: any, index: number): boolean {
    game.vision[player] += 1
    return true
  }
}
const dawn = new Dawn(4, {
  name: 'Dawn',
  cost: 0,
  points: 0,
  id: 50,
  text: 'When played, gain Sight 4.\nMorning: gain Sight 1.',
  keywords: [
    { name: Keywords.sight, x: 0, y: 74, value: 4 },
    { name: Keywords.morning, x: -22, y: 104 },
    { name: Keywords.sight, x: 0, y: 130, value: 1 },
  ],
})

class ClearView extends Card {
  play(player: number, game: any, index: number, bonus: any): void {
    super.play(player, game, index, bonus)
    this.create(seen, game, player ^ 1)
  }
}
const clearView = new ClearView({
  name: 'Clear View',
  cost: 1,
  points: 0,
  id: 27,
  text: "Create a Seen in your opponent's hand.",
  references: [{ card: seen, x: 5, y: 112 }],
})

class Awakening extends Card {
  play(player: number, game: any, index: number, bonus: any): void {
    this.addStatus(1, game, player, Status.AWAKENED)
    super.play(player, game, index, bonus)
  }
}
const awakening = new Awakening({
  name: 'Awakening',
  cost: 3,
  points: 3,
  id: 39,
  // TODO Keyword for sight
  text: 'Retain your Sight at the end of this round.',
})

class Enlightenment extends Card {
  getCost(player: number, game: any): number {
    let numSeenCards = 0
    for (let i = 0; i < game.story.acts.length; i++) {
      const act = game.story.acts[i]
      if (act.owner === (player ^ 1)) {
        if (
          i + 1 <= game.vision[player] ||
          act.card.qualities.includes(Quality.VISIBLE)
        ) {
          numSeenCards += 1
        }
      }
    }
    return numSeenCards >= 3 ? 0 : this.cost
  }
}
const enlightenment = new Enlightenment({
  name: 'Enlightenment',
  cost: 7,
  points: 7,
  id: 45,
  text: "Costs 0 if you can see at least 3 of your opponent's cards in the story.",
})

class Prey extends Card {
  play(player: number, game: any, index: number, bonus: any): void {
    super.play(player, game, index, bonus)
    this.create(predator, game, player ^ 1)
  }
}
const prey = new Prey({
  name: 'Prey',
  cost: 1,
  points: 2,
  id: 26,
  text: "Create a Predator in your opponent's hand.",
  references: [{ card: predator, x: 6, y: 113 }],
})

class Conquer extends Card {
  getCost(player: number, game: any): number {
    let numSeenCards = 0
    for (let i = 0; i < game.story.acts.length; i++) {
      const act = game.story.acts[i]
      if (act.owner === player) {
        numSeenCards += 1
      } else {
        if (
          i + 1 <= game.vision[player] ||
          act.card.qualities.includes(Quality.VISIBLE)
        ) {
          numSeenCards += 1
        }
      }
    }
    return Math.max(0, this.cost - numSeenCards)
  }
}
const conquer = new Conquer({
  name: 'Conquer',
  cost: 5,
  points: 3,
  id: 67,
  text: 'Costs 1 less for each card you can see in the story.',
})

export { dawn, clearView, awakening, enlightenment, prey, conquer }
