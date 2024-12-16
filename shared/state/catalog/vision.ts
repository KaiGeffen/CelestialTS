import { Card, SightCard } from '../card'
import { seen, predator } from './tokens'
import { Status, Quality } from '../effects'

class Dawn extends SightCard {
  morning(player: number, game: any, index: number): boolean {
    game.vision[player] += 1
    return true
  }
}
const dawn = new Dawn(4, { name: 'Dawn', cost: 0, points: 0, id: 50 })

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
})

class Prey extends Card {
  play(player: number, game: any, index: number, bonus: any): void {
    super.play(player, game, index, bonus)
    this.create(predator, game, player ^ 1)
  }
}
const prey = new Prey({ name: 'Prey', cost: 1, points: 2, id: 26 })

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
const conquer = new Conquer({ name: 'Conquer', cost: 5, points: 3, id: 67 })

export { dawn, clearView, awakening, enlightenment, prey, conquer }
