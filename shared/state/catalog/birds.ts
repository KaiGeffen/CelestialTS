import Card from '../card'
import { Status, Quality } from '../effects'

class Dove extends Card {
  play(player, game, index, bonus) {
    // game.sound_effect = SoundEffect.Bird
    super.play(player, game, index, bonus)
  }
}

const dove = new Dove({
  name: 'Dove',
  cost: 1,
  points: 1,
  qualities: [Quality.VISIBLE, Quality.FLEETING],
  id: 4,
})

class Starling extends Card {
  play(player, game, index, bonus) {
    if (!game.story.isEmpty()) {
      if (game.story.acts[0].card.cost === 1) {
        bonus += 1
      }
    }
    super.play(player, game, index, bonus)
  }

  ratePlay(world) {
    let value = 2
    // TODO
    return value
  }
}

const starling = new Starling({
  name: 'Starling',
  cost: 2,
  points: 2,
  qualities: [Quality.VISIBLE, Quality.FLEETING],
  id: 7,
})

class SecretaryBird extends Card {
  play(player, game, index, bonus) {
    let amt = 0
    for (let card of game.hand[player]) {
      if (card.cost <= 1) {
        amt += 1
      }
    }
    super.play(player, game, index, bonus + amt)
    this.oust(amt, game, player)
  }
}

const secretaryBird = new SecretaryBird({
  name: 'Secretary Bird',
  cost: 4,
  points: 4,
  qualities: [Quality.VISIBLE],
  id: 40,
})

class Phoenix extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.create(dove, game, player)
  }
}

const phoenix = new Phoenix({
  name: 'Phoenix',
  cost: 5,
  points: 5,
  qualities: [Quality.VISIBLE, Quality.FLEETING],
  id: 51,
})

class Heron extends Card {
  play(player, game, index, bonus) {
    super.play(player, game, index, bonus)
    this.reset(game)
  }

  getCost(player, game) {
    return this.cost + game.pile[player].length
  }

  ratePlay(world) {
    return this.rateReset(world)
  }
}

const heron = new Heron({
  name: 'Heron',
  cost: 1,
  points: 0,
  qualities: [Quality.VISIBLE],
  id: 65,
})

export { dove, starling, secretaryBird, phoenix, heron }
