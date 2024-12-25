import Card from '../card'
import { Quality } from '../effects'
import GameModel from '../gameModel'
import { Keywords } from '../keyword'

class Seen extends Card {
  onUpkeepInHand(player: number, game: any, index: number): boolean {
    game.vision[player ^ 1] += 4
    return true
  }
}
const seen = new Seen({
  name: 'Seen',
  id: 1001,
  cost: 2,
  qualities: [Quality.FLEETING],
  text: 'Fleeting. At the start of each round, if this is in your hand, give your opponent Sight 4.',
  keywords: [
    { name: Keywords.fleeting, x: 0, y: 61 },
    { name: Keywords.sight, x: 420, y: 69, value: 4 },
  ],
})

class Ashes extends Card {
  play(player: number, game: GameModel, index: number, bonus: number): void {
    super.play(player, game, index, bonus)
    game.draw(player, 1)
  }
}
const ashes = new Ashes({
  name: 'Ashes',
  id: 1002,
  cost: 1,
  qualities: [Quality.FLEETING],
  text: 'Fleeting. Draw a card.',
  keywords: [{ name: Keywords.fleeting, x: 0, y: 102 }],
})

const child = new Card({
  name: 'Child',
  id: 1003,
  qualities: [Quality.FLEETING],
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
  id: 1004,
  cost: 1,
  qualities: [Quality.FLEETING],
  text: "Fleeting. Worth +2 points for each Prey in your opponent's discard pile.",
  keywords: [{ name: Keywords.fleeting, x: 0, y: 61 }],
})

export { seen, ashes, child, predator }
