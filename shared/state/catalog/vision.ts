import Card from '../card'
import { SightCard } from '../card'
import { seen, predator } from './tokens'
import { Status, Quality } from '../effects'
import { Keywords } from '../keyword'
import GameModel from '../gameModel'

class Dawn extends SightCard {
  onMorning(player: number, game: GameModel, index: number): boolean {
    game.vision[player] += 1
    return true
  }
}
const dawn = new Dawn(4, {
  name: 'Dawn',
  id: 50,
  text: 'When played, gain Sight 4.\nMorning: gain Sight 1.',
  keywords: [
    { name: Keywords.sight, x: 0, y: 74, value: 4 },
    { name: Keywords.morning, x: -22, y: 104 },
    { name: Keywords.sight, x: 0, y: 130, value: 1 },
  ],
})

class ClearView extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)
    game.create(player ^ 1, seen)
  }
}
const clearView = new ClearView({
  name: 'Clear View',
  id: 27,
  cost: 1,
  text: "Create a Seen in your opponent's hand.",
  references: [{ card: seen, x: 5, y: 112 }],
})

class Awakening extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    this.addStatus(1, game, player, Status.AWAKENED)
    super.play(player, game, index, bonus)
  }
}
const awakening = new Awakening({
  name: 'Awakening',
  id: 39,
  cost: 3,
  points: 3,
  // TODO Keyword for sight
  text: 'Retain your Sight at the end of this round.',
})

class Enlightenment extends Card {
  getCost(player: number, game: GameModel): number {
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
  id: 45,
  cost: 7,
  points: 7,
  text: "Costs 0 if you can see at least 3 of your opponent's cards in the story.",
})

class Prey extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)
    game.create(player ^ 1, predator)
  }
}
const prey = new Prey({
  name: 'Prey',
  id: 26,
  cost: 1,
  points: 2,
  text: "Create a Predator in your opponent's hand.",
  references: [{ card: predator, x: 6, y: 113 }],
})

class Conquer extends Card {
  getCost(player: number, game: GameModel): number {
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
  id: 67,
  cost: 5,
  points: 3,
  text: 'Costs 1 less for each card you can see in the story.',
})

export { dawn, clearView, awakening, enlightenment, prey, conquer }
