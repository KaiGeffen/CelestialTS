import { Card } from '../card'
import { Status, Quality } from '../effects'

// TODO Water
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
const mercy = new Mercy({ name: 'Mercy', cost: 3, points: 3, id: 12 })

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
const excess = new Excess({ name: 'Excess', cost: 7, points: 7, id: 46 })

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
})

class Drown extends Card {
  play(player: any, game: any, index: number, bonus: any) {
    // game.soundEffect = SoundEffect.Drown;
    super.play(player, game, index, bonus)
    this.mill(3, game, player)
  }
}
const drown = new Drown({ name: 'Drown', cost: 1, points: 1, id: 5 })

class Iceberg extends Card {
  getCost(player: any, game: any) {
    return Math.max(0, this.cost - game.amtPasses[player])
  }

  play(player: any, game: any, index: number, bonus: any) {
    super.play(player, game, index, bonus)
    this.draw(2, game, player)
  }
}
const iceberg = new Iceberg({ name: 'Iceberg', cost: 4, points: 2, id: 54 })

class Dew extends Card {
  morning(player: any, game: any, index: number) {
    super.create(dew, game, player)
    return true
  }
}
const dew = new Dew({ name: 'Dew', cost: 1, points: 1, id: 63 })

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
})

export { mercy, excess, fishingBoat, drown, iceberg, dew, gentleRain }
