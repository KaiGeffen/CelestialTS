import Card from '../card'
import { Quality } from '../effects'
import { Keywords } from '../keyword'

class Seen extends Card {
  onUpkeep(player: number, game: any, index: number): boolean {
    game.vision[player ^ 1] += 4
    return true
  }
}
const seen = new Seen({
  name: 'Seen',
  id: 1001,
  cost: 2,
  points: 0,
  text: 'Fleeting. At the start of each round, if this is in your hand, give your opponent Sight 4.',
  qualities: [Quality.FLEETING],
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
  text: 'Fleeting. Draw a card.',
  keywords: [{ name: Keywords.fleeting, x: 0, y: 102 }],
})

const child = new Card({
  name: 'Child',
  qualities: [Quality.FLEETING],
  id: 1003,
  text: 'Fleeting.',
  keywords: [{ name: Keywords.fleeting, x: 0, y: 130 }],
})

class Predator extends Card {
  play(player: number, game: any, index: number, bonus: number): void {
    // NOTE This name must match the name of the card that creates it
    bonus += game.pile[player ^ 1].reduce(
      (acc: number, card: Card) => acc + (card.name === 'Prey' ? 2 : 0),
      0,
    )
    super.play(player, game, index, bonus)
  }
}
const predator = new Predator({
  name: 'Predator',
  cost: 1,
  qualities: [Quality.FLEETING],
  id: 1004,
  keywords: [{ name: Keywords.fleeting, x: 0, y: 61 }],
})

export { seen, ashes, child, predator }
