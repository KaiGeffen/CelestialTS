import Card from '../card'
import { Status, Quality } from '../effects'
import GameModel from '../gameModel'
import { Keywords } from '../keyword'

class Mercy extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)

    for (let i = 0; i < 2; i++) {
      game.draw(i, 1)
    }
  }
}
const mercy = new Mercy({
  name: 'Mercy',
  id: 12,
  cost: 3,
  points: 3,
  text: 'Each player draws a card.',
})

class Excess extends Card {
  getCost(player: number, game: GameModel) {
    let amt = 0

    if (!game.story.isEmpty()) {
      for (const act of game.story.acts) {
        if (act.owner === player) {
          amt += 1
        }
      }
    }

    return amt === 4 ? 0 : this.cost
  }
}
const excess = new Excess({
  name: 'Excess',
  id: 46,
  cost: 7,
  points: 7,
  text: 'Costs 0 if you have exactly 4 cards in the story.',
})

class FishingBoat extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)

    for (let i = 0; i < 3; i++) {
      game.tutor(1, player)
    }
  }
}
const fishingBoat = new FishingBoat({
  name: 'Fishing Boat',
  id: 32,
  cost: 2,
  points: 1,
  text: 'Draw 3 cards that each cost 1.',
})

class Drown extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)
    this.mill(3, game, player)
  }
}
const drown = new Drown({
  name: 'Drown',
  id: 5,
  cost: 1,
  points: 1,
  text: 'Discard the top 3 cards of your deck.',
})

class Iceberg extends Card {
  getCost(player: number, game: GameModel) {
    return Math.max(0, this.cost - game.amtPasses[player])
  }

  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)
    game.draw(player, 2)
  }
}
const iceberg = new Iceberg({
  name: 'Iceberg',
  id: 54,
  cost: 4,
  points: 2,
  text: 'Draw 2 cards.\nCosts 1 less for each time you’ve passed this round.',
})

class Dew extends Card {
  onMorning(player: number, game: GameModel, index: number) {
    game.create(player, dew)
    return true
  }
}
const dew = new Dew({
  name: 'Dew',
  id: 63,
  cost: 1,
  points: 1,
  text: 'Morning: create a Dew in your hand.',
  story: 'I return\nOver and over again\nSwelling the future',
  keywords: [{ name: Keywords.morning, x: 0, y: 102 }],
})

class GentleRain extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus)

    const amt = game.amtDrawn[player]

    this.nourish(amt, game, player)
  }
}
const gentleRain = new GentleRain({
  name: 'Gentle Rain',
  id: 71,
  cost: 4,
  points: 2,
  text: "Nourish 1 for each card you've drawn this round.",
  keywords: [{ name: Keywords.nourish, x: -32, y: 88, value: 1 }],
})

// BETA
class Refresh extends Card {
  onPlay(player: number, game: GameModel): void {
    if (game.hand[player].length > 0) {
      const card = game.hand[player].shift()
      game.deck[player].unshift(card)
      game.draw(player, 1)
    }
  }
}
const refresh = new Refresh({
  name: 'Refresh',
  id: 200,
  cost: 1,
  points: 1,
  text: 'When played, put the leftmost card in your hand on the bottom of your deck, then draw a card if you did. Your opponent doesn’t see you do this.',
})

class Overflow extends Card {
  play(player: number, game: GameModel, index: number, bonus: number) {
    super.play(player, game, index, bonus + game.hand[player].length)
  }

  onPlay(player: number, game: GameModel): void {
    if (game.hand[player].length > 0) {
      const card = game.hand[player].shift()
      game.deck[player].unshift(card)
      game.draw(player, 1)
    }
  }
}
const overflow = new Overflow({
  name: 'Overflow',
  id: 201,
  cost: 3,
  text: 'Refresh.\nWorth +1 for each card in your hand.',
})

class Fish extends Card {
  onDraw(player: number, game: GameModel): void {
    // Create a new copy of the card, but with 1 more point
    const copy = Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this),
    )
    copy.points += 1

    game.hand[player][game.hand[player].length - 1] = copy
  }
}
const fish = new Fish({
  name: 'Fish',
  id: 202,
  cost: 2,
  points: 1,
  text: 'When you draw this, increase its points by 1 permanently.',
})

export {
  mercy,
  excess,
  fishingBoat,
  drown,
  iceberg,
  dew,
  gentleRain,
  refresh,
  overflow,
  fish,
}
