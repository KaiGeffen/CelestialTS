import Card from '../card'
import { Status, Quality } from '../effects'
import { Keywords } from '../keyword'

class Mercy extends Card {
  play(player: any, game: any, index: number, bonus: any) {
    super.play(player, game, index, bonus)

    for (let i = 0; i < 2; i++) {
      this.draw(1, game, i)
    }
  }

  ratePlay(world: any) {
    return 3 + world.oppHand.length / 2 - world.hand.length / 2
  }
}
const mercy = new Mercy({
  name: 'Mercy',
  cost: 3,
  points: 3,
  id: 12,
  text: 'Each player draws a card.',
})

class Excess extends Card {
  getCost(player: any, game: any) {
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
  cost: 7,
  points: 7,
  id: 46,
  text: 'Costs 0 if you have exactly 4 cards in the story.',
})

class FishingBoat extends Card {
  play(player: any, game: any, index: number, bonus: any) {
    super.play(player, game, index, bonus)

    for (let i = 0; i < 3; i++) {
      this.tutor(1, game, player)
    }
  }
}
const fishingBoat = new FishingBoat({
  name: 'Fishing Boat',
  cost: 2,
  points: 1,
  id: 32,
  text: 'Draw 3 cards that each cost 1.',
})

class Drown extends Card {
  play(player: any, game: any, index: number, bonus: any) {
    // game.soundEffect = SoundEffect.Drown;
    super.play(player, game, index, bonus)
    this.mill(3, game, player)
  }
}
const drown = new Drown({
  name: 'Drown',
  cost: 1,
  points: 1,
  id: 5,
  text: 'Discard the top 3 cards of your deck.',
})

class Iceberg extends Card {
  getCost(player: any, game: any) {
    return Math.max(0, this.cost - game.amtPasses[player])
  }

  play(player: any, game: any, index: number, bonus: any) {
    super.play(player, game, index, bonus)
    this.draw(2, game, player)
  }
}
const iceberg = new Iceberg({
  name: 'Iceberg',
  cost: 4,
  points: 2,
  id: 54,
  text: 'Draw 2 cards.\nCosts 1 less for each time you’ve passed this round.',
})

class Dew extends Card {
  morning(player: any, game: any, index: number) {
    super.create(dew, game, player)
    return true
  }
}
const dew = new Dew({
  name: 'Dew',
  cost: 1,
  points: 1,
  id: 63,
  text: 'Morning: create a Dew in your hand.',
  story: 'I return\nOver and over again\nSwelling the future',
  keywords: [{ name: Keywords.morning, x: 0, y: 102 }],
})

class GentleRain extends Card {
  play(player: any, game: any, index: number, bonus: any) {
    super.play(player, game, index, bonus)

    const amt = game.amtDrawn[player]

    this.nourish(amt, game, player)
  }
}
const gentleRain = new GentleRain({
  name: 'Gentle Rain',
  cost: 4,
  points: 2,
  id: 71,
  text: "Nourish 1 for each card you've drawn this round.",
  keywords: [{ name: Keywords.nourish, x: -32, y: 88, value: 1 }],
})

export { mercy, excess, fishingBoat, drown, iceberg, dew, gentleRain }
