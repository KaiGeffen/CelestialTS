import Card from '../card'
import { SightCard } from '../card'
import { Status, Quality } from '../effects'

class Stars extends Card {
  play(player: any, game: any, index: number, bonus: number) {
    super.play(player, game, index, bonus)
    this.inspire(1, game, player)
  }
}
const stars = new Stars({ name: 'Stars', id: 0 })

class Cosmos extends Card {
  play(player: any, game: any, index: number, bonus: number) {
    let amt = 1
    for (const act of game.story.acts) {
      if (act.owner === player) {
        amt += 1
      }
    }
    super.play(player, game, index, bonus)
    this.inspire(amt, game, player)
  }
}
const cosmos = new Cosmos({ name: 'Cosmos', cost: 2, id: 9 })

class NightVision extends SightCard {
  play(player: any, game: any, index: number, bonus: number) {
    super.play(player, game, index, bonus)
    this.tutor(2, game, player)
  }
}
const nightVision = new NightVision(3, {
  name: 'Night Vision',
  cost: 1,
  points: 0,
  id: 28,
})

class Ecology extends Card {
  onPlay(player: any, game: any) {
    game.mana[player] += 10
  }
}
const ecology = new Ecology({ name: 'Ecology', cost: 7, points: 0, id: 44 })

class Sun extends Card {
  morning(player: any, game: any, index: number) {
    super.addMana(2, game, player)
    return true
  }
}
const sun = new Sun({ name: 'Sun', cost: 8, points: 8, id: 56 })

class Moon extends Card {
  morning(player: any, game: any, index: number) {
    let count = 0
    for (let i = index - 1; i >= 0; i--) {
      if (count >= 2) break

      const card = game.pile[player][i]
      if (card.morning(player, game, i)) {
        // game.animations[player].push(
        //   new Animation('Discard', 'Discard', CardCodec.encodeCard(card), {
        //     index: i,
        //     index2: i,
        //   }),
        // )
        count += 1
      }
    }
    return true
  }
}
const moon = new Moon({ name: 'Moon', cost: 5, points: 4, id: 73 })

class Sunflower extends Card {
  play(player: any, game: any, index: number, bonus: number) {
    let points = this.points + bonus
    points += game.status[player].count(Status.NOURISH)
    points -= game.status[player].count(Status.STARVE)

    super.play(player, game, index, bonus)
    this.inspire(points, game, player)
  }
}
const sunflower = new Sunflower({
  name: 'Sunflower',
  cost: 2,
  points: 1,
  id: 69,
})

export { stars, cosmos, nightVision, ecology, sun, moon, sunflower }
