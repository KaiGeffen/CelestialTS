import { Card } from '../logic/Card'
import { Quality } from '../logic/Effects'

class Seen extends Card {
  onUpkeep(player: number, game: any, index: number): boolean {
    game.vision[player ^ 1] += 4
    return true
  }
}
const seen = new Seen({
  name: 'Seen',
  cost: 2,
  qualities: [Quality.FLEETING],
  id: 1001,
})

class Ashes extends Card {
  play(player: number, game: any, index: number, bonus: number): void {
    super.play(player, game, index, bonus)
    this.draw(1, game, player)
  }
}
const ashes = new Ashes({
  name: 'Ashes',
  cost: 1,
  qualities: [Quality.FLEETING],
  id: 1002,
})

const child = new Card({
  name: 'Child',
  qualities: [Quality.FLEETING],
  id: 1003,
})

class Predator extends Card {
  play(player: number, game: any, index: number, bonus: number): void {
    // NOTE This name must match the name of the card that creates it
    bonus += game.pile[player ^ 1].reduce(
      (acc: number, card: Card) => acc + (card.name === 'Prey' ? 2 : 0),
      0
    )
    super.play(player, game, index, bonus)
  }
}
const predator = new Predator({
  name: 'Predator',
  cost: 1,
  qualities: [Quality.FLEETING],
  id: 1004,
})

const tokens = [seen, ashes, child, predator]

export { tokens }
